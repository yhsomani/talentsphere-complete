# TalentSphere — DATABASE.md v6.0

> **Status: target model for §3.** Measured 2026-10-21 across the 51 migration files: **111 distinct `CREATE TABLE` names** and 130 `ENABLE ROW LEVEL SECURITY` statements. That does not match the 50 canonical tables or the roughly 220 tables in §3.2. Neither statement counts nor this document verify per-table grants/RLS coverage. Selected database tests exist; they were not executed in the current audit.

## 1. Authority

PostgreSQL is the intended system of record for relational state. SQL migrations are authoritative for schema, but many API modules still use process-local state. A migrated table does not prove its feature uses it. Current SQL store coverage is recorded in the root [architecture](../../ARCHITECTURE.md) and [audit](../reports/FEATURE_STATUS_2026-10-21.md).

## 2. Data Rules

- explicit PK/FK/unique/check constraints;
- transaction boundaries for state transitions;
- UTC timestamps + timezone context;
- integer minor units + ISO currency;
- version/concurrency fields where needed;
- append-only audit/event lineage where required;
- RLS and grants designed together;
- storage lifecycle separated from relational lifecycle.

## 3. Canonical Domain Data Model

### 3.1 Canonical logical core schema + operational extensions — LOCKED

| # | Table | Domain |
|---|---|---|
| 1 | `profiles` | Profile |
| 2 | `profile_skills` | Profile |
| 2a | `user_profiles` | Profile (1:1) |
| 2b | `user_settings` | Profile (1:1) |
| 3 | `profile_experience` | Profile |
| 4 | `profile_education` | Profile |
| 5 | `profile_portfolios` | Profile |
| 6 | `resumes` | Profile |
| 7 | `organizations` | Organizations |
| 8 | `org_memberships` | Organizations |
| 9 | `jobs` | Jobs |
| 10 | `job_skills` | Jobs |
| 11 | `job_applications` | Applications |
| 12 | `application_status_events` | Applications |
| 13 | `scorecards` | Applications |
| 14 | `offers` | Applications |
| 15 | `requisitions` | Jobs |
| 16 | `courses` | Learning |
| 17 | `course_modules` | Learning |
| 18 | `course_enrollments` | Learning |
| 19 | `module_progress` | Learning |
| 20 | `course_reviews` | Learning |
| 21 | `challenges` | Assessment |
| 22 | `challenge_submissions` | Assessment |
| 23 | `badges` | Gamification |
| 24 | `user_badges` | Gamification |
| 25 | `xp_transactions` | Gamification |
| 26 | `leaderboards` | Gamification |
| 27 | `messages` | Messaging |
| 28 | `message_threads` | Messaging |
| 29 | `thread_participants` | Messaging |
| 30 | `connections` | Social |
| 31 | `feed_activities` | Social |
| 32 | `notifications` | Messaging |
| 33 | `subscriptions` | Billing |
| 34 | `invoices` | Billing |
| 35 | `entitlements` | Billing |
| 36 | `payment_methods` | Billing |
| 37 | `billing_events` | Billing |
| 38 | `reports` | Moderation |
| 39 | `moderation_flags` | Moderation |
| 40 | `audit_logs` | Admin |
| 41 | `feature_flags` | Admin |
| 42 | `platform_config` | Admin |
| 43 | `ai_audit_log` | Admin |
| 44 | `saved_jobs` | Marketplace |
| 45 | `saved_searches` | Marketplace |
| 46 | `job_alerts` | Marketplace |
| 47 | `email_templates` | Admin |
| 48 | `system_announcements` | Admin |
| 49 | `mentorship_relationships` | Social |
| 50 | `course_cohorts` | Learning |

**Canonical invariants:** Every table has RLS enabled · UUID primary keys · `created_at`/`updated_at` audit columns · soft delete where applicable.

### 3.2 Operational Clusters (Non-Canonical, ~185 tables)

| Cluster | Count | Examples |
|---|---|---|
| Journey | 20 | connection_requests, skill_endorsements, job_referrals, career_roadmaps, cohorts, cohort_members, cohort_curriculum, payout_profiles, creator_payouts, mentor_profiles, mentorship_sessions, mentorship_notes, mentor_reviews, institutional_showcases, agency_client_contracts, agency_placements, agency_invoices, job_trackers, course_challenges, talent_pool |
| OS layer | 27+4 | workspaces, saved_workspace_layouts, workspace_widgets, user_tasks, os_objects, os_object_links, os_tags, os_bookmarks, os_favorites, os_history, knowledge_graph_nodes, knowledge_graph_edges, domain_events, event_subscriptions, workbench_boards, automation_rules, automation_runs, journey_instances, interventions, liquidity_signals, data_quality_findings, agents, agent_runs, agent_memory, device_trust, session_risk_scores, fraud_cases, audit_findings + os_clipboard_items, os_undo_log, os_mentions, notification_center_events |
| Institutional | 12 | departments, batches, batch_memberships, license_pools, license_assignments, purchase_requests, procurement_orders, institutional_courses, certificates, organization_invitations, import_batches, student_consent_records |
| Media | 10 | content_items, media_sources, media_assets, media_versions, playlist_sources, playlist_items, media_progress, media_events, media_provider_configs, media_health_checks |
| Migration/LinkedIn | 5 | migration_jobs, migration_import_batches, imported_records, migration_consents, external_identity_references |
| Learning marketplace | 27 | course_categories, course_versions, lessons, lesson_resources, quizzes, quiz_questions, quiz_attempts, assignments, assignment_submissions, peer_reviews, course_qna, course_qna_replies, course_discussions, course_discussion_replies, lesson_notes, lesson_bookmarks, course_wishlist, course_announcements, learning_paths, learning_path_courses, learning_path_enrollments, path_progress, course_pricing, coupons, coupon_redemptions, course_orders, instructor_earnings |
| Social/content | 24 | follows, posts, post_media, comments, reactions, reposts, bookmarks, hashtags, post_hashtags, mentions, polls, poll_votes, articles, article_versions, newsletters, newsletter_issues, newsletter_subscriptions, post_analytics, feed_ranking_signals, muted_accounts, communities, community_memberships, community_moderation_log, profile_views |
| Profile expansion | 11 | profile_media, career_signals, profile_certifications, profile_achievements, profile_publications, profile_test_scores, profile_volunteer, profile_languages, profile_interests, experience_media, identity_verifications |
| Recommendations/outreach/pools | 5 | written_recommendations, outreach_credits, outreach_messages, talent_pools, talent_pool_members |
| Pages/events | 6 | organization_pages, showcase_pages, events, event_speakers, event_rsvps, event_updates |
| Employer insights | 6 | company_reviews, company_review_ratings, salary_reports, interview_experiences, interview_questions, company_responses |
| Contests/certification | 9 | coding_contests, contest_problems, contest_registrations, contest_submissions, contest_leaderboard, skill_certifications, certification_attempts, practice_problems, problem_discussions |
| Commerce ops | 2 | refunds, instructor_payouts |

**Effective schema ≈ 220 tables.** The "50 canonical" lock refers only to the baseline cluster; count is fixed by migrations and verified by VER-002.

## 4. RLS

### 4.1 RLS Policy Model (ADR-010)

**Policy Categories:**

| Category | Pattern |
|---|---|
| Own-row | `auth.uid() = user_id` |
| Org-scoped | Membership subquery on `org_memberships` |
| Application-scoped | `auth.uid() = applicant_id OR recruiter_for_job(job_id)` |
| Public-read | Always true for SELECT on published records |
| Admin-all | `auth.jwt()->>'role' = 'ROLE_ADMIN'` |
| Deny-by-default | No matching policy → access denied |

**Generator Model:**

```
generate_tenant_rls_policy(table, tenant_column, owner_column, is_public_read)
```

Creates admin-override, owner, org-member, and optional public-read policies. Helpers: `auth_is_admin()`, `auth_is_org_member(org)`, `auth_is_owner(user)`.

**RLS Fuzzing (CI Gate):** On every migration: create Tenant A/B users + orgs, seed rows, assert cross-tenant SELECT returns 0 rows, cross-tenant UPDATE/DELETE fails, owner-only tables deny non-owners, public-read tables expose no PII. Blocks merge on any failure.

---

---

RLS is a defense-in-depth database boundary. Application authorization remains mandatory.

## 15–22, §31–§32. Security, privacy, AI, assessment, matching, PWA, performance, testing, deployment (moved)

These sections are canonical in [`SSOT.md`](../../SSOT.md), Part VII. An earlier copy here was out of date (its salary-cell threshold said k ≥5 where SSOT says k ≥10) and was removed on 2026-10-21 so that each topic has one authority. Database-specific rules stay in this file (§1–§8).

## 5. Data Lifecycle

```text
CREATE → ACTIVE → ARCHIVE / DEACTIVATE → DELETE / ANONYMIZE
```

Legal hold and audit retention may override normal deletion.

## 6. Evidence

Evidence lineage is immutable in meaning. Corrections create new versions/events.

## 7. Concurrency

Use optimistic concurrency and explicit conflict policy for user-editable critical data.

## 8. Migration

Every migration must define:
- purpose;
- forward change;
- affected data;
- index impact;
- RLS impact;
- verification;
- rollback/forward-fix strategy;
- release ordering.

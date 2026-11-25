# Test Coverage Map (Branch 18)

> **A test file referencing a route or function is not evidence that the feature works.** Matching is textual: a test is linked to an endpoint when its source contains the endpoint path (with `:param` as a wildcard) near a matching HTTP-method marker; it is linked to a rule when it names the function. The suites were **executed on 2026-11-25** at commit `5d67317` in a throwaway copy of the tracked files (so no protected file in the repository was written); results are in [EXECUTION_RESULTS.json](EXECUTION_RESULTS.json). A passing linked test raises a node to `HIGH` confidence, but the link itself stays path-level.

## 0. Execution results

| Suite     | Files | Tests | Passed | Failed | Skipped | Command                                                                                                           |
| --------- | ----- | ----- | ------ | ------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| vitest    | 146   | 1571  | 1571   | 0      | 0       | vitest run (root config: unit, integration, security) after pnpm build, in a throwaway copy of the tracked files  |
| vitest-pg | 15    | 66    | 66     | 0      | 0       | vitest run --config vitest.pg.config.ts against a local PostgreSQL 16 cluster (TEST_DATABASE_URL), throwaway copy |
| node-test | 1     | 5     | 5      | 0      | 0       | node --test scripts/tests/migration-integrity.test.mjs (as in ci.yml), throwaway copy                             |
| e2e       | 61    | 265   | 265    | 0      | 0       | playwright test --trace off (Chromium; API + Vite preview webServers from playwright.config.ts), throwaway copy   |

| Other check                             | Result | Detail                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm build (all packages and apps)      | PASS   | needed before the integration tests and e2e, which import compiled workspace packages                                                                                                                                                                                                                                                                    |
| pnpm typecheck (tsc -b && tsc -p tests) | PASS   | run in the throwaway copy, where its emitted files are discarded                                                                                                                                                                                                                                                                                         |
| pnpm lint (prettier --check)            | FAIL   | 230 files unformatted: 199 in Yash_Final_Project_Document/, 25 tracked .omc/ agent-state JSON files (root, apps/web, deploy/oracle), 4 in PRODUCT_BLUEPRINT/, plus .claude/launch.json and tests/security/injection-defenses.test.ts. Lint is the first check step in .github/workflows/ci.yml, so CI on main stops there and the later steps never run. |

Failing test files: none. Test files in the repository with no result: none. Static `it/test` counts differ from executed counts where a test is generated in a loop or a file is excluded by the runner's config.

<details><summary>Per-file results</summary>

| Test file                                                | Runner     | Passed | Failed | Skipped | Static case count |
| -------------------------------------------------------- | ---------- | ------ | ------ | ------- | ----------------- |
| tests/unit/activity-contributions-domain.test.ts         | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/activity-visibility-domain.test.ts            | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/admin-domain.test.ts                          | vitest     | 14     | 0      | 0       | 14                |
| tests/unit/ai-gateway-domain.test.ts                     | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/alumni-networks-domain.test.ts                | vitest     | 21     | 0      | 0       | 21                |
| tests/unit/analytics-domain.test.ts                      | vitest     | 19     | 0      | 0       | 19                |
| tests/unit/api-entry-order.test.ts                       | vitest     | 3      | 0      | 0       | 3                 |
| tests/unit/api-lifecycle.test.ts                         | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/application-drafts-domain.test.ts             | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/application-feedback-domain.test.ts           | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/background-jobs.test.ts                       | vitest     | 20     | 0      | 0       | 20                |
| tests/unit/behavioral-talent-discovery-domain.test.ts    | vitest     | 19     | 0      | 0       | 19                |
| tests/unit/billing-domain.test.ts                        | vitest     | 19     | 0      | 0       | 19                |
| tests/unit/billing-grants-migration.test.ts              | vitest     | 6      | 0      | 0       | 2                 |
| tests/unit/career-trajectory-domain.test.ts              | vitest     | 20     | 0      | 0       | 20                |
| tests/unit/certificate-revocations-rls-migration.test.ts | vitest     | 3      | 0      | 0       | 3                 |
| tests/unit/certificate-verification-domain.test.ts       | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/challenges-assessment-domain.test.ts          | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/contracts-url.test.ts                         | vitest     | 16     | 0      | 0       | 5                 |
| tests/unit/database-migrations.test.ts                   | vitest     | 32     | 0      | 0       | 32                |
| tests/unit/email/architecture.test.ts                    | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/email/brevo.test.ts                           | vitest     | 9      | 0      | 0       | 1                 |
| tests/unit/email/service.test.ts                         | vitest     | 14     | 0      | 0       | 14                |
| tests/unit/employer-reputation-domain.test.ts            | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/evidence-skills-domain.test.ts                | vitest     | 20     | 0      | 0       | 20                |
| tests/unit/feature-flag-store.test.ts                    | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/foundation.test.ts                            | vitest     | 15     | 0      | 0       | 15                |
| tests/unit/gamification-domain.test.ts                   | vitest     | 15     | 0      | 0       | 15                |
| tests/unit/instructor-reputation-domain.test.ts          | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/job-templates-domain.test.ts                  | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/jobs-applications-domain.test.ts              | vitest     | 12     | 0      | 0       | 12                |
| tests/unit/learning-impact-domain.test.ts                | vitest     | 9      | 0      | 0       | 9                 |
| tests/unit/lms-domain.test.ts                            | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/login-throttle-domain.test.ts                 | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/messaging-domain.test.ts                      | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/migration-references.test.ts                  | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/moderation-domain.test.ts                     | vitest     | 23     | 0      | 0       | 23                |
| tests/unit/networking-domain.test.ts                     | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/notifications-domain.test.ts                  | vitest     | 9      | 0      | 0       | 9                 |
| tests/unit/password-hashing.test.ts                      | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/peer-credibility-domain.test.ts               | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/persistence-honesty.test.ts                   | vitest     | 12     | 0      | 0       | 12                |
| tests/unit/plan-limits-domain.test.ts                    | vitest     | 12     | 0      | 0       | 9                 |
| tests/unit/portfolio-domain.test.ts                      | vitest     | 10     | 0      | 0       | 10                |
| tests/unit/pricing-consistency.test.ts                   | vitest     | 5      | 0      | 0       | 5                 |
| tests/unit/private-data-rls-hardening.test.ts            | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/production-config.test.ts                     | vitest     | 27     | 0      | 0       | 23                |
| tests/unit/profile-visibility.test.ts                    | vitest     | 30     | 0      | 0       | 3                 |
| tests/unit/rate-limit-config.test.ts                     | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/referral-requests-domain.test.ts              | vitest     | 12     | 0      | 0       | 12                |
| tests/unit/reputation-engine-domain.test.ts              | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/resumes-domain.test.ts                        | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/salary-intelligence-domain.test.ts            | vitest     | 8      | 0      | 0       | 8                 |
| tests/unit/saved-searches-domain.test.ts                 | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/search-domain.test.ts                         | vitest     | 26     | 0      | 0       | 26                |
| tests/unit/session-ended-reason.test.ts                  | vitest     | 3      | 0      | 0       | 3                 |
| tests/unit/settings-contract.test.ts                     | vitest     | 17     | 0      | 0       | 1                 |
| tests/unit/settings-domain.test.ts                       | vitest     | 15     | 0      | 0       | 15                |
| tests/unit/skill-decay-domain.test.ts                    | vitest     | 5      | 0      | 0       | 5                 |
| tests/unit/skill-forecasting-domain.test.ts              | vitest     | 12     | 0      | 0       | 12                |
| tests/unit/stripe-billing-domain.test.ts                 | vitest     | 23     | 0      | 0       | 15                |
| tests/unit/stripe-event-processing.test.ts               | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/stripe-gateway.test.ts                        | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/subscription-lifecycle-edge.test.ts           | vitest     | 19     | 0      | 0       | 19                |
| tests/unit/talent-pool-intelligence-domain.test.ts       | vitest     | 18     | 0      | 0       | 18                |
| tests/unit/talent-segmentation-domain.test.ts            | vitest     | 31     | 0      | 0       | 31                |
| tests/unit/technical-interview-domain.test.ts            | vitest     | 13     | 0      | 0       | 13                |
| tests/unit/warm-introductions-domain.test.ts             | vitest     | 16     | 0      | 0       | 16                |
| tests/unit/web-api-json.test.ts                          | vitest     | 11     | 0      | 0       | 11                |
| tests/unit/web-career.test.ts                            | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/web-course.test.ts                            | vitest     | 7      | 0      | 0       | 7                 |
| tests/unit/web-domain-mirrors.test.ts                    | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/web-format.test.ts                            | vitest     | 6      | 0      | 0       | 6                 |
| tests/unit/web-idempotency.test.ts                       | vitest     | 2      | 0      | 0       | 2                 |
| tests/unit/web-landing-art.test.ts                       | vitest     | 1      | 0      | 0       | 1                 |
| tests/unit/web-settings-controls.test.ts                 | vitest     | 4      | 0      | 0       | 4                 |
| tests/unit/web-shell.test.ts                             | vitest     | 5      | 0      | 0       | 5                 |
| tests/unit/work-history-graph-domain.test.ts             | vitest     | 39     | 0      | 0       | 39                |
| tests/unit/worker-claim.test.ts                          | vitest     | 21     | 0      | 0       | 21                |
| tests/unit/worker-loop.test.ts                           | vitest     | 3      | 0      | 0       | 3                 |
| tests/unit/worker-queue.test.ts                          | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/activity-contributions.test.ts         | vitest     | 12     | 0      | 0       | 12                |
| tests/integration/admin.test.ts                          | vitest     | 9      | 0      | 0       | 9                 |
| tests/integration/ai-gateway.test.ts                     | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/alumni-networks.test.ts                | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/analytics.test.ts                      | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/api-server.test.ts                     | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/application-drafts.test.ts             | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/application-feedback.test.ts           | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/auth-profile.test.ts                   | vitest     | 9      | 0      | 0       | 9                 |
| tests/integration/behavioral-talent-discovery.test.ts    | vitest     | 14     | 0      | 0       | 14                |
| tests/integration/billing.test.ts                        | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/career-trajectory.test.ts              | vitest     | 13     | 0      | 0       | 13                |
| tests/integration/certificate-verification.test.ts       | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/challenges-assessment.test.ts          | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/connection-privacy.test.ts             | vitest     | 2      | 0      | 0       | 2                 |
| tests/integration/core-notifications.test.ts             | vitest     | 8      | 0      | 0       | 8                 |
| tests/integration/email-budget-race.test.ts              | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/email-delivery-gate.test.ts            | vitest     | 2      | 0      | 0       | 0                 |
| tests/integration/employer-reputation.test.ts            | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/erasure-ephemeral.test.ts              | vitest     | 8      | 0      | 0       | 8                 |
| tests/integration/erasure-resume.test.ts                 | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/evidence-skills.test.ts                | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/evidence-visibility.test.ts            | vitest     | 8      | 0      | 0       | 8                 |
| tests/integration/gamification.test.ts                   | vitest     | 9      | 0      | 0       | 9                 |
| tests/integration/instructor-reputation.test.ts          | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/job-observability.test.ts              | vitest     | 3      | 0      | 0       | 3                 |
| tests/integration/job-templates.test.ts                  | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/jobs-applications.test.ts              | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/learning-impact.test.ts                | vitest     | 12     | 0      | 0       | 12                |
| tests/integration/lms-courses.test.ts                    | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/messaging-rules.test.ts                | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/messaging.test.ts                      | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/moderation.test.ts                     | vitest     | 21     | 0      | 0       | 21                |
| tests/integration/networking.test.ts                     | vitest     | 9      | 0      | 0       | 9                 |
| tests/integration/notifications.test.ts                  | vitest     | 5      | 0      | 0       | 5                 |
| tests/integration/peer-credibility.test.ts               | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/plan-enforcement.test.ts               | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/portfolio.test.ts                      | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/referral-requests.test.ts              | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/reputation-engine.test.ts              | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/reputation-visibility.test.ts          | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/resumes.test.ts                        | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/review-r2-regressions.test.ts          | vitest     | 4      | 0      | 0       | 4                 |
| tests/integration/route-coverage-gaps.test.ts            | vitest     | 8      | 0      | 0       | 8                 |
| tests/integration/route-trust-flags.test.ts              | vitest     | 3      | 0      | 0       | 3                 |
| tests/integration/salary-intelligence.test.ts            | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/saved-searches.test.ts                 | vitest     | 13     | 0      | 0       | 13                |
| tests/integration/search.test.ts                         | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/settings.test.ts                       | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/skill-decay.test.ts                    | vitest     | 6      | 0      | 0       | 6                 |
| tests/integration/skill-forecasting.test.ts              | vitest     | 10     | 0      | 0       | 10                |
| tests/integration/storage-boot.test.ts                   | vitest     | 2      | 0      | 0       | 2                 |
| tests/integration/stripe-billing.test.ts                 | vitest     | 27     | 0      | 0       | 27                |
| tests/integration/talent-pool-intelligence.test.ts       | vitest     | 11     | 0      | 0       | 11                |
| tests/integration/talent-segmentation.test.ts            | vitest     | 14     | 0      | 0       | 14                |
| tests/integration/technical-interview.test.ts            | vitest     | 7      | 0      | 0       | 7                 |
| tests/integration/warm-introductions.test.ts             | vitest     | 8      | 0      | 0       | 8                 |
| tests/integration/work-history-graph.test.ts             | vitest     | 39     | 0      | 0       | 39                |
| tests/integration/work-history-removal.test.ts           | vitest     | 5      | 0      | 0       | 5                 |
| tests/security/api-security.test.ts                      | vitest     | 44     | 0      | 0       | 41                |
| tests/security/core-authz.test.ts                        | vitest     | 31     | 0      | 0       | 31                |
| tests/security/injection-defenses.test.ts                | vitest     | 23     | 0      | 0       | 23                |
| tests/security/private-data-rls.test.ts                  | vitest     | 5      | 0      | 0       | 5                 |
| tests/security/route-authz-sweep.test.ts                 | vitest     | 8      | 0      | 0       | 8                 |
| tests/security/session-sign-out.test.ts                  | vitest     | 7      | 0      | 0       | 7                 |
| tests/pg/admin-audit.test.ts                             | vitest-pg  | 3      | 0      | 0       | 3                 |
| tests/pg/analytics-consent.test.ts                       | vitest-pg  | 2      | 0      | 0       | 2                 |
| tests/pg/billing.test.ts                                 | vitest-pg  | 8      | 0      | 0       | 8                 |
| tests/pg/concurrency.test.ts                             | vitest-pg  | 8      | 0      | 0       | 8                 |
| tests/pg/core-persistence.test.ts                        | vitest-pg  | 11     | 0      | 0       | 11                |
| tests/pg/erasure-concurrency.test.ts                     | vitest-pg  | 5      | 0      | 0       | 5                 |
| tests/pg/feature-flags.test.ts                           | vitest-pg  | 3      | 0      | 0       | 3                 |
| tests/pg/job-claim-fencing.test.ts                       | vitest-pg  | 4      | 0      | 0       | 4                 |
| tests/pg/messaging.test.ts                               | vitest-pg  | 5      | 0      | 0       | 5                 |
| tests/pg/notifications.test.ts                           | vitest-pg  | 4      | 0      | 0       | 4                 |
| tests/pg/private-data-rls.test.ts                        | vitest-pg  | 5      | 0      | 0       | 5                 |
| tests/pg/saved-jobs.test.ts                              | vitest-pg  | 1      | 0      | 0       | 1                 |
| tests/pg/saved-searches.test.ts                          | vitest-pg  | 1      | 0      | 0       | 1                 |
| tests/pg/work-history-removal.test.ts                    | vitest-pg  | 3      | 0      | 0       | 3                 |
| tests/pg/writer-lease.test.ts                            | vitest-pg  | 3      | 0      | 0       | 3                 |
| tests/e2e/accessibility.spec.ts                          | playwright | 17     | 0      | 0       | 22                |
| tests/e2e/account-deletion.spec.ts                       | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/account-security.spec.ts                       | playwright | 3      | 0      | 0       | 3                 |
| tests/e2e/activity-contributions.spec.ts                 | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/alumni-networks.spec.ts                        | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/analytics.spec.ts                              | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/application-drafts.spec.ts                     | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/application-feedback.spec.ts                   | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/assessment-lms.spec.ts                         | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/auth-profile.spec.ts                           | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/behavioral-talent-discovery.spec.ts            | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/career-readiness.spec.ts                       | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/career-trajectory.spec.ts                      | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/certificate-verification.spec.ts               | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/challenges.spec.ts                             | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/checkout-idempotency.spec.ts                   | playwright | 1      | 0      | 0       | 1                 |
| tests/e2e/core-loop.spec.ts                              | playwright | 7      | 0      | 0       | 7                 |
| tests/e2e/credentials.spec.ts                            | playwright | 5      | 0      | 0       | 6                 |
| tests/e2e/employer-reputation.spec.ts                    | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/evidence-skills.spec.ts                        | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/frontend-fixes.spec.ts                         | playwright | 6      | 0      | 0       | 6                 |
| tests/e2e/gamification-billing-admin-search.spec.ts      | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/hostile-user.spec.ts                           | playwright | 7      | 0      | 0       | 10                |
| tests/e2e/instructor-reputation.spec.ts                  | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/job-templates.spec.ts                          | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/jobs-applications.spec.ts                      | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/learning-impact.spec.ts                        | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/learning-page.spec.ts                          | playwright | 1      | 0      | 0       | 2                 |
| tests/e2e/lesson-player.spec.ts                          | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/messaging-notifications-ai.spec.ts             | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/messaging.spec.ts                              | playwright | 1      | 0      | 0       | 1                 |
| tests/e2e/moderation.spec.ts                             | playwright | 5      | 0      | 0       | 6                 |
| tests/e2e/mutation-feedback.spec.ts                      | playwright | 14     | 0      | 0       | 18                |
| tests/e2e/navigation.spec.ts                             | playwright | 10     | 0      | 0       | 14                |
| tests/e2e/network-page.spec.ts                           | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/notifications.spec.ts                          | playwright | 3      | 0      | 0       | 3                 |
| tests/e2e/peer-credibility.spec.ts                       | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/performance.spec.ts                            | playwright | 4      | 0      | 0       | 8                 |
| tests/e2e/portfolio-resumes.spec.ts                      | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/privacy-contact.spec.ts                        | playwright | 1      | 0      | 0       | 1                 |
| tests/e2e/referral-requests.spec.ts                      | playwright | 5      | 0      | 0       | 6                 |
| tests/e2e/reputation-engine.spec.ts                      | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/responsive.spec.ts                             | playwright | 5      | 0      | 0       | 7                 |
| tests/e2e/restricted-account.spec.ts                     | playwright | 1      | 0      | 0       | 2                 |
| tests/e2e/resumes-networking-portfolio.spec.ts           | playwright | 2      | 0      | 0       | 3                 |
| tests/e2e/salary-intelligence.spec.ts                    | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/saved-searches-alerts.spec.ts                  | playwright | 3      | 0      | 0       | 4                 |
| tests/e2e/session-resilience.spec.ts                     | playwright | 1      | 0      | 0       | 1                 |
| tests/e2e/settings-page.spec.ts                          | playwright | 5      | 0      | 0       | 6                 |
| tests/e2e/skill-decay.spec.ts                            | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/skill-forecasting.spec.ts                      | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/skills-graph.spec.ts                           | playwright | 1      | 0      | 0       | 2                 |
| tests/e2e/talent-pool-intelligence.spec.ts               | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/talent-segmentation.spec.ts                    | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/technical-interview.spec.ts                    | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/ui-sweep.spec.ts                               | playwright | 13     | 0      | 0       | 8                 |
| tests/e2e/unified-search.spec.ts                         | playwright | 4      | 0      | 0       | 5                 |
| tests/e2e/warm-introductions.spec.ts                     | playwright | 5      | 0      | 0       | 6                 |
| tests/e2e/web-ui.spec.ts                                 | playwright | 8      | 0      | 0       | 9                 |
| tests/e2e/work-history-graph.spec.ts                     | playwright | 6      | 0      | 0       | 7                 |
| tests/e2e/work-history-removal.spec.ts                   | playwright | 1      | 0      | 0       | 1                 |
| scripts/tests/migration-integrity.test.mjs               | node-test  | 5      | 0      | 0       | 5                 |

</details>

## 1. Test inventory

| Category          | Files | Test cases (it/test) |
| ----------------- | ----- | -------------------- |
| scripts/tests     | 1     | 5                    |
| tests/e2e         | 61    | 327                  |
| tests/integration | 59    | 518                  |
| tests/pg          | 15    | 66                   |
| tests/security    | 6     | 115                  |
| tests/unit        | 81    | 852                  |

Total: 223 files, 1883 cases. Skipped/fixme markers: 1 (tests/e2e/hostile-user.spec.ts×1).

CI (`.github/workflows/ci.yml`): steps — Set up pnpm; Set up Node; Install dependencies; Install Playwright Chromium; Lint (Prettier); Typecheck; Unit, integration and security tests; Verify migration history guard; Detect unsafe hosted Supabase migration dependencies; Migrations on a clean database; Verify schema and migration ledger after upgrade; Persistence tests (real PostgreSQL); Build and scan browser bundle for server-only values; End-to-end, accessibility and performance.

## 2. Endpoint coverage (path-level)

- Endpoints referenced by at least one test file: **279/282**.
- **Endpoints with no test reference found (3)**: `GET /api/v1/organizations/mine`, `POST /api/v1/billing/portal [disabled-mode]`, `POST /api/v1/billing/portal`.

| API module    | Endpoints | With a test reference | Web-called | Test-file links |
| ------------- | --------- | --------------------- | ---------- | --------------- |
| activity      | 5         | 5                     | 0          | 10              |
| admin         | 8         | 8                     | 5          | 29              |
| ai            | 6         | 6                     | 1          | 14              |
| alumni        | 11        | 11                    | 0          | 30              |
| analytics     | 3         | 3                     | 0          | 11              |
| applications  | 7         | 7                     | 2          | 32              |
| auth          | 6         | 6                     | 6          | 144             |
| billing       | 12        | 10                    | 4          | 33              |
| candidates    | 8         | 8                     | 6          | 50              |
| career        | 6         | 6                     | 3          | 18              |
| certificates  | 4         | 4                     | 1          | 13              |
| challenges    | 5         | 5                     | 3          | 14              |
| connections   | 6         | 6                     | 3          | 31              |
| courses       | 7         | 7                     | 4          | 28              |
| evidence      | 8         | 8                     | 2          | 40              |
| feature-flags | 1         | 1                     | 0          | 4               |
| feedback      | 1         | 1                     | 0          | 2               |
| gamification  | 5         | 5                     | 0          | 9               |
| health        | 2         | 2                     | 0          | 12              |
| internal      | 1         | 1                     | 0          | 21              |
| interviews    | 13        | 13                    | 0          | 32              |
| job-templates | 6         | 6                     | 0          | 11              |
| jobs          | 22        | 22                    | 6          | 164             |
| learning      | 4         | 4                     | 0          | 10              |
| lessons       | 1         | 1                     | 1          | 6               |
| moderation    | 10        | 10                    | 0          | 35              |
| modules       | 1         | 1                     | 0          | 1               |
| networking    | 8         | 8                     | 0          | 14              |
| notifications | 5         | 5                     | 3          | 25              |
| organizations | 7         | 6                     | 3          | 54              |
| portfolio     | 6         | 6                     | 2          | 12              |
| profile       | 3         | 3                     | 1          | 31              |
| ready         | 1         | 1                     | 0          | 2               |
| recruiter     | 13        | 13                    | 0          | 27              |
| references    | 1         | 1                     | 1          | 8               |
| referrals     | 6         | 6                     | 0          | 16              |
| reputation    | 15        | 15                    | 0          | 34              |
| resumes       | 7         | 7                     | 2          | 19              |
| salaries      | 5         | 5                     | 0          | 13              |
| search        | 5         | 5                     | 1          | 13              |
| settings      | 8         | 8                     | 4          | 43              |
| skills        | 16        | 16                    | 4          | 53              |
| threads       | 5         | 5                     | 4          | 21              |
| verify        | 1         | 1                     | 1          | 5               |
| xp            | 1         | 1                     | 0          | 1               |

## 3. Business-rule coverage (symbol-level)

Domain functions with **no test file naming them** (9/279): this is a name search; a function exercised only through an endpoint test is listed here too.

`verifySessionToken`, `withoutSecrets`, `leaseExpiredError`, `activeJobPostingLimit`, `canSeeEvidenceInternals`, `canTransitionJob`, `updateProfileEntity`, `assertCorporateEmailEligible`, `referenceLinkExpired`

## 4. Screens without an e2e `goto`

/messages/:id, /*

## 5. Journeys per spec

| Spec                 | Journeys |
| -------------------- | -------- |
| accessibility        | 7        |
| account-deletion     | 3        |
| account-security     | 3        |
| career-readiness     | 3        |
| challenges           | 2        |
| checkout-idempotency | 1        |
| core-loop            | 7        |
| credentials          | 5        |
| frontend-fixes       | 6        |
| hostile-user         | 5        |
| learning-page        | 1        |
| lesson-player        | 2        |
| messaging            | 1        |
| mutation-feedback    | 14       |
| navigation           | 9        |
| network-page         | 3        |
| notifications        | 3        |
| performance          | 2        |
| portfolio-resumes    | 2        |
| privacy-contact      | 1        |
| responsive           | 2        |
| restricted-account   | 1        |
| session-resilience   | 1        |
| settings-page        | 5        |
| skills-graph         | 1        |
| ui-sweep             | 1        |
| web-ui               | 8        |
| work-history-removal | 1        |

## 6. What is not measured

No line/branch coverage percentages or mutation scores are measured. Accessibility (`accessibility.spec.ts`) and performance (`performance.spec.ts`) specs are part of the e2e run above; their pass means the asserted budgets held in one headless Chromium run, not a WCAG conformance or load-test result. Live Stripe, Brevo, hosted Supabase and deployment paths are not exercised by any suite. Features with weak evidence are in [implementation gaps](IMPLEMENTATION_GAPS.md).

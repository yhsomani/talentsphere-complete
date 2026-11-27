/**
 * Which API routes are backed by durable storage (ADR-015).
 *
 * The core career loop — identity, profiles, organizations, jobs,
 * applications, evidence and verified work history — persists to Postgres.
 * Every other module still keeps its state in process memory and loses it on
 * restart. That is a fact about the product, so the API states it instead of
 * hiding it: every response from a route NOT listed here carries
 * `x-talentsphere-durability: ephemeral`, and the admin health diagnostics
 * report the split. tests/security/core-authz.test.ts checks every listed
 * route exists; tests/pg/concurrency.test.ts checks the header on a real
 * database (durable route unlabelled, long-tail route labelled).
 *
 * Moving a module to durable storage = route its writes through persist()
 * (apps/api/src/server.ts), add its tables to core-store.ts, then list its
 * routes here.
 */
export const DURABLE_ROUTES: ReadonlySet<string> = new Set([
  // Identity
  'POST /api/v1/auth/register',
  'POST /api/v1/auth/login',
  'GET /api/v1/auth/session',
  'POST /api/v1/auth/password',
  'POST /api/v1/auth/sign-out',
  'POST /api/v1/auth/sign-out-others',
  'POST /api/v1/auth/password-reset/request',
  'POST /api/v1/auth/password-reset/confirm',
  // Uploaded files (ADR-020, migration 00059)
  'POST /api/v1/files',
  'GET /api/v1/files',
  'GET /api/v1/files/:id/url',
  'GET /api/v1/files/:id/content',
  'DELETE /api/v1/files/:id',
  // Profile import v1 (TS-08, ADR-033).
  'POST /api/v1/imports',
  'GET /api/v1/imports',
  'GET /api/v1/imports/templates/:source',
  'GET /api/v1/imports/:id',
  'POST /api/v1/imports/:id/commit',
  'POST /api/v1/imports/:id/undo',
  'DELETE /api/v1/imports/:id',
  'GET /api/v1/profile/me',
  'PATCH /api/v1/profile/me',
  'GET /api/v1/profile/:id',
  // Evidence & skills taxonomy
  'POST /api/v1/evidence',
  'GET /api/v1/evidence/mine',
  'GET /api/v1/evidence/:id',
  'GET /api/v1/evidence/subject/:subjectId',
  'POST /api/v1/evidence/:id/verify',
  'POST /api/v1/evidence/:id/dispute',
  'POST /api/v1/evidence/:id/revoke',
  'GET /api/v1/evidence/:id/verify-public',
  'GET /api/v1/skills',
  'GET /api/v1/skills/profile/me',
  'GET /api/v1/jobs/:id/match',
  'GET /api/v1/goals/mine',
  'PUT /api/v1/goals/mine',
  'DELETE /api/v1/goals/mine',
  'POST /api/v1/skills',
  // Organizations, jobs, applications
  'POST /api/v1/organizations',
  'GET /api/v1/organizations/mine',
  'GET /api/v1/organizations/:id',
  'GET /api/v1/organizations/:id/jobs',
  'POST /api/v1/organizations/:id/members',
  'POST /api/v1/jobs',
  'GET /api/v1/jobs',
  'GET /api/v1/jobs/:id',
  'PATCH /api/v1/jobs/:id/status',
  'POST /api/v1/jobs/:id/apply',
  'GET /api/v1/jobs/:id/applications',
  'GET /api/v1/applications/my',
  'GET /api/v1/applications/:id',
  'POST /api/v1/applications/:id/transition',
  // Verified work history & references
  'POST /api/v1/candidates/work-history',
  'POST /api/v1/candidates/work-history/:id/verify-email',
  'POST /api/v1/candidates/work-history/:id/references/request',
  'POST /api/v1/candidates/work-history/references/:refId/submit',
  'DELETE /api/v1/candidates/work-history/:id',
  'GET /api/v1/references/:refId',
  'GET /api/v1/candidates/:candidateId/work-history',
  'GET /api/v1/candidates/:candidateId/work-history-graph',
  // Messaging (2026-10-11; tables from migration 00006)
  'GET /api/v1/threads',
  'POST /api/v1/threads',
  'GET /api/v1/threads/:id',
  'POST /api/v1/threads/:id/messages',
  'POST /api/v1/threads/:id/read',
  // Notifications (migration 00044)
  'GET /api/v1/notifications',
  'GET /api/v1/notifications/summary',
  'POST /api/v1/notifications/mark-read',
  'GET /api/v1/notifications/preferences',
  'PATCH /api/v1/notifications/preferences',
  // Saved searches (existing migration 00018; SQL is source of truth).
  'POST /api/v1/jobs/saved-searches',
  'GET /api/v1/jobs/saved-searches',
  'GET /api/v1/jobs/saved-searches/:id',
  'PATCH /api/v1/jobs/saved-searches/:id',
  'DELETE /api/v1/jobs/saved-searches/:id',
  'POST /api/v1/jobs/saved-searches/:id/run',
  // Bookmarks (migration 00018; database-enforced owner/job uniqueness).
  'POST /api/v1/jobs/:id/save',
  'DELETE /api/v1/jobs/:id/save',
  'GET /api/v1/jobs/saved',
  // Job alerts raised when a published job matches a saved search (migration 00018).
  'GET /api/v1/jobs/alerts',
  'PATCH /api/v1/jobs/alerts/:id/read',
  // Professional connections (migrations 00010 and 00057).
  'POST /api/v1/connections/request',
  'GET /api/v1/connections',
  'GET /api/v1/connections/status/:targetUserId',
  'POST /api/v1/connections/:id/respond',
  'POST /api/v1/connections/:id/withdraw',
  'DELETE /api/v1/connections/:id',
  // Courses, enrolments, lesson progress and certificates (migrations 00005,
  // 00021, 00062; plan TS-03). /verify/:hash also reads durable evidence.
  'GET /api/v1/courses',
  'POST /api/v1/courses',
  'GET /api/v1/courses/:id',
  'POST /api/v1/courses/:id/modules',
  'POST /api/v1/modules/:id/lessons',
  'POST /api/v1/courses/:id/publish',
  'POST /api/v1/courses/:id/enroll',
  'GET /api/v1/courses/:id/progress',
  'POST /api/v1/lessons/:id/complete',
  'GET /api/v1/certificates/:certificateNumber',
  'GET /api/v1/verify/:hash',
  'GET /api/v1/certificates/verify/:hash',
  'GET /api/v1/certificates/my',
  'POST /api/v1/certificates/:certificateNumber/revoke',
  // Coding challenges, assessment sessions and submissions (migrations 00004,
  // 00063; plan TS-03). XP awards are still in memory.
  'GET /api/v1/challenges',
  'GET /api/v1/challenges/:id',
  'POST /api/v1/challenges',
  'POST /api/v1/challenges/:id/start-session',
  'POST /api/v1/challenges/:id/submit',
  // Moderation reports and appeals (migrations 00017, 00064; plan TS-03).
  // Pending ban proposals are still in memory and lapse on a restart.
  'POST /api/v1/moderation/reports',
  'GET /api/v1/moderation/reports/my',
  'GET /api/v1/moderation/reports',
  'GET /api/v1/moderation/reports/:id',
  'PATCH /api/v1/moderation/reports/:id/status',
  'POST /api/v1/moderation/reports/:id/resolve',
  'POST /api/v1/moderation/reports/:id/appeal',
  'GET /api/v1/moderation/appeals',
  'POST /api/v1/moderation/appeals/:id/review',
  // Portfolio projects (migration 00011; plan TS-03).
  'POST /api/v1/portfolio/projects',
  'GET /api/v1/portfolio/projects',
  'GET /api/v1/portfolio/projects/:id',
  'PATCH /api/v1/portfolio/projects/:id',
  'DELETE /api/v1/portfolio/projects/:id',
  'GET /api/v1/portfolio/showcase/:targetUserId',
  // Application drafts and version history (migrations 00019 and 00056).
  'PUT /api/v1/jobs/:jobId/draft',
  'GET /api/v1/jobs/:jobId/draft',
  'DELETE /api/v1/jobs/:jobId/draft',
  'POST /api/v1/jobs/:jobId/draft/restore',
  'GET /api/v1/applications/drafts',
  // Account metadata already has typed PostgreSQL tables (migration 00013).
  'GET /api/v1/settings',
  'PATCH /api/v1/settings',
  'GET /api/v1/settings/export/latest',
  'POST /api/v1/settings/erasure/request',
  'GET /api/v1/settings/erasure/status',
  // Admin audit trail (migration 00050) and feature flags (migration 00051).
  'GET /api/v1/feature-flags',
  'GET /api/v1/admin/feature-flags',
  'PUT /api/v1/admin/feature-flags/:key',
  'GET /api/v1/admin/audit-logs',
  'POST /api/v1/settings/erasure/cancel',
  // Billing (migrations 00014 and 00052): subscriptions, invoices, entitlements,
  // Stripe customer mapping and provider events. The Stripe routes always exist;
  // outside BILLING_MODE=stripe they refuse with 503.
  'GET /api/v1/billing/subscription',
  'POST /api/v1/billing/subscribe',
  'POST /api/v1/billing/cancel',
  'GET /api/v1/billing/invoices',
  'POST /api/v1/billing/webhook',
  'POST /api/v1/billing/checkout',
  'POST /api/v1/billing/portal',
  'POST /api/v1/billing/stripe-webhook',
]);

/** Routes that hold no entity state at all (health, static catalogs). */
export const STATELESS_ROUTES: ReadonlySet<string> = new Set([
  'GET /health',
  'GET /ready',
  'GET /api/v1/health',
  'GET /api/v1/billing/plans',
]);

export function routeKey(method: string, url: string | undefined): string {
  return `${method.toUpperCase()} ${url ?? ''}`;
}

export function isEphemeralRoute(method: string, url: string | undefined): boolean {
  if (!url || !url.startsWith('/api/')) return false;
  const key = routeKey(method, url);
  return !DURABLE_ROUTES.has(key) && !STATELESS_ROUTES.has(key);
}

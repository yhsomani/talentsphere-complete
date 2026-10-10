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
  'GET /api/v1/references/:refId',
  'GET /api/v1/candidates/:candidateId/work-history',
  'GET /api/v1/candidates/:candidateId/work-history-graph',
  // Notifications (migration 00044)
  'GET /api/v1/notifications',
  'GET /api/v1/notifications/summary',
  'POST /api/v1/notifications/mark-read',
  'GET /api/v1/notifications/preferences',
  'PATCH /api/v1/notifications/preferences',
]);

/** Routes that hold no entity state at all (health, static catalogs). */
export const STATELESS_ROUTES: ReadonlySet<string> = new Set([
  'GET /health',
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

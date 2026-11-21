/**
 * Route authorization sweep (audit A10-005, cross-review C-24 T6).
 *
 * Every /api/v1 route the API registers is collected from the live router
 * (an onRoute hook installed on the Fastify instance buildApp creates), and
 * every route that is not listed in PUBLIC_ROUTES below must refuse a request
 * that carries no credential, a tampered signature, a token signed with
 * another secret, or garbage — with 401 UNAUTHENTICATED. A new route added
 * without `extractUser` therefore fails this suite until it either checks the
 * session or is added to PUBLIC_ROUTES with a reason.
 *
 * PUBLIC_ROUTES is the explicit allowlist of routes that answer an anonymous
 * caller by design. Each entry says why, and cites the line of
 * docs/system-model/06-route-authorization.md that records it as anonymous
 * (`doc`), or says why that document does not (`doc: null`). Adding an entry
 * only to turn this suite green is a finding, not a fix.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance, RouteOptions } from 'fastify';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

// Collect each route as Fastify registers it. The hook is added the moment
// buildApp creates the instance, before any route exists, so nothing is
// missed; product code is unchanged.
const registered = vi.hoisted(() => [] as Array<{ method: string; url: string }>);
vi.mock('fastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fastify')>();
  const create = actual.default as unknown as (...args: unknown[]) => FastifyInstance;
  const wrapped = (...args: unknown[]) => {
    const instance = create(...args);
    instance.addHook('onRoute', (route: RouteOptions) => {
      const methods = Array.isArray(route.method) ? route.method : [route.method];
      for (const method of methods) registered.push({ method, url: route.url });
    });
    return instance;
  };
  return { ...actual, default: wrapped };
});

type PublicRoute = { why: string; doc: string | null };

// Routes whose handler never calls extractUser (or only maybeExtractUser), so
// an anonymous caller gets an answer. Keys are `METHOD path` as registered.
const PUBLIC_ROUTES: Record<string, PublicRoute> = {
  // --- Platform ---
  'GET /api/v1/health': { why: 'liveness probe', doc: '`GET /health`, `/feature-flags`' },
  'GET /api/v1/feature-flags': {
    why: 'flags the signed-out web shell needs',
    doc: '`GET /health`, `/feature-flags`',
  },
  'GET /api/v1/internal/worker-jobs': {
    why: 'dev/test-only queue inspector; callNotFound outside development and test',
    doc: null, // not covered by 06
  },
  // --- Auth (06 defers this group to 02-flows.md) ---
  'POST /api/v1/auth/register': { why: 'sign-up', doc: null },
  'POST /api/v1/auth/login': { why: 'sign-in', doc: null },
  // --- Profiles, evidence, portfolio (canViewProfile lets anonymous read public profiles) ---
  'GET /api/v1/profile/:id': { why: 'public profile read', doc: '`GET /profile/:id`' },
  'GET /api/v1/evidence/:id': {
    why: 'evidence of a public profile (maybeExtractUser + canViewProfile)',
    doc: null, // MISMATCH: 06 lists the route but not that anonymous callers may read it
  },
  'GET /api/v1/evidence/subject/:subjectId': {
    why: 'evidence list of a public profile (maybeExtractUser + canViewProfile)',
    doc: null, // MISMATCH: as above
  },
  'GET /api/v1/evidence/:id/verify-public': {
    why: 'public proof of a record',
    doc: 'public proof is anonymous',
  },
  'GET /api/v1/portfolio/projects/:id': {
    why: 'public portfolio project',
    doc: 'anon may read public projects',
  },
  'GET /api/v1/portfolio/showcase/:targetUserId': {
    why: 'public portfolio projects of a user',
    doc: null, // not listed in 06 (the portfolio row names /projects only)
  },
  // --- Skills ---
  'GET /api/v1/skills': { why: 'skill taxonomy', doc: '`GET /skills`, `POST /skills`' },
  'GET /api/v1/skills/:id/graph': { why: 'skill taxonomy graph', doc: null }, // not covered
  'GET /api/v1/skills/forecast/top-growth': {
    why: 'market forecast',
    doc: '`GET /skills/forecast/top-growth`, `/skills/:id/forecast` | anonymous',
  },
  'GET /api/v1/skills/:skillId/forecast': {
    why: 'market forecast',
    doc: '`GET /skills/forecast/top-growth`, `/skills/:id/forecast` | anonymous',
  },
  'GET /api/v1/skills/endorsements/recipients/:recipientId': {
    why: 'endorsements a person received, readable by anyone',
    doc: null, // MISMATCH: 06 says `/skills/endorsements*` is "any signed-in"
  },
  // --- Jobs and organizations (06 defers this group to 02-flows.md) ---
  'GET /api/v1/jobs': { why: 'public job board', doc: null },
  'GET /api/v1/jobs/:id': { why: 'public job detail', doc: null },
  'GET /api/v1/organizations/:id': { why: 'public organization card', doc: null },
  'GET /api/v1/feedback/aggregate-insights': {
    why: 'cross-organization feedback counts (CF-36)',
    doc: '`GET /feedback/aggregate-insights`',
  },
  // --- Work history and references (06 defers this group to 02-flows.md) ---
  'GET /api/v1/candidates/:candidateId/work-history': {
    why: 'work history follows profile visibility (workHistoryReader)',
    doc: null,
  },
  'GET /api/v1/candidates/:candidateId/work-history-graph': {
    why: 'work history follows profile visibility (workHistoryReader)',
    doc: null,
  },
  'GET /api/v1/references/:refId': {
    why: 'referee link, authorised by the emailed x-reference-token',
    doc: null,
  },
  'POST /api/v1/candidates/work-history/references/:refId/submit': {
    why: 'referee submits through the emailed link',
    doc: null,
  },
  // --- Salaries, career, learning impact (k-anonymous aggregates) ---
  'GET /api/v1/salaries/benchmarks': {
    why: 'k-anonymous aggregate',
    doc: 'benchmarks and company summary anonymous',
  },
  'GET /api/v1/salaries/company/:companyName': {
    why: 'k-anonymous aggregate',
    doc: 'benchmarks and company summary anonymous',
  },
  'GET /api/v1/career/benchmarks': {
    why: 'k-anonymous aggregate',
    doc: 'benchmarks, probability and pathways anonymous',
  },
  'POST /api/v1/career/transition-probability': {
    why: 'k-anonymous aggregate (compute only)',
    doc: 'benchmarks, probability and pathways anonymous',
  },
  'GET /api/v1/career/pathways': {
    why: 'k-anonymous aggregate',
    doc: 'benchmarks, probability and pathways anonymous',
  },
  'GET /api/v1/learning/impact/courses/:courseId': {
    why: 'cohort-floored metrics',
    doc: 'metrics anonymous with cohort floor 30',
  },
  'GET /api/v1/learning/impact/dashboard': {
    why: 'cohort-floored metrics',
    doc: 'metrics anonymous with cohort floor 30',
  },
  // --- Reputation (CF-36) ---
  'GET /api/v1/reputation/instructors/:instructorId': {
    why: 'public reputation read',
    doc: '`/reputation/instructors`, `/organizations` | reads anonymous',
  },
  'GET /api/v1/reputation/organizations/:organizationId': {
    why: 'public reputation read',
    doc: '`/reputation/instructors`, `/organizations` | reads anonymous',
  },
  'GET /api/v1/reputation/organizations/:organizationId/reviews': {
    why: 'public reputation read',
    doc: '`/reputation/instructors`, `/organizations` | reads anonymous',
  },
  // --- Learning catalogue and credentials ---
  'GET /api/v1/challenges': { why: 'challenge catalogue', doc: '`GET /challenges*` | anonymous' },
  'GET /api/v1/challenges/:id': {
    why: 'challenge detail (hidden tests removed)',
    doc: '`GET /challenges*` | anonymous',
  },
  'GET /api/v1/courses': { why: 'published course catalogue', doc: null }, // not covered
  'GET /api/v1/courses/:id': {
    why: 'published course detail; unpublished only for instructor/admin',
    doc: '`GET /courses/:id`',
  },
  'GET /api/v1/certificates/:certificateNumber': {
    why: 'public certificate check',
    doc: '`GET /certificates/*`, `/verify/:hash` | anonymous',
  },
  'GET /api/v1/certificates/verify/:hash': {
    why: 'public certificate check',
    doc: '`GET /certificates/*`, `/verify/:hash` | anonymous',
  },
  'GET /api/v1/verify/:hash': {
    why: 'public credential check',
    doc: '`GET /certificates/*`, `/verify/:hash` | anonymous',
  },
  // --- Search, moderation, analytics ---
  'GET /api/v1/search': { why: 'public search', doc: '`GET /search*` | anonymous' },
  'GET /api/v1/search/autocomplete': { why: 'public search', doc: '`GET /search*` | anonymous' },
  'GET /api/v1/search/commands': {
    why: 'command palette entries',
    doc: '`GET /search*` | anonymous',
  },
  'POST /api/v1/moderation/scan': {
    why: 'compute-only content scan',
    doc: '`POST /moderation/scan` | anonymous, compute only',
  },
  'POST /api/v1/analytics/events': {
    why: 'anonymous telemetry allowed',
    doc: '`POST /analytics/events` | anonymous allowed',
  },
  // --- Billing (06 defers this group to 02-flows.md) ---
  'GET /api/v1/billing/plans': { why: 'public price list', doc: null },
  'POST /api/v1/billing/webhook': { why: 'authenticated by HMAC signature header', doc: null },
  'POST /api/v1/billing/stripe-webhook': { why: 'authenticated by Stripe signature', doc: null },
};

const PARAM_VALUE = '3f8c2a54-7d1e-4b6a-9c0f-1a2b3c4d5e6f';
const concrete = (path: string) => path.replace(/:[A-Za-z]+/g, PARAM_VALUE);

/** A server-minted platform-admin token with one signature character changed. */
function tamperedToken(): string {
  const real = createSessionToken(crypto.randomUUID(), 'mallory@example.com', ['platform_admin']);
  const [payloadB64, signature] = real.split('.');
  const last = signature.slice(-1) === 'A' ? 'B' : 'A';
  return `${payloadB64}.${signature.slice(0, -1)}${last}`;
}

/** A well-formed platform-admin token signed with a secret the server does not hold. */
function wrongSecretToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payloadB64 = Buffer.from(
    JSON.stringify({
      userId: crypto.randomUUID(),
      email: 'mallory@example.com',
      roles: ['platform_admin'],
      issuedAt: now,
      expiresAt: now + 3600,
      sessionId: crypto.randomBytes(16).toString('base64url'),
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', crypto.randomBytes(32))
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

describe('SEC: every non-public /api/v1 route requires a valid session (A10-005)', () => {
  let app: FastifyInstance;
  let routes: Array<{ method: string; url: string }>;

  beforeAll(async () => {
    registered.length = 0;
    app = await buildApp({
      NODE_ENV: 'test',
      // The unconfigured billing webhooks answer 503, which logs at error level.
      LOG_LEVEL: 'fatal',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    } as never);
    await app.ready();
    const seen = new Set<string>();
    routes = registered.filter((r) => {
      const key = `${r.method} ${r.url}`;
      if (r.method === 'HEAD' || r.method === 'OPTIONS' || !r.url.startsWith('/api/v1/')) {
        return false;
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('collects the whole router, and it agrees with the route declarations in source', () => {
    // Guards the collector itself: an empty or partial list would make every
    // other assertion here vacuous.
    expect(routes.length).toBeGreaterThanOrEqual(270);
    const declared = new Set<string>();
    for (const file of ['apps/api/src/server.ts', 'apps/api/src/billing-stripe.ts']) {
      const source = readFileSync(file, 'utf8');
      for (const m of source.matchAll(
        /\b(?:app|scope)\.(get|post|put|patch|delete)\(\s*'(\/api\/v1\/[^']+)'/g
      )) {
        declared.add(`${m[1].toUpperCase()} ${m[2]}`);
      }
    }
    const live = new Set(routes.map((r) => `${r.method} ${r.url}`));
    expect([...declared].filter((key) => !live.has(key))).toEqual([]);
    expect([...live].filter((key) => !declared.has(key))).toEqual([]);
    for (const r of routes) {
      expect(app.hasRoute({ method: r.method as never, url: r.url }), r.url).toBe(true);
    }
  });

  it('lists only routes that exist and still answer anonymous callers', async () => {
    const live = new Set(routes.map((r) => `${r.method} ${r.url}`));
    const stale: string[] = [];
    const nowAuthenticated: string[] = [];
    for (const key of Object.keys(PUBLIC_ROUTES)) {
      if (!live.has(key)) {
        stale.push(key);
        continue;
      }
      const [method, path] = key.split(' ');
      const res = await app.inject({ method: method as never, url: concrete(path) });
      if (res.statusCode === 401) nowAuthenticated.push(key);
    }
    // A public route that now demands a session belongs out of the allowlist.
    expect(stale).toEqual([]);
    expect(nowAuthenticated).toEqual([]);
  });

  it('records each public route as anonymous in 06-route-authorization.md where the doc covers it', () => {
    const doc = readFileSync('docs/system-model/06-route-authorization.md', 'utf8');
    const missing = Object.entries(PUBLIC_ROUTES)
      .filter(([, entry]) => entry.doc !== null && !doc.includes(entry.doc))
      .map(([key, entry]) => `${key}: ${entry.doc}`);
    expect(missing).toEqual([]);
  });

  it('refuses every other route without a valid session: 401 UNAUTHENTICATED', async () => {
    const credentials: Array<[string, Record<string, string>]> = [
      ['no Authorization header', {}],
      ['tampered signature', { authorization: `Bearer ${tamperedToken()}` }],
      ['signed with another secret', { authorization: `Bearer ${wrongSecretToken()}` }],
      ['garbage bearer', { authorization: 'Bearer garbage' }],
    ];
    const protectedRoutes = routes.filter((r) => !(`${r.method} ${r.url}` in PUBLIC_ROUTES));
    expect(protectedRoutes.length).toBeGreaterThan(200);

    const failures: string[] = [];
    for (const r of protectedRoutes) {
      for (const [label, headers] of credentials) {
        const res = await app.inject({ method: r.method as never, url: concrete(r.url), headers });
        const code = res.statusCode === 401 ? res.json().error?.code : undefined;
        if (res.statusCode !== 401 || code !== 'UNAUTHENTICATED') {
          failures.push(`${r.method} ${r.url} [${label}] -> ${res.statusCode}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('never gives a public route more for a forged admin token than for no token', async () => {
    // A forged token must be treated as no token (maybeExtractUser) or
    // refused (work-history readers answer 401 so the client re-authenticates).
    const forged = { authorization: `Bearer ${tamperedToken()}` };
    const failures: string[] = [];
    for (const key of Object.keys(PUBLIC_ROUTES)) {
      const [method, path] = key.split(' ');
      const url = concrete(path);
      const anon = await app.inject({ method: method as never, url });
      const withForged = await app.inject({ method: method as never, url, headers: forged });
      if (![anon.statusCode, 401].includes(withForged.statusCode)) {
        failures.push(`${key}: anonymous ${anon.statusCode}, forged ${withForged.statusCode}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

/**
 * Role-level sweep (K-16). The 401 sweep above proves a session is required;
 * this proves the role is. Every admin route, the analytics reads and the
 * moderator queues refuse a valid candidate or recruiter session with 403
 * FORBIDDEN, and the admin routes also refuse a moderator (moderator is not
 * admin). The three moderator mutations parse the body and load the record
 * before the role check (it lives in the domain call), so they are driven
 * against real, seeded records with valid bodies.
 *
 * Mutation check (manual, 2026-11-21): deleting `assertPlatformAdmin` from
 * `POST /api/v1/admin/maintenance` in server.ts makes the first case fail for
 * that route.
 */
describe('SEC: role-gated routes refuse sessions without the role (K-16)', () => {
  let app: FastifyInstance;
  let roleGated: Array<{ method: string; url: string }>;
  const token = (roles: string[]) =>
    createSessionToken(crypto.randomUUID(), `${roles[0]}.${Date.now()}@example.com`, roles);
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

  beforeAll(async () => {
    registered.length = 0;
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'fatal',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    } as never);
    await app.ready();
    const seen = new Set<string>();
    roleGated = registered.filter((r) => {
      const key = `${r.method} ${r.url}`;
      if (seen.has(key) || r.method === 'HEAD' || r.method === 'OPTIONS') return false;
      seen.add(key);
      return (
        /^\/api\/v1\/admin\//.test(r.url) ||
        (r.method === 'GET' && /^\/api\/v1\/analytics\/(events|kpis)$/.test(r.url)) ||
        ['GET /api/v1/moderation/reports', 'GET /api/v1/moderation/appeals'].includes(key)
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuses a candidate and a recruiter on every admin, analytics-read and moderator-queue route', async () => {
    // A prefix rename must not empty the list and turn this into a no-op.
    expect(roleGated.length).toBeGreaterThanOrEqual(12);
    const failures: string[] = [];
    for (const [label, roles] of [
      ['candidate', ['candidate']],
      ['recruiter', ['recruiter']],
    ] as const) {
      const headers = bearer(token([...roles]));
      for (const r of roleGated) {
        const res = await app.inject({
          method: r.method as never,
          url: concrete(r.url),
          headers,
          ...(r.method === 'GET' ? {} : { payload: {} }),
        });
        const code = res.statusCode === 403 ? res.json().error?.code : undefined;
        if (res.statusCode !== 403 || code !== 'FORBIDDEN') {
          failures.push(`${r.method} ${r.url} [${label}] -> ${res.statusCode}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('refuses a moderator on every admin route', async () => {
    const adminRoutes = roleGated.filter((r) => r.url.startsWith('/api/v1/admin/'));
    expect(adminRoutes.length).toBeGreaterThanOrEqual(8);
    const headers = bearer(token(['moderator']));
    const failures: string[] = [];
    for (const r of adminRoutes) {
      const res = await app.inject({
        method: r.method as never,
        url: concrete(r.url),
        headers,
        ...(r.method === 'GET' ? {} : { payload: {} }),
      });
      const code = res.statusCode === 403 ? res.json().error?.code : undefined;
      if (res.statusCode !== 403 || code !== 'FORBIDDEN') {
        failures.push(`${r.method} ${r.url} -> ${res.statusCode}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('refuses a candidate on the moderator mutations, given real records and valid bodies', async () => {
    const reporter = bearer(token(['candidate']));
    const moderator = bearer(token(['moderator']));
    const outsider = bearer(token(['candidate']));
    const targetId = crypto.randomUUID();
    const target = bearer(
      createSessionToken(targetId, `target.${Date.now()}@example.com`, ['candidate'])
    );

    const fileReport = async (aboutUserId: string) => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/moderation/reports',
        headers: reporter,
        payload: {
          targetType: 'user',
          targetId: aboutUserId,
          reason: 'spam',
          details: `role sweep ${crypto.randomUUID()}`,
        },
      });
      expect(res.statusCode, res.body).toBe(201);
      return res.json().report.id as string;
    };

    // A pending report for status/resolve, and a resolved one with an appeal.
    const pendingId = await fileReport(crypto.randomUUID());
    const resolvedId = await fileReport(targetId);
    const resolved = await app.inject({
      method: 'POST',
      url: `/api/v1/moderation/reports/${resolvedId}/resolve`,
      headers: moderator,
      payload: { action: 'warning', resolutionNotes: 'Seeded for the role sweep.' },
    });
    expect(resolved.statusCode, resolved.body).toBe(200);
    const appealed = await app.inject({
      method: 'POST',
      url: `/api/v1/moderation/reports/${resolvedId}/appeal`,
      headers: target,
      payload: { reason: 'Seeded appeal for the role sweep.' },
    });
    expect(appealed.statusCode, appealed.body).toBe(201);
    const appealId = appealed.json().appeal.id as string;

    const attempts: Array<[string, string, Record<string, unknown>]> = [
      ['PATCH', `/api/v1/moderation/reports/${pendingId}/status`, { status: 'under_review' }],
      [
        'POST',
        `/api/v1/moderation/reports/${pendingId}/resolve`,
        { action: 'warning', resolutionNotes: 'Not a moderator.' },
      ],
      [
        'POST',
        `/api/v1/moderation/appeals/${appealId}/review`,
        { decision: 'upheld', decisionNotes: 'Not a moderator.' },
      ],
    ];
    const failures: string[] = [];
    for (const [method, url, payload] of attempts) {
      const res = await app.inject({ method: method as never, url, headers: outsider, payload });
      const body = res.statusCode === 403 ? res.json().error : undefined;
      // The refusal must be the role check, not some other 403.
      if (res.statusCode !== 403 || body?.code !== 'FORBIDDEN' || !/Moderator/.test(body.message)) {
        failures.push(`${method} ${url} -> ${res.statusCode} ${res.body}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

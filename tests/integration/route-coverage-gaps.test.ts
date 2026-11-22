/**
 * Read routes that had no test at all (audit A10-003, cross-review C-24 T5):
 * GET /organizations/:id, GET /ai/conversations,
 * GET /networking/warm-intros/preferences, GET /alumni/affiliations/my and
 * GET /alumni/institutions/:institutionId/groups. Each pins who may read and
 * that a caller sees only their own records.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

type Json = Record<string, any>;

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; body: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
}

async function register(app: FastifyInstance, label: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    // example.com never matches an institution's domain, so no affiliation
    // here is verified by email domain.
    email: `${label}.${crypto.randomUUID().slice(0, 8)}@example.com`,
    password: 'Password123!Secure',
    fullName: `Coverage ${label}`,
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

describe('Untested read routes (A10-003)', () => {
  let app: FastifyInstance;
  let alice: Awaited<ReturnType<typeof register>>;
  let bob: Awaited<ReturnType<typeof register>>;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    } as never);
    await app.ready();
    alice = await register(app, 'alice');
    bob = await register(app, 'bob');
    adminToken = createSessionToken(crypto.randomUUID(), 'admin@talentsphere.io', [
      'platform_admin',
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/organizations/:id (public by design)', () => {
    it('answers an anonymous caller with the public organization fields only', async () => {
      const created = await call(app, 'POST', '/api/v1/organizations', alice.token, {
        name: 'Public Card Co',
        slug: `public-card-${crypto.randomUUID().slice(0, 8)}`,
        website: 'https://publiccard.example',
        description: 'We make cards.',
      });
      expect(created.status).toBe(201);
      const orgId = created.body.organization.id;

      const res = await call(app, 'GET', `/api/v1/organizations/${orgId}`);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body.organization).sort()).toEqual(
        ['createdAt', 'description', 'id', 'name', 'slug', 'website'].sort()
      );
      expect(res.body.organization).toMatchObject({ id: orgId, name: 'Public Card Co' });
      // No membership, owner or member list rides along.
      expect(Object.keys(res.body)).toEqual(['organization']);
    });

    it('is 404 for an unknown id', async () => {
      const res = await call(app, 'GET', `/api/v1/organizations/${crypto.randomUUID()}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/ai/conversations', () => {
    it("lists only the caller's own conversations", async () => {
      const created = await call(app, 'POST', '/api/v1/ai/conversations', alice.token, {
        title: 'Interview prep',
      });
      expect(created.status).toBe(201);

      const mine = await call(app, 'GET', '/api/v1/ai/conversations', alice.token);
      expect(mine.status).toBe(200);
      expect(mine.body.conversations.map((c: Json) => c.id)).toEqual([
        created.body.conversation.id,
      ]);
      expect(mine.body.conversations[0].userId).toBe(alice.user.id);

      const theirs = await call(app, 'GET', '/api/v1/ai/conversations', bob.token);
      expect(theirs.status).toBe(200);
      expect(theirs.body.conversations).toEqual([]);
    });

    it('requires a session', async () => {
      expect((await call(app, 'GET', '/api/v1/ai/conversations')).status).toBe(401);
    });
  });

  describe('GET /api/v1/networking/warm-intros/preferences', () => {
    it('returns the defaults for a new account, then what that account saved', async () => {
      const fresh = await call(app, 'GET', '/api/v1/networking/warm-intros/preferences', bob.token);
      expect(fresh.status).toBe(200);
      expect(fresh.body.preferences).toMatchObject({
        userId: bob.user.id,
        optOutIntroducer: false,
        blockAllIncomingIntros: false,
        blockedUserIds: [],
      });

      const saved = await call(
        app,
        'POST',
        '/api/v1/networking/warm-intros/preferences',
        alice.token,
        { optOutIntroducer: true, blockedUserIds: [bob.user.id] }
      );
      expect(saved.status).toBe(200);
      const read = await call(
        app,
        'GET',
        '/api/v1/networking/warm-intros/preferences',
        alice.token
      );
      expect(read.status).toBe(200);
      expect(read.body.preferences).toMatchObject({
        userId: alice.user.id,
        optOutIntroducer: true,
        blockAllIncomingIntros: false,
        blockedUserIds: [bob.user.id],
      });

      // Alice's choices are not Bob's.
      const bobAgain = await call(
        app,
        'GET',
        '/api/v1/networking/warm-intros/preferences',
        bob.token
      );
      expect(bobAgain.body.preferences.optOutIntroducer).toBe(false);
    });

    it('requires a session', async () => {
      expect((await call(app, 'GET', '/api/v1/networking/warm-intros/preferences')).status).toBe(
        401
      );
    });
  });

  describe('alumni reads', () => {
    let institutionId: string;
    let alumnus: Awaited<ReturnType<typeof register>>;
    let outsider: Awaited<ReturnType<typeof register>>;
    let affiliationId: string;
    let groupId: string;

    beforeAll(async () => {
      alumnus = await register(app, 'alumnus');
      outsider = await register(app, 'outsider');
      const org = await call(app, 'POST', '/api/v1/organizations', outsider.token, {
        name: 'North College',
        slug: `north-college-${crypto.randomUUID().slice(0, 8)}`,
        website: 'https://north-college.example',
      });
      expect(org.status).toBe(201);
      institutionId = org.body.organization.id;

      const affiliation = await call(app, 'POST', '/api/v1/alumni/affiliations', alumnus.token, {
        institutionId,
        degreeType: 'bachelors',
        fieldOfStudy: 'History',
        graduationYear: 2019,
      });
      expect(affiliation.status).toBe(201);
      expect(affiliation.body.affiliation.verificationStatus).not.toBe('verified');
      affiliationId = affiliation.body.affiliation.id;

      const group = await call(
        app,
        'POST',
        `/api/v1/alumni/institutions/${institutionId}/groups`,
        adminToken,
        { name: 'North College Alumni' }
      );
      expect(group.status).toBe(201);
      groupId = group.body.group.id;
    });

    it("GET /alumni/affiliations/my lists only the caller's affiliations", async () => {
      const mine = await call(app, 'GET', '/api/v1/alumni/affiliations/my', alumnus.token);
      expect(mine.status).toBe(200);
      expect(mine.body.total).toBe(1);
      expect(mine.body.affiliations.map((a: Json) => a.id)).toEqual([affiliationId]);
      expect(mine.body.affiliations[0].userId).toBe(alumnus.user.id);

      const other = await call(app, 'GET', '/api/v1/alumni/affiliations/my', outsider.token);
      expect(other.status).toBe(200);
      expect(other.body).toMatchObject({ affiliations: [], total: 0 });

      expect((await call(app, 'GET', '/api/v1/alumni/affiliations/my')).status).toBe(401);
    });

    it('GET /alumni/institutions/:id/groups: verified alumni and admins only', async () => {
      const url = `/api/v1/alumni/institutions/${institutionId}/groups`;

      // An unverified affiliation is not enough.
      const unverified = await call(app, 'GET', url, alumnus.token);
      expect(unverified.status).toBe(403);
      expect(unverified.body.error.code).toBe('TENANT_ISOLATION_VIOLATION');

      // The institution confirms the seat (an admin; never the claimant).
      const verified = await call(
        app,
        'POST',
        `/api/v1/alumni/affiliations/${affiliationId}/verify`,
        adminToken,
        { verificationMethod: 'institutional_seat', seatCode: 'SEAT-2019' }
      );
      expect(verified.status).toBe(200);

      const asAlumnus = await call(app, 'GET', url, alumnus.token);
      expect(asAlumnus.status).toBe(200);
      expect(asAlumnus.body).toMatchObject({ institutionId, total: 1 });
      expect(asAlumnus.body.groups.map((g: Json) => g.id)).toEqual([groupId]);

      expect((await call(app, 'GET', url, adminToken)).status).toBe(200);

      // Creating the organization does not make an ordinary account its
      // administrator (administersInstitution needs institution_admin).
      const unrelated = await call(app, 'GET', url, outsider.token);
      expect(unrelated.status).toBe(403);
      expect(unrelated.body.error.code).toBe('TENANT_ISOLATION_VIOLATION');

      const unknown = await call(
        app,
        'GET',
        `/api/v1/alumni/institutions/${crypto.randomUUID()}/groups`,
        adminToken
      );
      expect(unknown.status).toBe(404);
    });
  });
});

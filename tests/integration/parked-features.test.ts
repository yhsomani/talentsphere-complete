import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { PARKED_ROUTES } from '../../apps/api/src/parked.js';
import { createSessionToken, PARKED_FEATURES } from '../../packages/domain/src/index.js';

// Parked features (TPD-04, docs/product/TRANSFORMATION_PLAN.md §4.3). Deployed
// defaults are covered by isParkedFeatureEnabled in tests/unit/admin-domain.test.ts;
// a deployed buildApp refuses memory storage, so this suite runs as NODE_ENV=test.
describe('Parked features (TPD-04)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  const adminToken = createSessionToken(
    '00000000-0000-4000-a000-000000000098',
    'parked.admin@talentsphere.internal',
    ['platform_admin']
  );

  const setFlag = (key: string, enabled: boolean) =>
    app.inject({
      method: 'PUT',
      url: `/api/v1/admin/feature-flags/${key}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { enabled },
    });

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
    });
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'parked.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Parked Feature Candidate',
        role: 'candidate',
      },
    });
    expect(res.statusCode).toBe(201);
    candidateToken = JSON.parse(res.body).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists only routes that exist, each under a known feature', () => {
    expect(PARKED_ROUTES.size).toBe(44);
    for (const [key, feature] of PARKED_ROUTES) {
      const [method, url] = key.split(' ');
      expect(app.hasRoute({ method: method as never, url }), key).toBe(true);
      expect(Object.keys(PARKED_FEATURES), key).toContain(feature);
    }
  });

  it('keeps parked features on outside deployed environments when no flag is stored', async () => {
    const flags = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/feature-flags' })).body
    ).flags;
    for (const key of Object.keys(PARKED_FEATURES)) expect(flags[key], key).toBe(true);

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('answers 404 to everyone on a parked route whose flag is off, and recovers when it is on', async () => {
    expect((await setFlag('FEATURE_GAMIFICATION', false)).statusCode).toBe(200);

    const signedIn = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(signedIn.statusCode).toBe(404);
    const body = JSON.parse(signedIn.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('This feature is not available.');

    // Same answer without a session: the hook runs before authentication.
    const anonymous = await app.inject({ method: 'GET', url: '/api/v1/gamification/leaderboard' });
    expect(anonymous.statusCode).toBe(404);

    // Other features are unaffected.
    const reputation = await app.inject({
      method: 'GET',
      url: '/api/v1/reputation/my/signals',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(reputation.statusCode).not.toBe(404);
    const durable = await app.inject({ method: 'GET', url: '/api/v1/jobs' });
    expect(durable.statusCode).toBe(200);

    const flags = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/feature-flags' })).body
    ).flags;
    expect(flags.FEATURE_GAMIFICATION).toBe(false);

    expect((await setFlag('FEATURE_GAMIFICATION', true)).statusCode).toBe(200);
    const restored = await app.inject({
      method: 'GET',
      url: '/api/v1/gamification/summary',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(restored.statusCode).toBe(200);
  });

  it('parks candidate-level behavioral scoring for recruiters too', async () => {
    expect((await setFlag('FEATURE_BEHAVIORAL_SCORING', false)).statusCode).toBe(200);
    const recruiterToken = createSessionToken(
      '00000000-0000-4000-a000-000000000097',
      'parked.recruiter@example.com',
      ['recruiter']
    );
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/recruiter/talent-segmentation/segments',
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(res.statusCode).toBe(404);
    expect((await setFlag('FEATURE_BEHAVIORAL_SCORING', true)).statusCode).toBe(200);
  });
});

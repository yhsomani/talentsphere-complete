import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Integration: Activity & Contribution Tracking (F-146, S-09)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterUserId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    });
    await app.ready();

    // 1. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `candidate.act.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Active Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;

    // 2. Register Recruiter
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `recruiter.act.${Date.now()}@techcorp.io`,
        password: 'Password123!',
        fullName: 'Talent Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.payload);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;
  });

  it('provides baseline score of 0 in passive band when candidate has no prior activity', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/activity/scores/me',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.score.compositeScore).toBe(0);
    expect(body.score.engagementBand).toBe('passive');
    expect(body.score.totalEventsCount).toBe(0);
    expect(body.score.activeStreakDays).toBe(0);
  });

  it('records activities across diverse categories and dynamically updates scores', async () => {
    // 1. Record learning activity
    const ev1 = await app.inject({
      method: 'POST',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        category: 'learning',
        activityType: 'course_completed',
        weight: 3.0,
        metadata: { courseTitle: 'Advanced Distributed Systems' },
      },
    });
    expect(ev1.statusCode).toBe(201);
    const data1 = JSON.parse(ev1.payload);
    expect(data1.event.category).toBe('learning');
    expect(data1.score.learningScore).toBe(15); // 3 * 5

    // 2. Record creation activity
    const ev2 = await app.inject({
      method: 'POST',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        category: 'creation',
        activityType: 'portfolio_project_published',
        weight: 4.0,
      },
    });
    expect(ev2.statusCode).toBe(201);
    const data2 = JSON.parse(ev2.payload);
    expect(data2.score.creationScore).toBe(40); // 4 * 10

    // 3. Record collaboration activity
    const ev3 = await app.inject({
      method: 'POST',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        category: 'collaboration',
        activityType: 'peer_review_submitted',
        weight: 2.0,
      },
    });
    expect(ev3.statusCode).toBe(201);
    const data3 = JSON.parse(ev3.payload);
    expect(data3.score.collaborationScore).toBe(16); // 2 * 8

    // 4. Record social activity
    const ev4 = await app.inject({
      method: 'POST',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        category: 'social',
        activityType: 'connection_accepted',
        weight: 2.0,
      },
    });
    expect(ev4.statusCode).toBe(201);
    const data4 = JSON.parse(ev4.payload);
    expect(data4.score.socialScore).toBe(6); // 2 * 3
    expect(data4.score.totalEventsCount).toBe(4);
    expect(data4.score.compositeScore).toBeGreaterThanOrEqual(20);
    expect(data4.score.engagementBand).toBe('active');
  });

  it('lists user activity events with optional category filtering', async () => {
    // All events
    const allRes = await app.inject({
      method: 'GET',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(allRes.statusCode).toBe(200);
    const allBody = JSON.parse(allRes.payload);
    expect(allBody.events).toHaveLength(4);

    // Filter by learning category
    const filterRes = await app.inject({
      method: 'GET',
      url: '/api/v1/activity/events?category=learning',
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(filterRes.statusCode).toBe(200);
    const filterBody = JSON.parse(filterRes.payload);
    expect(filterBody.events).toHaveLength(1);
    expect(filterBody.events[0].category).toBe('learning');
  });

  it('allows recruiters to view candidate aggregate engagement metrics without event details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/activity/users/${candidateUserId}/score`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.userId).toBe(candidateUserId);
    expect(body.compositeScore).toBeGreaterThanOrEqual(20);
    expect(body.engagementBand).toBe('active');
    expect(body.learningScore).toBe(15);
    expect(body.creationScore).toBe(40);
    expect(body.collaborationScore).toBe(16);
    expect(body.socialScore).toBe(6);
    expect(body.totalEventsCount).toBe(4);
    // Crucially: no private events array leaked
    expect(body.events).toBeUndefined();
  });

  it('recalculates scores on demand', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/activity/recalculate',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.score.compositeScore).toBeGreaterThanOrEqual(20);
    expect(body.score.totalEventsCount).toBe(4);
  });
});

describe('Integration: activity ingestion is bounded (M-1)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0' });
    await app.ready();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `bounded.act.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Bounded Activity',
        role: 'candidate',
      },
    });
    token = JSON.parse(reg.payload).token;
  });

  const post = (payload: Record<string, unknown>) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/activity/events',
      headers: { authorization: `Bearer ${token}` },
      payload,
    });

  it('refuses a body over 16 KB with 413', async () => {
    const res = await post({
      category: 'learning',
      activityType: 'big',
      metadata: { blob: 'x'.repeat(100 * 1024) },
    });
    expect(res.statusCode).toBe(413);
  });

  it('refuses metadata with more than 30 keys with 422', async () => {
    const metadata = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, i]));
    const res = await post({ category: 'learning', activityType: 'wide', metadata });
    expect(res.statusCode).toBe(422);
  });

  it('limits one account to 60 events a minute', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 61; i++) {
      statuses.push((await post({ category: 'learning', activityType: `rate_${i}` })).statusCode);
    }
    // The two refused requests above count toward the window too.
    expect(statuses.filter((s) => s === 201)).toHaveLength(58);
    expect(statuses.slice(-3)).toEqual([429, 429, 429]);
  });
});

// C-26: the score follows the profile's privacy and the person's own
// "show activity" setting.
describe('Integration: activity score visibility (C-26, CF-34)', () => {
  let app: FastifyInstance;
  const users: Record<string, { token: string; userId: string }> = {};
  const adminToken = createSessionToken(
    '00000000-0000-4000-a000-0000000000a7',
    'admin.activity@talentsphere.internal',
    ['platform_admin']
  );

  const inject = async (method: 'GET' | 'PATCH', url: string, token: string, payload?: object) =>
    app.inject({
      method,
      url,
      headers: { authorization: `Bearer ${token}` },
      ...(payload ? { payload } : {}),
    });
  const scoreOf = (target: string, viewerToken: string) =>
    inject('GET', `/api/v1/activity/users/${users[target].userId}/score`, viewerToken);

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0', LOG_LEVEL: 'error' });
    await app.ready();
    for (const [name, role] of [
      ['target', 'candidate'],
      ['peer', 'candidate'],
      ['recruiter', 'recruiter'],
    ]) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: `${name}.visibility.${Date.now()}@example.com`,
          password: 'Password123!',
          fullName: `Visibility ${name}`,
          role,
        },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      users[name] = { token: body.token, userId: body.user.id };
    }
  });

  it('refuses another candidate when the profile is recruiters-only, and still serves a recruiter', async () => {
    expect((await scoreOf('target', users.peer.token)).statusCode).toBe(200);
    const patched = await inject('PATCH', '/api/v1/profile/me', users.target.token, {
      privacy: 'recruiters_only',
    });
    expect(patched.statusCode).toBe(200);

    const peer = await scoreOf('target', users.peer.token);
    expect(peer.statusCode).toBe(403);
    expect(JSON.parse(peer.payload).error.code).toBe('FORBIDDEN');
    expect((await scoreOf('target', users.recruiter.token)).statusCode).toBe(200);
  });

  it('refuses a recruiter once the person stops sharing activity; owner and admin still see it', async () => {
    const patched = await inject('PATCH', '/api/v1/settings', users.target.token, {
      showActivity: false,
    });
    expect(patched.statusCode).toBe(200);

    const recruiter = await scoreOf('target', users.recruiter.token);
    expect(recruiter.statusCode).toBe(403);
    expect(JSON.parse(recruiter.payload).error.message).toContain('does not share their activity');
    expect((await scoreOf('target', users.target.token)).statusCode).toBe(200);
    expect((await scoreOf('target', adminToken)).statusCode).toBe(200);
  });

  it('still answers 404 for an unknown user', async () => {
    const res = await inject(
      'GET',
      '/api/v1/activity/users/00000000-0000-4000-a000-00000000dead/score',
      users.peer.token
    );
    expect(res.statusCode).toBe(404);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Peer Credibility Networks Integration (F-150, F-110, F-144)', () => {
  let app: FastifyInstance;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let skillId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register User 1
    const reg1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'alice.peer@example.com',
        password: 'Password123!Secure',
        fullName: 'Alice Peer',
        role: 'candidate',
      },
    });
    const data1 = JSON.parse(reg1.body);
    user1Id = data1.user.id;
    user1Token = data1.token;

    // 2. Register User 2
    const reg2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'bob.peer@example.com',
        password: 'Password123!Secure',
        fullName: 'Bob Peer',
        role: 'candidate',
      },
    });
    const data2 = JSON.parse(reg2.body);
    user2Id = data2.user.id;
    user2Token = data2.token;

    // 3. Register User 3
    const reg3 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'charlie.peer@example.com',
        password: 'Password123!Secure',
        fullName: 'Charlie Peer',
        role: 'candidate',
      },
    });
    const data3 = JSON.parse(reg3.body);
    user3Id = data3.user.id;
    user3Token = data3.token;

    // 4. Establish direct connection between User 1 and User 2 (Distance 1)
    const connReq = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: { recipientId: user2Id, note: 'Let us connect!' },
    });
    const connId = JSON.parse(connReq.body).connection.id;
    await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${user2Token}` },
      payload: { action: 'accept' },
    });

    // 2. Query canonical skill (TypeScript)
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/skills',
    });
    const skillsData = JSON.parse(skillsRes.body);
    const tsSkill = skillsData.skills.find((s: any) => s.name.toLowerCase().includes('typescript'));
    skillId = tsSkill ? tsSkill.id : skillsData.skills[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('endorses a peer with deterministic credibility weight based on distance and reputation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/endorsements',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        recipientId: user2Id,
        skillId,
        notes: 'Brilliant mastery of distributed systems in TypeScript',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);

    expect(body.endorsement.recipientId).toBe(user2Id);
    expect(body.endorsement.endorserId).toBe(user1Id);
    expect(body.endorsement.skillId).toBe(skillId);
    expect(body.endorsement.status).toBe('active');

    // Weight breakdown (F-150 Acceptance)
    const weight = body.endorsement.weight;
    expect(weight.networkDistance).toBe(1); // Direct connection
    expect(weight.distanceFactor).toBe(1.0);
    expect(weight.finalWeight).toBeGreaterThan(0.2);
  });

  it('prevents duplicate active endorsement and self-endorsements (BR-153)', async () => {
    // 1. Self endorsement rejected
    const selfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/endorsements',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        recipientId: user1Id,
        skillId,
      },
    });
    expect(selfRes.statusCode).toBe(403);

    // 2. Duplicate endorsement rejected
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/endorsements',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        recipientId: user2Id,
        skillId,
      },
    });
    expect(dupRes.statusCode).toBe(409);
  });

  it('detects reciprocal endorsements and applies collusion dampening (BR-F150-02)', async () => {
    // User 2 now endorses User 1 back (reciprocal)
    const recipRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/endorsements',
      headers: { authorization: `Bearer ${user2Token}` },
      payload: {
        recipientId: user1Id,
        skillId,
        notes: 'Mutual endorsement',
      },
    });

    expect(recipRes.statusCode).toBe(201);
    const recipBody = JSON.parse(recipRes.body);
    expect(recipBody.endorsement.weight.isReciprocalDampened).toBe(true);
  });

  it('computes aggregated endorsement strength and displays to candidate profile', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/skills/endorsements/recipients/${user2Id}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.aggregate.totalCount).toBeGreaterThanOrEqual(1);
    expect(body.aggregate.totalWeight).toBeGreaterThan(0);
    expect(body.aggregate.firstDegreeCount).toBeGreaterThanOrEqual(1);
    expect(body.endorsements.length).toBeGreaterThanOrEqual(1);
  });

  it('allows endorser to revoke endorsement within 30 days', async () => {
    // 1. Create an endorsement from User 3 to User 2
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/endorsements',
      headers: { authorization: `Bearer ${user3Token}` },
      payload: {
        recipientId: user2Id,
        skillId,
      },
    });
    expect(createRes.statusCode).toBe(201);
    const endId = JSON.parse(createRes.body).endorsement.id;

    // 2. Unauthorized user cannot revoke
    const unauthRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/skills/endorsements/${endId}`,
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(unauthRes.statusCode).toBe(403);

    // 3. Original endorser can revoke
    const revokeRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/skills/endorsements/${endId}`,
      headers: { authorization: `Bearer ${user3Token}` },
    });
    expect(revokeRes.statusCode).toBe(200);
    const revData = JSON.parse(revokeRes.body);
    expect(revData.endorsement.status).toBe('revoked');
  });

  it('inspects user given endorsements and remaining weekly quota', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/skills/endorsements/my/given',
      headers: { authorization: `Bearer ${user1Token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.weeklyQuotaRemaining).toBeLessThanOrEqual(5);
    expect(body.totalGiven).toBeGreaterThanOrEqual(1);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Warm Introduction Paths (F-121, S-11, BR-209..BR-216)', () => {
  let app: FastifyInstance;
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;
  let userCToken: string;
  let userCId: string;
  let introRequestId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
    });
    await app.ready();

    // 1. Register User A (Requester: Alice)
    const resA = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `alice.warm.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Alice Requester',
        role: 'candidate',
      },
    });
    expect(resA.statusCode).toBe(201);
    const bodyA = JSON.parse(resA.payload);
    userAToken = bodyA.token;
    userAId = bodyA.user.id;

    // 2. Register User B (Introducer: Bob)
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `bob.warm.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Bob Introducer',
        role: 'candidate',
      },
    });
    expect(resB.statusCode).toBe(201);
    const bodyB = JSON.parse(resB.payload);
    userBToken = bodyB.token;
    userBId = bodyB.user.id;

    // 3. Register User C (Target: Charlie)
    const resC = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `charlie.warm.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Charlie Target',
        role: 'candidate',
      },
    });
    expect(resC.statusCode).toBe(201);
    const bodyC = JSON.parse(resC.payload);
    userCToken = bodyC.token;
    userCId = bodyC.user.id;

    // 4. Form connection A <-> B
    const connReq1 = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { recipientId: userBId, note: 'Connecting with Bob' },
    });
    expect(connReq1.statusCode).toBe(201);
    const conn1 = JSON.parse(connReq1.payload).connection;

    const accept1 = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${conn1.id}/respond`,
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { action: 'accept' },
    });
    expect(accept1.statusCode).toBe(200);

    // 5. Form connection B <-> C
    const connReq2 = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { recipientId: userCId, note: 'Connecting with Charlie' },
    });
    expect(connReq2.statusCode).toBe(201);
    const conn2 = JSON.parse(connReq2.payload).connection;

    const accept2 = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${conn2.id}/respond`,
      headers: { authorization: `Bearer ${userCToken}` },
      payload: { action: 'accept' },
    });
    expect(accept2.statusCode).toBe(200);
  });

  it('discovers 2-hop warm introduction path A -> B -> C (BR-210, BR-215)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/networking/warm-intros/paths?targetUserId=${userCId}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.paths).toHaveLength(1);
    expect(body.paths[0].targetUserId).toBe(userCId);
    expect(body.paths[0].introducerUserId).toBe(userBId);
    expect(body.paths[0].hops).toBe(2);
  });

  it('honors introducer opt-out preference during path discovery (BR-212)', async () => {
    // Bob opts out of being an introducer
    const prefRes = await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/preferences',
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { optOutIntroducer: true },
    });
    expect(prefRes.statusCode).toBe(200);
    expect(JSON.parse(prefRes.payload).preferences.optOutIntroducer).toBe(true);

    // Alice searches for path to Charlie -> Bob is excluded
    const pathRes = await app.inject({
      method: 'GET',
      url: `/api/v1/networking/warm-intros/paths?targetUserId=${userCId}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(pathRes.statusCode).toBe(200);
    expect(JSON.parse(pathRes.payload).paths).toHaveLength(0);

    // Reset Bob opt-out
    await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/preferences',
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { optOutIntroducer: false },
    });
  });

  it('honors target block-all-intros preference during path discovery (BR-213)', async () => {
    // Charlie blocks all incoming intros
    await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/preferences',
      headers: { authorization: `Bearer ${userCToken}` },
      payload: { blockAllIncomingIntros: true },
    });

    // Alice searches for path -> Charlie blocked all intros -> empty paths
    const pathRes = await app.inject({
      method: 'GET',
      url: `/api/v1/networking/warm-intros/paths?targetUserId=${userCId}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(pathRes.statusCode).toBe(200);
    expect(JSON.parse(pathRes.payload).paths).toHaveLength(0);

    // Reset Charlie preference
    await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/preferences',
      headers: { authorization: `Bearer ${userCToken}` },
      payload: { blockAllIncomingIntros: false },
    });
  });

  it('creates warm introduction request in pending_introducer status (BR-209, BR-211)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/requests',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        targetUserId: userCId,
        introducerUserId: userBId,
        purpose: 'Discuss open backend role at your company',
        note: 'Hi Bob, would love an intro to Charlie to learn about the backend team!',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.request.id).toBeDefined();
    expect(body.request.status).toBe('pending_introducer');
    expect(body.request.requesterUserId).toBe(userAId);
    expect(body.request.introducerUserId).toBe(userBId);
    expect(body.request.targetUserId).toBe(userCId);
    introRequestId = body.request.id;
  });

  it('lists outgoing requests for requester and incoming requests for introducer', async () => {
    // Alice outgoing
    const outRes = await app.inject({
      method: 'GET',
      url: '/api/v1/networking/warm-intros/requests/outgoing',
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(outRes.statusCode).toBe(200);
    const outBody = JSON.parse(outRes.payload);
    expect(outBody.requests.some((r: any) => r.id === introRequestId)).toBe(true);

    // Bob incoming
    const inRes = await app.inject({
      method: 'GET',
      url: '/api/v1/networking/warm-intros/requests/incoming',
      headers: { authorization: `Bearer ${userBToken}` },
    });
    expect(inRes.statusCode).toBe(200);
    const inBody = JSON.parse(inRes.payload);
    expect(inBody.requests.some((r: any) => r.id === introRequestId)).toBe(true);
  });

  it('isolates pending request from target until introducer approves (BR-209)', async () => {
    // Charlie should be forbidden from accessing the pending request
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/networking/warm-intros/requests/${introRequestId}`,
      headers: { authorization: `Bearer ${userCToken}` },
    });

    expect(res.statusCode).toBe(403);
  });

  it('allows designated introducer to approve request and creates three-way thread (BR-209, BR-214)', async () => {
    // Requester cannot approve
    const failRes = await app.inject({
      method: 'POST',
      url: `/api/v1/networking/warm-intros/requests/${introRequestId}/respond`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { decision: 'approve' },
    });
    expect(failRes.statusCode).toBe(403);

    // Introducer approves
    const approveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/networking/warm-intros/requests/${introRequestId}/respond`,
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { decision: 'approve' },
    });

    expect(approveRes.statusCode).toBe(200);
    const body = JSON.parse(approveRes.payload);
    expect(body.request.status).toBe('approved');
    expect(body.request.threadId).toBeDefined();
    expect(body.request.deliveredAt).toBeDefined();

    // Now target Charlie CAN access the approved request
    const charlieRes = await app.inject({
      method: 'GET',
      url: `/api/v1/networking/warm-intros/requests/${introRequestId}`,
      headers: { authorization: `Bearer ${userCToken}` },
    });
    expect(charlieRes.statusCode).toBe(200);
    expect(JSON.parse(charlieRes.payload).request.id).toBe(introRequestId);
  });

  it('supports declining introduction with a reason', async () => {
    // Alice sends another request
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/networking/warm-intros/requests',
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        targetUserId: userCId,
        introducerUserId: userBId,
        purpose: 'Follow-up question',
        note: 'Could we chat again?',
      },
    });
    expect(reqRes.statusCode).toBe(201);
    const secondReqId = JSON.parse(reqRes.payload).request.id;

    // Bob declines
    const declineRes = await app.inject({
      method: 'POST',
      url: `/api/v1/networking/warm-intros/requests/${secondReqId}/respond`,
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { decision: 'decline', reason: 'Not in regular contact right now' },
    });

    expect(declineRes.statusCode).toBe(200);
    const body = JSON.parse(declineRes.payload);
    expect(body.request.status).toBe('declined');
    expect(body.request.declineReason).toBe('Not in regular contact right now');
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Warm Introduction Paths (F-121, S-11, BR-209..BR-216, P-02)', () => {
  let aliceToken: string;
  let aliceUserId: string;
  let bobToken: string;
  let bobUserId: string;
  let charlieToken: string;
  let charlieUserId: string;
  let introRequestId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register Alice (Requester)
    const resA = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `alice.warm.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alice Requester',
        role: 'candidate',
      },
    });
    expect(resA.status()).toBe(201);
    const dataA = await resA.json();
    aliceToken = dataA.token;
    aliceUserId = dataA.user.id;

    // 2. Register Bob (Introducer)
    const resB = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `bob.warm.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Bob Introducer',
        role: 'candidate',
      },
    });
    expect(resB.status()).toBe(201);
    const dataB = await resB.json();
    bobToken = dataB.token;
    bobUserId = dataB.user.id;

    // 3. Register Charlie (Target)
    const resC = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `charlie.warm.e2e.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Charlie Target',
        role: 'candidate',
      },
    });
    expect(resC.status()).toBe(201);
    const dataC = await resC.json();
    charlieToken = dataC.token;
    charlieUserId = dataC.user.id;

    // 4. Connect Alice <-> Bob
    const conn1 = await request.post(`${API_BASE}/connections/request`, {
      headers: { authorization: `Bearer ${aliceToken}` },
      data: { recipientId: bobUserId, note: 'Hi Bob, connecting!' },
    });
    expect(conn1.status()).toBe(201);
    const conn1Data = await conn1.json();

    const accept1 = await request.post(`${API_BASE}/connections/${conn1Data.connection.id}/respond`, {
      headers: { authorization: `Bearer ${bobToken}` },
      data: { action: 'accept' },
    });
    expect(accept1.status()).toBe(200);

    // 5. Connect Bob <-> Charlie
    const conn2 = await request.post(`${API_BASE}/connections/request`, {
      headers: { authorization: `Bearer ${bobToken}` },
      data: { recipientId: charlieUserId, note: 'Hi Charlie, connecting!' },
    });
    expect(conn2.status()).toBe(201);
    const conn2Data = await conn2.json();

    const accept2 = await request.post(`${API_BASE}/connections/${conn2Data.connection.id}/respond`, {
      headers: { authorization: `Bearer ${charlieToken}` },
      data: { action: 'accept' },
    });
    expect(accept2.status()).toBe(200);
  });

  test('discovers warm introduction path Alice -> Bob -> Charlie (BR-210, BR-215)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/networking/warm-intros/paths?targetUserId=${charlieUserId}`, {
      headers: { authorization: `Bearer ${aliceToken}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.paths).toHaveLength(1);
    expect(body.paths[0].targetUserId).toBe(charlieUserId);
    expect(body.paths[0].introducerUserId).toBe(bobUserId);
    expect(body.paths[0].hops).toBe(2);
  });

  test('creates warm introduction request in pending status and isolates from target (BR-209, BR-211)', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/networking/warm-intros/requests`, {
      headers: { authorization: `Bearer ${aliceToken}` },
      data: {
        targetUserId: charlieUserId,
        introducerUserId: bobUserId,
        purpose: 'Mentorship and technical architecture advice',
        note: 'Hey Bob, Charlie has great domain knowledge in our field, could you introduce us?',
      },
    });

    expect(createRes.status()).toBe(201);
    const createBody = await createRes.json();
    expect(createBody.request.id).toBeDefined();
    expect(createBody.request.status).toBe('pending_introducer');
    expect(createBody.request.threadId).toBeUndefined();
    introRequestId = createBody.request.id;

    // Verify target Charlie cannot see request while pending (BR-209)
    const getRes = await request.get(`${API_BASE}/networking/warm-intros/requests/${introRequestId}`, {
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(getRes.status()).toBe(403);
  });

  test('introducer approves request, establishing three-way thread and granting target access (BR-209, BR-214)', async ({ request }) => {
    // Bob approves the intro
    const respondRes = await request.post(`${API_BASE}/networking/warm-intros/requests/${introRequestId}/respond`, {
      headers: { authorization: `Bearer ${bobToken}` },
      data: { decision: 'approve' },
    });

    expect(respondRes.status()).toBe(200);
    const body = await respondRes.json();
    expect(body.request.status).toBe('approved');
    expect(body.request.threadId).toBeDefined();
    expect(body.request.deliveredAt).toBeDefined();

    // Now Charlie CAN access the approved introduction
    const targetGetRes = await request.get(`${API_BASE}/networking/warm-intros/requests/${introRequestId}`, {
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(targetGetRes.status()).toBe(200);
    const targetData = await targetGetRes.json();
    expect(targetData.request.id).toBe(introRequestId);
    expect(targetData.request.status).toBe('approved');
  });

  test('introducer can decline introduction with reason', async ({ request }) => {
    // Alice submits another request
    const createRes = await request.post(`${API_BASE}/networking/warm-intros/requests`, {
      headers: { authorization: `Bearer ${aliceToken}` },
      data: {
        targetUserId: charlieUserId,
        introducerUserId: bobUserId,
        purpose: 'Second connection request',
        note: 'Another note',
      },
    });
    expect(createRes.status()).toBe(201);
    const secondReqId = (await createRes.json()).request.id;

    // Bob declines
    const declineRes = await request.post(`${API_BASE}/networking/warm-intros/requests/${secondReqId}/respond`, {
      headers: { authorization: `Bearer ${bobToken}` },
      data: { decision: 'decline', reason: 'Too busy with current sprint commitments' },
    });

    expect(declineRes.status()).toBe(200);
    const declineBody = await declineRes.json();
    expect(declineBody.request.status).toBe('declined');
    expect(declineBody.request.declineReason).toBe('Too busy with current sprint commitments');
  });

  test('user can update warm intro preferences to opt out of introducing (BR-212)', async ({ request }) => {
    // Bob opts out
    const prefRes = await request.post(`${API_BASE}/networking/warm-intros/preferences`, {
      headers: { authorization: `Bearer ${bobToken}` },
      data: { optOutIntroducer: true },
    });

    expect(prefRes.status()).toBe(200);
    const prefBody = await prefRes.json();
    expect(prefBody.preferences.optOutIntroducer).toBe(true);

    // Alice queries paths -> Bob is excluded
    const pathRes = await request.get(`${API_BASE}/networking/warm-intros/paths?targetUserId=${charlieUserId}`, {
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(pathRes.status()).toBe(200);
    expect((await pathRes.json()).paths).toHaveLength(0);
  });
});

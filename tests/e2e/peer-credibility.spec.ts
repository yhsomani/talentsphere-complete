import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Peer Credibility Networks & Endorsement Weighting (F-150, F-110, F-144, P-02)', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let skillId: string;

  test.beforeAll(async ({ request }) => {
    const timestamp = Date.now();

    // 1. Register Alice
    const reg1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `alice.cred.${timestamp}@peercloud.io`,
        password: 'Password123!Secure',
        fullName: 'Alice Specialist',
        role: 'candidate',
      },
    });
    expect(reg1.status()).toBe(201);
    const data1 = await reg1.json();
    user1Id = data1.user.id;
    user1Token = data1.token;

    // 2. Register Bob
    const reg2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `bob.cred.${timestamp}@peercloud.io`,
        password: 'Password123!Secure',
        fullName: 'Bob Developer',
        role: 'candidate',
      },
    });
    expect(reg2.status()).toBe(201);
    const data2 = await reg2.json();
    user2Id = data2.user.id;
    user2Token = data2.token;

    // 3. Connect Alice and Bob directly (Distance 1)
    const connReq = await request.post(`${API_BASE}/connections/request`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: { recipientId: user2Id, note: 'Direct network connection' },
    });
    expect(connReq.status()).toBe(201);
    const connData = await connReq.json();
    const connId = connData.connection.id;

    const acceptRes = await request.post(`${API_BASE}/connections/${connId}/respond`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: { action: 'accept' },
    });
    expect(acceptRes.status()).toBe(200);

    // 4. Retrieve canonical skill (TypeScript)
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    const skillsData = await skillsRes.json();
    const ts = skillsData.skills.find((s: any) => s.name.toLowerCase().includes('typescript'));
    skillId = ts ? ts.id : skillsData.skills[0].id;
  });

  test('endorses a 1st-degree peer with deterministic credibility weight breakdown (F-150 Acceptance)', async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/skills/endorsements`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        recipientId: user2Id,
        skillId,
        notes: 'Incredible depth in TypeScript type-level metaprogramming',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.endorsement.recipientId).toBe(user2Id);
    expect(body.endorsement.endorserId).toBe(user1Id);
    expect(body.endorsement.status).toBe('active');

    // Deterministic Weight Verification
    const weight = body.endorsement.weight;
    expect(weight.networkDistance).toBe(1);
    expect(weight.distanceFactor).toBe(1.0);
    expect(weight.finalWeight).toBeGreaterThan(0.2);
    expect(weight.isReciprocalDampened).toBe(false);
  });

  test('detects reciprocal endorsement rings and applies collusion dampening (BR-F150-02)', async ({
    request,
  }) => {
    // Bob endorses Alice back within the reciprocal window
    const recipRes = await request.post(`${API_BASE}/skills/endorsements`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: {
        recipientId: user1Id,
        skillId,
        notes: 'Reciprocal endorsement back to Alice',
      },
    });

    expect(recipRes.status()).toBe(201);
    const recipBody = await recipRes.json();
    expect(recipBody.endorsement.weight.isReciprocalDampened).toBe(true);
  });

  test('prevents self-endorsement and duplicate active endorsements (BR-153)', async ({
    request,
  }) => {
    // 1. Self endorsement rejected
    const selfRes = await request.post(`${API_BASE}/skills/endorsements`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        recipientId: user1Id,
        skillId,
      },
    });
    expect(selfRes.status()).toBe(403);

    // 2. Duplicate endorsement rejected
    const dupRes = await request.post(`${API_BASE}/skills/endorsements`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        recipientId: user2Id,
        skillId,
      },
    });
    expect(dupRes.status()).toBe(409);
  });

  test('displays aggregated endorsement strength on candidate profile and supports 30-day revocation', async ({
    request,
  }) => {
    // 1. Query recipient endorsements
    const queryRes = await request.get(`${API_BASE}/skills/endorsements/recipients/${user2Id}`);
    expect(queryRes.status()).toBe(200);
    const queryBody = await queryRes.json();

    expect(queryBody.aggregate.totalCount).toBeGreaterThanOrEqual(1);
    expect(queryBody.aggregate.totalWeight).toBeGreaterThan(0);
    expect(queryBody.aggregate.firstDegreeCount).toBeGreaterThanOrEqual(1);

    const activeEndorsement = queryBody.endorsements.find((e: any) => e.endorserId === user1Id);
    expect(activeEndorsement).toBeDefined();

    // 2. Alice revokes her endorsement
    const revokeRes = await request.delete(
      `${API_BASE}/skills/endorsements/${activeEndorsement.id}`,
      {
        headers: { authorization: `Bearer ${user1Token}` },
      }
    );
    expect(revokeRes.status()).toBe(200);

    // 3. Verify aggregate count drops
    const postRevokeRes = await request.get(
      `${API_BASE}/skills/endorsements/recipients/${user2Id}`
    );
    expect(postRevokeRes.status()).toBe(200);
    const postBody = await postRevokeRes.json();
    expect(postBody.endorsements.some((e: any) => e.id === activeEndorsement.id)).toBe(false);
  });
});

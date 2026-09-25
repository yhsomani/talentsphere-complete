import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Resume Builder, Networking & Portfolio Showcase (F-09, F-10, F-30, BR-26)', () => {
  let user1Token: string;
  let user1Id: string;
  let user1ProfileId: string;

  let user2Token: string;
  let user2Id: string;
  let user2ProfileId: string;

  let resumeId: string;
  let exportId: string;
  let connectionId: string;
  let projectId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register User 1
    const u1Res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `networking.user1.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Dev Lead One',
        role: 'candidate',
      },
    });
    expect(u1Res.status()).toBe(201);
    const u1Data = await u1Res.json();
    user1Token = u1Data.token;
    user1Id = u1Data.user.id;
    user1ProfileId = u1Data.profile.id;

    // 2. Register User 2
    const u2Res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `networking.user2.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Architect Two',
        role: 'candidate',
      },
    });
    expect(u2Res.status()).toBe(201);
    const u2Data = await u2Res.json();
    user2Token = u2Data.token;
    user2Id = u2Data.user.id;
    user2ProfileId = u2Data.profile.id;
  });

  test('creates resume, performs append-only exports, and verifies soft-delete (F-13, BR-26)', async ({ request }) => {
    // 1. Create Resume
    const createRes = await request.post(`${API_BASE}/resumes`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        title: 'Principal Systems Architect 2026',
        targetRole: 'Staff / Principal Engineer',
        summary: 'Expert in high-throughput distributed architectures and type-safe systems.',
      },
    });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    resumeId = createData.resume.id;
    expect(createData.resume.title).toBe('Principal Systems Architect 2026');

    // 2. Create Immutable Resume Export (PDF format)
    const exportRes = await request.post(`${API_BASE}/resumes/${resumeId}/export`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        format: 'pdf',
      },
    });
    expect(exportRes.status()).toBe(201);
    const exportData = await exportRes.json();
    exportId = exportData.export.id;
    expect(exportData.export.status).toBe('active');
    expect(exportData.export.sha256Hash).toBeDefined();
    expect(exportData.export.sha256Hash.length).toBe(64);

    // 3. Soft-delete resume export (BR-26)
    const delRes = await request.delete(`${API_BASE}/resumes/exports/${exportId}`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(delRes.status()).toBe(200);
    const delData = await delRes.json();
    expect(delData.export.status).toBe('deleted');

    // 4. Verify soft-delete: omitted by default, present when includeDeleted=true
    const activeExportsRes = await request.get(`${API_BASE}/resumes/${resumeId}/exports`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(activeExportsRes.status()).toBe(200);
    const activeExportsData = await activeExportsRes.json();
    expect(activeExportsData.exports.some((e: any) => e.id === exportId)).toBe(false);

    const allExportsRes = await request.get(`${API_BASE}/resumes/${resumeId}/exports?includeDeleted=true`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(allExportsRes.status()).toBe(200);
    const allExportsData = await allExportsRes.json();
    expect(allExportsData.exports.some((e: any) => e.id === exportId)).toBe(true);
  });

  test('performs professional connection handshake and creates portfolio project (F-09, F-30)', async ({ request }) => {
    // 1. Anti-self connection check
    const selfConnRes = await request.post(`${API_BASE}/connections/request`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        recipientId: user1ProfileId,
        note: 'Connecting with myself.',
      },
    });
    expect(selfConnRes.status()).toBe(422);

    // 2. User 1 sends connection request to User 2
    const reqRes = await request.post(`${API_BASE}/connections/request`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        recipientId: user2ProfileId,
        note: 'Loved your work on high performance async messaging.',
      },
    });
    expect(reqRes.status()).toBe(201);
    const reqData = await reqRes.json();
    connectionId = reqData.connection.id;
    expect(reqData.connection.status).toBe('pending');

    // 3. User 2 accepts connection request
    const respondRes = await request.post(`${API_BASE}/connections/${connectionId}/respond`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: {
        action: 'accept',
      },
    });
    expect(respondRes.status()).toBe(200);
    const respondData = await respondRes.json();
    expect(respondData.connection.status).toBe('accepted');

    // 4. Verify connection status endpoint
    const statusRes = await request.get(`${API_BASE}/connections/status/${user2ProfileId}`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(statusRes.status()).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.isConnected).toBe(true);
    expect(statusData.status).toBe('accepted');

    // 5. Create Portfolio Project
    const projRes = await request.post(`${API_BASE}/portfolio/projects`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        title: 'Distributed Transaction Coordinator',
        description: 'Two-phase commit coordinator with Raft consensus in Rust and TypeScript.',
        visibility: 'public',
        repoUrl: 'https://github.com/talentsphere/dist-tx',
      },
    });
    expect(projRes.status()).toBe(201);
    const projData = await projRes.json();
    projectId = projData.project.id;
    expect(projData.project.visibility).toBe('public');

    // 6. Public inspection of portfolio project
    const viewProjRes = await request.get(`${API_BASE}/portfolio/projects/${projectId}`);
    expect(viewProjRes.status()).toBe(200);
    const viewProjData = await viewProjRes.json();
    expect(viewProjData.project.title).toBe('Distributed Transaction Coordinator');
  });
});

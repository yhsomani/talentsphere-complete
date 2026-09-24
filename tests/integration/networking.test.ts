import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Professional Networking & Connection Requests Integration (F-09)', () => {
  let app: FastifyInstance;

  let candidateAToken: string;
  let candidateAUserId: string;
  let candidateAProfileId: string;

  let candidateBToken: string;
  let candidateBUserId: string;
  let candidateBProfileId: string;

  let candidateCToken: string;
  let candidateCUserId: string;
  let candidateCProfileId: string;

  let candidateDToken: string;
  let candidateDUserId: string;
  let candidateDProfileId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 3000,
      SESSION_SECRET: 'test_jwt_secret_at_least_32_characters_long_for_security',
    });
    await app.ready();

    // Register Candidate A
    const resA = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'networking_candidate_a@example.com',
        password: 'Password123!',
        fullName: 'Alice Walker',
        role: 'candidate',
      },
    });
    expect(resA.statusCode).toBe(201);
    const bodyA = resA.json();
    candidateAToken = bodyA.token;
    candidateAUserId = bodyA.user.id;
    candidateAProfileId = bodyA.profile.id;

    // Register Candidate B
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'networking_candidate_b@example.com',
        password: 'Password123!',
        fullName: 'Bob Martinez',
        role: 'candidate',
      },
    });
    expect(resB.statusCode).toBe(201);
    const bodyB = resB.json();
    candidateBToken = bodyB.token;
    candidateBUserId = bodyB.user.id;
    candidateBProfileId = bodyB.profile.id;

    // Register Candidate C
    const resC = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'networking_candidate_c@example.com',
        password: 'Password123!',
        fullName: 'Charlie Davis',
        role: 'candidate',
      },
    });
    expect(resC.statusCode).toBe(201);
    const bodyC = resC.json();
    candidateCToken = bodyC.token;
    candidateCUserId = bodyC.user.id;
    candidateCProfileId = bodyC.profile.id;

    // Register Candidate D
    const resD = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'networking_candidate_d@example.com',
        password: 'Password123!',
        fullName: 'Dana Evans',
        role: 'candidate',
      },
    });
    expect(resD.statusCode).toBe(201);
    const bodyD = resD.json();
    candidateDToken = bodyD.token;
    candidateDUserId = bodyD.user.id;
    candidateDProfileId = bodyD.profile.id;
  });

  it('rejects self-connection requests (Anti-Self Invariant)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: {
        recipientId: candidateAUserId,
        note: 'Connecting with myself',
      },
    });

    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe('VALIDATION_FAILED');
    expect(res.json().error.message).toMatch(/Cannot send a connection request to yourself/);
  });

  it('successfully creates a connection request and triggers notifications and worker jobs', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: {
        recipientId: candidateBUserId,
        note: 'Hi Bob, excited to connect on TalentSphere!',
      },
    });

    expect(res.statusCode).toBe(201);
    const data = res.json();
    expect(data.connection).toBeDefined();
    expect(data.connection.senderId).toBe(candidateAUserId);
    expect(data.connection.recipientId).toBe(candidateBUserId);
    expect(data.connection.status).toBe('pending');
    expect(data.connection.note).toBe('Hi Bob, excited to connect on TalentSphere!');

    // Check Candidate B received a notification
    const notifsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    expect(notifsRes.statusCode).toBe(200);
    const notifs = notifsRes.json().notifications;
    const reqNotif = notifs.find((n: any) => n.type === 'connection_request');
    expect(reqNotif).toBeDefined();
    expect(reqNotif.title).toBe('New Connection Request');
    expect(reqNotif.body).toContain('Alice Walker');

    // Check async worker job was enqueued
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(jobsRes.statusCode).toBe(200);
    const reqJob = jobsRes.json().jobs.find((j: any) => j.type === 'connection.requested');
    expect(reqJob).toBeDefined();
    expect(reqJob.payload.connectionId).toBe(data.connection.id);
  });

  it('correctly reports connection status as pending prior to response', async () => {
    const resA = await app.inject({
      method: 'GET',
      url: `/api/v1/connections/status/${candidateBUserId}`,
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(resA.statusCode).toBe(200);
    expect(resA.json().status).toBe('pending');
    expect(resA.json().isConnected).toBe(false);

    const resB = await app.inject({
      method: 'GET',
      url: `/api/v1/connections/status/${candidateAUserId}`,
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    expect(resB.statusCode).toBe(200);
    expect(resB.json().status).toBe('pending');
    expect(resB.json().isConnected).toBe(false);
  });

  it('prevents sender or third party from accepting a connection request', async () => {
    // Get pending connection ID
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=pending_received',
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    const connId = listRes.json().connections[0].id;

    // Sender attempts accept
    const senderRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: { action: 'accept' },
    });
    expect(senderRes.statusCode).toBe(403);
    expect(senderRes.json().error.code).toBe('FORBIDDEN');

    // Third party attempts accept
    const thirdPartyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${candidateCToken}` },
      payload: { action: 'accept' },
    });
    expect(thirdPartyRes.statusCode).toBe(403);
    expect(thirdPartyRes.json().error.code).toBe('FORBIDDEN');
  });

  it('allows recipient to accept connection and updates relationship state', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=pending_received',
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    const connId = listRes.json().connections[0].id;

    const acceptRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${candidateBToken}` },
      payload: { action: 'accept' },
    });

    expect(acceptRes.statusCode).toBe(200);
    const conn = acceptRes.json().connection;
    expect(conn.status).toBe('accepted');
    expect(conn.acceptedAt).toBeDefined();

    // Check Candidate A received acceptance notification
    const notifsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    const notifs = notifsRes.json().notifications;
    const acceptNotif = notifs.find((n: any) => n.type === 'connection_accepted');
    expect(acceptNotif).toBeDefined();
    expect(acceptNotif.body).toContain('Bob Martinez');

    // Check status endpoint
    const statusRes = await app.inject({
      method: 'GET',
      url: `/api/v1/connections/status/${candidateBUserId}`,
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.json().status).toBe('accepted');
    expect(statusRes.json().isConnected).toBe(true);

    // Check listing accepted connections for both users
    const connsA = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=accepted',
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(connsA.json().connections.length).toBe(1);

    const connsB = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=accepted',
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    expect(connsB.json().connections.length).toBe(1);
  });

  it('prevents duplicate connection requests when already connected', async () => {
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: {
        recipientId: candidateBUserId,
      },
    });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.json().error.code).toBe('CONFLICT');
  });

  it('allows sender to withdraw a pending connection request', async () => {
    // A sends request to C
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: { recipientId: candidateCUserId },
    });
    expect(reqRes.statusCode).toBe(201);
    const connId = reqRes.json().connection.id;

    // Recipient C cannot withdraw
    const wrongWithdraw = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/withdraw`,
      headers: { authorization: `Bearer ${candidateCToken}` },
    });
    expect(wrongWithdraw.statusCode).toBe(403);

    // Sender A withdraws
    const withdrawRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/withdraw`,
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(withdrawRes.statusCode).toBe(200);
    expect(withdrawRes.json().connection.status).toBe('withdrawn');
  });

  it('allows recipient to reject a pending connection request', async () => {
    // A sends request to D
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${candidateAToken}` },
      payload: { recipientId: candidateDUserId },
    });
    expect(reqRes.statusCode).toBe(201);
    const connId = reqRes.json().connection.id;

    // D rejects request
    const rejectRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${candidateDToken}` },
      payload: { action: 'reject' },
    });
    expect(rejectRes.statusCode).toBe(200);
    expect(rejectRes.json().connection.status).toBe('rejected');
  });

  it('allows participants to disconnect/delete an accepted connection', async () => {
    // Check A and B are connected
    const connsA = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=accepted',
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    const connId = connsA.json().connections[0].id;

    // Uninvolved third party (C) tries to delete connection
    const unauthDel = await app.inject({
      method: 'DELETE',
      url: `/api/v1/connections/${connId}`,
      headers: { authorization: `Bearer ${candidateCToken}` },
    });
    expect(unauthDel.statusCode).toBe(403);

    // Participant A deletes connection
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/connections/${connId}`,
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(delRes.statusCode).toBe(200);
    expect(delRes.json().deletedId).toBe(connId);

    // Verify connection no longer exists in accepted lists
    const afterConnsA = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=accepted',
      headers: { authorization: `Bearer ${candidateAToken}` },
    });
    expect(afterConnsA.json().connections.length).toBe(0);

    const afterConnsB = await app.inject({
      method: 'GET',
      url: '/api/v1/connections?status=accepted',
      headers: { authorization: `Bearer ${candidateBToken}` },
    });
    expect(afterConnsB.json().connections.length).toBe(0);
  });
});

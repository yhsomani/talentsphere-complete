// C-29: the "Allow connection requests" setting is honoured, and a
// connections-only profile is visible to an accepted connection (and nobody
// else without a privileged role), as connections-only portfolio projects are.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

type Json = Record<string, any>;

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH',
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

async function register(app: FastifyInstance, email: string) {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: email.split('@')[0],
    role: 'candidate',
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

describe('Connection requests and connections-only profiles (C-29)', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
  });
  afterAll(() => app.close());

  it('refuses a connection request when the recipient does not accept them', async () => {
    const sender = await register(app, 'sender.c29@example.com');
    const recipient = await register(app, 'closed.c29@example.com');
    const off = await call(app, 'PATCH', '/api/v1/settings', recipient.token, {
      allowConnectionRequests: false,
    });
    expect(off.status).toBe(200);

    const refused = await call(app, 'POST', '/api/v1/connections/request', sender.token, {
      recipientId: recipient.user.id,
    });
    expect(refused.status).toBe(403);
    expect(refused.body.error.message).toMatch(/not accepting connection requests/);

    await call(app, 'PATCH', '/api/v1/settings', recipient.token, {
      allowConnectionRequests: true,
    });
    const accepted = await call(app, 'POST', '/api/v1/connections/request', sender.token, {
      recipientId: recipient.user.id,
    });
    expect(accepted.status).toBe(201);
  });

  it('shows a connections-only profile and its evidence to a connection, not a stranger', async () => {
    const owner = await register(app, 'owner.c29@example.com');
    const peer = await register(app, 'peer.c29@example.com');
    const stranger = await register(app, 'stranger.c29@example.com');
    const evidence = await call(app, 'POST', '/api/v1/evidence', owner.token, {
      type: 'project',
      title: 'Connections-only project',
      description: '',
      source: 'self',
      provenance: 'direct_entry',
      recencyDate: '2026-06-01',
    });
    expect(evidence.status).toBe(201);
    const privacy = await call(app, 'PATCH', '/api/v1/profile/me', owner.token, {
      privacy: 'connections_only',
    });
    expect(privacy.status).toBe(200);

    const profileUrl = `/api/v1/profile/${owner.profile.id}`;
    const evidenceUrl = `/api/v1/evidence/subject/${owner.profile.id}`;
    // Before any connection, the peer is a stranger too.
    expect((await call(app, 'GET', profileUrl, peer.token)).status).toBe(403);

    const request = await call(app, 'POST', '/api/v1/connections/request', peer.token, {
      recipientId: owner.user.id,
    });
    expect(request.status).toBe(201);
    // A pending request is not a connection.
    expect((await call(app, 'GET', profileUrl, peer.token)).status).toBe(403);
    const accept = await call(
      app,
      'POST',
      `/api/v1/connections/${request.body.connection.id}/respond`,
      owner.token,
      { action: 'accept' }
    );
    expect(accept.status).toBe(200);

    expect((await call(app, 'GET', profileUrl, peer.token)).status).toBe(200);
    const peerEvidence = await call(app, 'GET', evidenceUrl, peer.token);
    expect(peerEvidence.status).toBe(200);
    expect(peerEvidence.body.evidence).toHaveLength(1);

    expect((await call(app, 'GET', profileUrl, stranger.token)).status).toBe(403);
    expect((await call(app, 'GET', evidenceUrl, stranger.token)).status).toBe(403);
    expect((await call(app, 'GET', profileUrl)).status).toBe(403);

    // K-07: the activity score follows the same rule as the profile.
    const activityUrl = `/api/v1/activity/users/${owner.user.id}/score`;
    expect((await call(app, 'GET', activityUrl, peer.token)).status).toBe(200);
    expect((await call(app, 'GET', activityUrl, stranger.token)).status).toBe(403);
  });
});

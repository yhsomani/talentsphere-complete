/**
 * Who may start a conversation, and what a conversation is (2026-10-11).
 *
 * The product blueprint (§9.6) allows messaging only between connected
 * people, or between a recruiter and a candidate after an application. The
 * API used to let any signed-in user message any profile. Two people now
 * share one conversation, a retried send is stored once, and erasing an
 * account removes what that person wrote. Durability across a restart is
 * checked against Postgres in tests/pg/messaging.test.ts.
 */
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

async function register(app: FastifyInstance, email: string, fullName: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName,
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

describe('Messaging: who may start a conversation, and what one is', () => {
  let app: FastifyInstance;
  let rita: Json; // recruiter at Acme
  let tom: Json; // Rita's teammate at Acme
  let otto: Json; // recruiter at another company
  let casey: Json; // applied to Acme's job
  let jobId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    } as never);
    rita = await register(app, 'rita@acme.example', 'Rita Recruiter', 'recruiter');
    tom = await register(app, 'tom@acme.example', 'Tom Teammate', 'recruiter');
    otto = await register(app, 'otto@other.example', 'Otto Other', 'recruiter');
    casey = await register(app, 'casey@example.org', 'Casey Candidate');

    const org = await call(app, 'POST', '/api/v1/organizations', rita.token, {
      name: 'Acme',
      slug: 'acme-msg',
    });
    const orgId = org.body.organization.id;
    await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, rita.token, {
      userId: tom.user.id,
      role: 'recruiter',
    });
    await call(app, 'POST', '/api/v1/organizations', otto.token, {
      name: 'Other Co',
      slug: 'other-msg',
    });
    const job = await call(app, 'POST', '/api/v1/jobs', rita.token, {
      orgId,
      title: 'Platform Engineer',
      description: 'Own the deployment platform.',
      location: 'Remote',
    });
    jobId = job.body.job.id;
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, rita.token, { status: 'published' });
  });
  afterAll(() => app.close());

  it('lets nobody on the hiring side message a candidate before they apply', async () => {
    const res = await call(app, 'POST', '/api/v1/threads', rita.token, {
      recipientId: casey.profile.id,
      initialMessage: 'Interested in a role?',
    });
    expect(res.status).toBe(403);
  });

  it('after an application, the hiring team and the candidate can message each other — and nobody else can', async () => {
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, casey.token, {});
    expect(applied.status).toBe(201);

    const fromRita = await call(app, 'POST', '/api/v1/threads', rita.token, {
      recipientId: casey.profile.id,
      subject: 'Platform Engineer',
      initialMessage: 'Thanks for applying — are you free on Thursday?',
    });
    expect(fromRita.status).toBe(201);
    expect(fromRita.body.participants.map((p: Json) => p.fullName).sort()).toEqual([
      'Casey Candidate',
      'Rita Recruiter',
    ]);
    // A teammate on the same hiring team may start one too; the candidate may start one with them.
    expect(
      (
        await call(app, 'POST', '/api/v1/threads', casey.token, {
          recipientId: tom.profile.id,
          initialMessage: 'Hi Tom, a question about the role.',
        })
      ).status
    ).toBe(201);
    // A recruiter at a company the candidate never applied to may not.
    expect(
      (
        await call(app, 'POST', '/api/v1/threads', otto.token, {
          recipientId: casey.profile.id,
          initialMessage: 'Come work for us instead.',
        })
      ).status
    ).toBe(403);
  });

  it('keeps one conversation per pair of people: starting again adds to it', async () => {
    const again = await call(app, 'POST', '/api/v1/threads', casey.token, {
      recipientId: rita.profile.id,
      initialMessage: 'Thursday works for me.',
    });
    expect(again.status).toBe(200);
    expect(again.body.existing).toBe(true);
    const threads = (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads as Json[];
    expect(threads).toHaveLength(1);
    const thread = await call(app, 'GET', `/api/v1/threads/${threads[0].id}`, rita.token);
    expect(thread.body.messages.map((m: Json) => m.content)).toEqual([
      'Thanks for applying — are you free on Thursday?',
      'Thursday works for me.',
    ]);
  });

  it('tells the recipient, links to the conversation, and reading clears the unread count', async () => {
    const threadId = (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads[0].id;
    const sent = await call(app, 'POST', `/api/v1/threads/${threadId}/messages`, casey.token, {
      content: 'Shall I bring anything?',
    });
    expect(sent.status).toBe(201);

    const inbox = await call(app, 'GET', '/api/v1/notifications?type=message', rita.token);
    expect(inbox.body.notifications[0]).toMatchObject({
      type: 'message',
      title: 'New message from Casey Candidate',
      body: 'Shall I bring anything?',
      referenceType: 'thread',
      referenceId: threadId,
    });
    const before = (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads[0];
    expect(before.unreadCount).toBe(1);
    const bellBefore = (await call(app, 'GET', '/api/v1/notifications/summary', rita.token)).body
      .unreadCount;
    await call(app, 'GET', `/api/v1/threads/${threadId}`, rita.token);
    expect(
      (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads[0].unreadCount
    ).toBe(0);
    // ...and the bell stops counting messages already read in the conversation.
    const unreadAboutThread = (
      await call(app, 'GET', '/api/v1/notifications?type=message&unreadOnly=true', rita.token)
    ).body.notifications.filter((n: Json) => n.referenceId === threadId);
    expect(unreadAboutThread).toHaveLength(0);
    expect(
      (await call(app, 'GET', '/api/v1/notifications/summary', rita.token)).body.unreadCount
    ).toBeLessThan(bellBefore);
    // Reading is per person: Casey has nothing unread — the last word was hers.
    const caseysView = (await call(app, 'GET', '/api/v1/threads', casey.token)).body.threads.find(
      (t: Json) => t.id === threadId
    );
    expect(caseysView.unreadCount).toBe(0);
  });

  it('stores a retried send once', async () => {
    const thread = (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads[0];
    const send = () =>
      call(app, 'POST', `/api/v1/threads/${thread.id}/messages`, rita.token, {
        content: 'See you then.',
        clientMessageId: 'rita-see-you-1',
      });
    const results = await Promise.all([send(), send(), send()]);
    for (const r of results) expect([200, 201, 409]).toContain(r.status);
    const messages = (await call(app, 'GET', `/api/v1/threads/${thread.id}`, rita.token)).body
      .messages as Json[];
    expect(messages.filter((m) => m.content === 'See you then.')).toHaveLength(1);
  });

  it('erasing an account removes what that person wrote and leaves the other side’s own messages', async () => {
    const thread = (await call(app, 'GET', '/api/v1/threads', rita.token)).body.threads[0];
    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', casey.token);
    expect(erased.status).toBe(200);
    const view = await call(app, 'GET', `/api/v1/threads/${thread.id}`, rita.token);
    expect(view.status).toBe(200);
    // Casey's "Thursday works for me." and "Shall I bring anything?" are gone.
    expect(view.body.messages.map((m: Json) => m.content)).toEqual([
      'Thanks for applying — are you free on Thursday?',
      'See you then.',
    ]);
    expect(view.body.participants.map((p: Json) => p.fullName)).toEqual(['Rita Recruiter']);
  });
});

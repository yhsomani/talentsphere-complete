import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Direct Messaging Integration (F-10, WF-10)', () => {
  let app: FastifyInstance;
  let aliceToken: string;
  let aliceProfileId: string;
  let bobToken: string;
  let bobProfileId: string;
  let charlieToken: string;
  let charlieProfileId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 0,
      LOG_LEVEL: 'error',
    });
    await app.ready();

    // 1. Register Alice
    const aliceRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'alice.msg@example.com',
        password: 'Password123!',
        fullName: 'Alice Messaging',
        role: 'candidate',
      },
    });
    const aliceJson = aliceRes.json();
    aliceToken = aliceJson.token;
    aliceProfileId = aliceJson.profile.id;

    // 2. Register Bob
    const bobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'bob.msg@example.com',
        password: 'Password123!',
        fullName: 'Bob Messaging',
        role: 'candidate',
      },
    });
    const bobJson = bobRes.json();
    bobToken = bobJson.token;
    bobProfileId = bobJson.profile.id;

    // 3. Register Charlie
    const charlieRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'charlie.outsider@example.com',
        password: 'Password123!',
        fullName: 'Charlie Outsider',
        role: 'candidate',
      },
    });
    const charlieJson = charlieRes.json();
    charlieToken = charlieJson.token;
    charlieProfileId = charlieJson.profile.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('prevents self-messaging when creating threads', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        recipientId: aliceProfileId,
        initialMessage: 'Talking to myself',
      },
    });

    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe('VALIDATION_FAILED');
  });

  it('creates thread, sends initial message, and enforces participant privacy (F-10)', async () => {
    // 1. Alice creates thread with Bob
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        recipientId: bobProfileId,
        subject: 'TypeScript Collaboration',
        initialMessage: 'Hey Bob, want to pair on the Fastify modular monolith?',
        clientMessageId: 'alice-init-1',
      },
    });
    expect(createRes.statusCode).toBe(201);
    const threadData = createRes.json();
    const threadId = threadData.thread.id;
    expect(threadId).toBeDefined();
    expect(threadData.message.content).toContain('Hey Bob');

    // 2. Alice views threads -> 0 unread for Alice
    const aliceThreadsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(aliceThreadsRes.statusCode).toBe(200);
    const aliceThreads = aliceThreadsRes.json().threads;
    expect(aliceThreads).toHaveLength(1);
    expect(aliceThreads[0].unreadCount).toBe(0);

    // 3. Bob views threads -> 1 unread for Bob
    const bobThreadsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobThreadsRes.statusCode).toBe(200);
    const bobThreads = bobThreadsRes.json().threads;
    expect(bobThreads).toHaveLength(1);
    expect(bobThreads[0].unreadCount).toBe(1);

    // 4. Charlie (outsider) views threads -> 0 threads
    const charlieThreadsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(charlieThreadsRes.statusCode).toBe(200);
    expect(charlieThreadsRes.json().threads).toHaveLength(0);

    // 5. Charlie attempts to read Alice & Bob thread -> 403 FORBIDDEN
    const charlieReadRes = await app.inject({
      method: 'GET',
      url: `/api/v1/threads/${threadId}`,
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(charlieReadRes.statusCode).toBe(403);
    expect(charlieReadRes.json().error.code).toBe('FORBIDDEN');

    // 6. Charlie attempts to send message into Alice & Bob thread -> 403 FORBIDDEN
    const charlieSendRes = await app.inject({
      method: 'POST',
      url: `/api/v1/threads/${threadId}/messages`,
      headers: { authorization: `Bearer ${charlieToken}` },
      payload: {
        content: 'I am spying on you',
      },
    });
    expect(charlieSendRes.statusCode).toBe(403);
    expect(charlieSendRes.json().error.code).toBe('FORBIDDEN');

    // 7. Bob reads thread -> messages marked read
    const bobReadRes = await app.inject({
      method: 'GET',
      url: `/api/v1/threads/${threadId}`,
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobReadRes.statusCode).toBe(200);
    expect(bobReadRes.json().messages).toHaveLength(1);

    // Bob unread count is now 0
    const bobThreadsAfterRead = await app.inject({
      method: 'GET',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobThreadsAfterRead.json().threads[0].unreadCount).toBe(0);

    // 8. Bob replies with clientMessageId for deduplication (WF-10, WIT-010)
    const bobReplyRes1 = await app.inject({
      method: 'POST',
      url: `/api/v1/threads/${threadId}/messages`,
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        content: 'Sounds great Alice! Lets build it.',
        clientMessageId: 'bob-reply-uuid-1234',
      },
    });
    expect(bobReplyRes1.statusCode).toBe(201);
    const bobMsgId = bobReplyRes1.json().message.id;

    // 9. Bob retries sending identical clientMessageId -> idempotent 200 with deduplicated: true
    const bobReplyRes2 = await app.inject({
      method: 'POST',
      url: `/api/v1/threads/${threadId}/messages`,
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        content: 'Sounds great Alice! Lets build it.',
        clientMessageId: 'bob-reply-uuid-1234',
      },
    });
    expect(bobReplyRes2.statusCode).toBe(200);
    expect(bobReplyRes2.json().deduplicated).toBe(true);
    expect(bobReplyRes2.json().message.id).toBe(bobMsgId);

    // 10. Verify worker queue dispatched messaging event
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobs = jobsRes.json().jobs;
    const msgJob = jobs.find(
      (j: any) => j.type === 'messaging.message.sent' && j.payload.messageId === bobMsgId
    );
    expect(msgJob).toBeDefined();
    expect(msgJob.payload.recipientIds).toContain(aliceProfileId);
  });
});

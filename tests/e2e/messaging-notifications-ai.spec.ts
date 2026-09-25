import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Direct Messaging, Notification Center & AI Career Copilot (F-12, F-13, F-14, BR-12, BR-13, BR-120)', () => {
  let senderToken: string;
  let senderId: string;
  let senderProfileId: string;

  let recipientToken: string;
  let recipientId: string;
  let recipientProfileId: string;

  let threadId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register sender
    const senderRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `sender.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alice Developer',
        role: 'candidate',
      },
    });
    expect(senderRes.status()).toBe(201);
    const senderData = await senderRes.json();
    senderToken = senderData.token;
    senderId = senderData.user.id;
    senderProfileId = senderData.profile.id;

    // 2. Register recipient
    const recipientRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `recipient.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Bob Recruiter',
        role: 'recruiter',
      },
    });
    expect(recipientRes.status()).toBe(201);
    const recipientData = await recipientRes.json();
    recipientToken = recipientData.token;
    recipientId = recipientData.user.id;
    recipientProfileId = recipientData.profile.id;
  });

  test('creates thread, sends messages with deduplication, and triggers recipient notification (F-12, F-14)', async ({ request }) => {
    // 1. Create thread with initial message
    const threadRes = await request.post(`${API_BASE}/threads`, {
      headers: { authorization: `Bearer ${senderToken}` },
      data: {
        recipientId: recipientProfileId,
        subject: 'Inquiry regarding distributed systems role',
        initialMessage: 'Hello Bob, I saw the open staff engineering position and would love to connect!',
        clientMessageId: `client-msg-${Date.now()}`,
      },
    });
    expect(threadRes.status()).toBe(201);
    const threadData = await threadRes.json();
    expect(threadData.thread.subject).toBe('Inquiry regarding distributed systems role');
    threadId = threadData.thread.id;

    // 2. Send follow-up message with clientMessageId deduplication
    const clientMsgId = `dup-check-${Date.now()}`;
    const msgRes = await request.post(`${API_BASE}/threads/${threadId}/messages`, {
      headers: { authorization: `Bearer ${senderToken}` },
      data: {
        content: 'Here is a link to my verified evidence profile as well.',
        clientMessageId: clientMsgId,
      },
    });
    expect(msgRes.status()).toBe(201);

    // Re-sending with same clientMessageId must return deduplicated: true (WIT-010)
    const dupRes = await request.post(`${API_BASE}/threads/${threadId}/messages`, {
      headers: { authorization: `Bearer ${senderToken}` },
      data: {
        content: 'Here is a link to my verified evidence profile as well.',
        clientMessageId: clientMsgId,
      },
    });
    expect(dupRes.status()).toBe(200);
    const dupData = await dupRes.json();
    expect(dupData.deduplicated).toBe(true);

    // 3. Recruiter checks notification inbox (F-14, BR-120)
    const notifRes = await request.get(`${API_BASE}/notifications`, {
      headers: { authorization: `Bearer ${recipientToken}` },
    });
    expect(notifRes.status()).toBe(200);
    const notifData = await notifRes.json();
    expect(notifData.unreadCount).toBeGreaterThanOrEqual(1);
    expect(notifData.notifications.some((n: any) => n.referenceId === threadId)).toBe(true);

    // 4. Mark notifications as read
    const markReadRes = await request.post(`${API_BASE}/notifications/mark-read`, {
      headers: { authorization: `Bearer ${recipientToken}` },
      data: { all: true },
    });
    expect(markReadRes.status()).toBe(200);
    const markReadData = await markReadRes.json();
    expect(markReadData.unreadCount).toBe(0);

    // 5. Update notification preferences
    const prefRes = await request.patch(`${API_BASE}/notifications/preferences`, {
      headers: { authorization: `Bearer ${recipientToken}` },
      data: {
        allowMessages: true,
        allowMentions: false,
        emailDigestFrequency: 'daily',
      },
    });
    expect(prefRes.status()).toBe(200);
    const prefData = await prefRes.json();
    expect(prefData.preferences.allowMentions).toBe(false);
    expect(prefData.preferences.emailDigestFrequency).toBe('daily');
  });

  test('interacts with AI Career Copilot with quota metering and advisory disclaimer (F-13, BR-12, BR-13)', async ({ request }) => {
    // 1. Send query to Career Assistant
    const aiRes = await request.post(`${API_BASE}/ai/career-assistant/chat`, {
      headers: { authorization: `Bearer ${senderToken}` },
      data: {
        prompt: 'How can I optimize my resume for a staff distributed systems engineer position?',
      },
    });
    expect(aiRes.status()).toBe(200);
    const aiData = await aiRes.json();
    expect(aiData.conversationId).toBeDefined();
    expect(aiData.message).toBeDefined();
    expect(aiData.message.senderRole).toBe('assistant');
    expect(aiData.provenance.disclaimer).toBeDefined();
    expect(aiData.provenance.tokensUsed).toBeGreaterThan(0);

    // 2. Verify AI usage metering
    const usageRes = await request.get(`${API_BASE}/ai/usage`, {
      headers: { authorization: `Bearer ${senderToken}` },
    });
    expect(usageRes.status()).toBe(200);
    const usageData = await usageRes.json();
    expect(usageData.usage.tier).toBe('free');
    expect(usageData.usage.requestsCount).toBeGreaterThanOrEqual(1);
    expect(usageData.usage.tokensConsumed).toBeGreaterThan(0);
  });
});

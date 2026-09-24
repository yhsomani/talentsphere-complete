import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Notification Center Integration (F-14, BR-120)', () => {
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

    // 1. Register Alice (sender)
    const aliceRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'alice.notif@example.com',
        password: 'Password123!',
        fullName: 'Alice NotificationSender',
        role: 'candidate',
      },
    });
    const aliceJson = aliceRes.json();
    aliceToken = aliceJson.token;
    aliceProfileId = aliceJson.profile.id;

    // 2. Register Bob (recipient)
    const bobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'bob.notif@example.com',
        password: 'Password123!',
        fullName: 'Bob NotificationReceiver',
        role: 'candidate',
      },
    });
    const bobJson = bobRes.json();
    bobToken = bobJson.token;
    bobProfileId = bobJson.profile.id;

    // 3. Register Charlie (isolated third party)
    const charlieRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'charlie.notif@example.com',
        password: 'Password123!',
        fullName: 'Charlie Neutral',
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

  it('retrieves default notification preferences with mentions and messages enabled', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications/preferences',
      headers: { authorization: `Bearer ${bobToken}` },
    });

    expect(res.statusCode).toBe(200);
    const { preferences } = res.json();
    expect(preferences.userId).toBe(bobProfileId);
    expect(preferences.allowMessages).toBe(true);
    expect(preferences.allowMentions).toBe(true);
    expect(preferences.allowApplications).toBe(true);
    expect(preferences.allowCourseUpdates).toBe(true);
    expect(preferences.emailDigestFrequency).toBe('daily');
  });

  it('updates notification preferences and enforces gating (BR-120)', async () => {
    // 1. Bob disables messages in notification preferences
    const patchRes = await app.inject({
      method: 'PATCH',
      url: '/api/v1/notifications/preferences',
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        allowMessages: false,
        emailDigestFrequency: 'weekly',
      },
    });
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.json().preferences.allowMessages).toBe(false);
    expect(patchRes.json().preferences.emailDigestFrequency).toBe('weekly');

    // 2. Alice sends a thread message to Bob
    const msgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        recipientId: bobProfileId,
        subject: 'Muted Message Test',
        initialMessage: 'You should not get a notification for this!',
      },
    });
    expect(msgRes.statusCode).toBe(201);

    // 3. Bob checks notifications -> should have 0 notifications because allowMessages was false
    const bobNotifsMuted = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobNotifsMuted.statusCode).toBe(200);
    expect(bobNotifsMuted.json().notifications).toHaveLength(0);
    expect(bobNotifsMuted.json().unreadCount).toBe(0);

    // 4. Bob re-enables messages in notification preferences
    const reEnableRes = await app.inject({
      method: 'PATCH',
      url: '/api/v1/notifications/preferences',
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        allowMessages: true,
      },
    });
    expect(reEnableRes.statusCode).toBe(200);
    expect(reEnableRes.json().preferences.allowMessages).toBe(true);

    // 5. Alice sends another thread message
    const threadId = msgRes.json().thread.id;
    const msgRes2 = await app.inject({
      method: 'POST',
      url: `/api/v1/threads/${threadId}/messages`,
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        content: 'You should receive a notification now!',
      },
    });
    expect(msgRes2.statusCode).toBe(201);

    // 6. Bob checks notifications -> should have 1 notification
    const bobNotifsActive = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobNotifsActive.statusCode).toBe(200);
    expect(bobNotifsActive.json().notifications).toHaveLength(1);
    expect(bobNotifsActive.json().unreadCount).toBe(1);

    const receivedNotif = bobNotifsActive.json().notifications[0];
    expect(receivedNotif.type).toBe('message');
    expect(receivedNotif.isRead).toBe(false);
    expect(receivedNotif.title).toContain('Alice NotificationSender');
    expect(receivedNotif.body).toContain('You should receive a notification now!');
  });

  it('marks specific notifications and all notifications as read', async () => {
    // 1. Send one more message from Alice to Bob to generate a second notification
    const bobNotifsBefore = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    const firstNotifId = bobNotifsBefore.json().notifications[0].id;

    // Send second message to generate second notification
    const threadsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/threads',
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    const threadId = threadsRes.json().threads[0].id;

    await app.inject({
      method: 'POST',
      url: `/api/v1/threads/${threadId}/messages`,
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        content: 'Second notification test message',
      },
    });

    const bobNotifsTwo = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobNotifsTwo.json().notifications).toHaveLength(2);
    expect(bobNotifsTwo.json().unreadCount).toBe(2);

    // 2. Mark specific notification as read
    const markOneRes = await app.inject({
      method: 'POST',
      url: '/api/v1/notifications/mark-read',
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        notificationIds: [firstNotifId],
      },
    });
    expect(markOneRes.statusCode).toBe(200);
    expect(markOneRes.json().markedCount).toBe(1);
    expect(markOneRes.json().unreadCount).toBe(1);

    // Filter unread only
    const unreadOnlyRes = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications?unreadOnly=true',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(unreadOnlyRes.statusCode).toBe(200);
    expect(unreadOnlyRes.json().notifications).toHaveLength(1);

    // 3. Bulk mark all as read
    const markAllRes = await app.inject({
      method: 'POST',
      url: '/api/v1/notifications/mark-read',
      headers: { authorization: `Bearer ${bobToken}` },
      payload: {
        all: true,
      },
    });
    expect(markAllRes.statusCode).toBe(200);
    expect(markAllRes.json().markedCount).toBe(1);
    expect(markAllRes.json().unreadCount).toBe(0);

    // Verify unread count is 0
    const bobNotifsAfterAll = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${bobToken}` },
    });
    expect(bobNotifsAfterAll.json().unreadCount).toBe(0);
    expect(bobNotifsAfterAll.json().notifications.every((n: any) => n.isRead)).toBe(true);
  });

  it('guarantees notification privacy across different users', async () => {
    // Charlie should see 0 notifications
    const charlieNotifs = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(charlieNotifs.statusCode).toBe(200);
    expect(charlieNotifs.json().notifications).toHaveLength(0);
    expect(charlieNotifs.json().unreadCount).toBe(0);

    // Alice should also have 0 notifications (she only sent messages)
    const aliceNotifs = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(aliceNotifs.statusCode).toBe(200);
    expect(aliceNotifs.json().notifications).toHaveLength(0);
  });

  it('dispatches async worker jobs for notification push delivery', async () => {
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    expect(jobsRes.statusCode).toBe(200);
    const jobs = jobsRes.json().jobs;
    const notifJobs = jobs.filter((j: any) => j.type === 'notification.push');
    expect(notifJobs.length).toBeGreaterThan(0);
    expect(notifJobs[0].payload.recipientId).toBe(bobProfileId);
  });
});

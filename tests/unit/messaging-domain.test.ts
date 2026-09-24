import { describe, it, expect } from 'vitest';
import {
  createThreadEntities,
  assertThreadParticipant,
  createMessageEntity,
  calculateUnreadCount,
  ThreadParticipant,
  Message,
} from '../../packages/domain/src/index.js';

describe('Direct Messaging Domain Model (F-10, WF-10)', () => {
  const aliceId = '00000000-0000-0000-0000-000000000001';
  const bobId = '00000000-0000-0000-0000-000000000002';
  const charlieId = '00000000-0000-0000-0000-000000000003';

  it('validates thread creation invariants and prevents self-messaging', () => {
    // Missing creator
    expect(() => createThreadEntities('', [bobId])).toThrowError(/creator profile ID is required/);

    // Empty recipients
    expect(() => createThreadEntities(aliceId, [])).toThrowError(/At least one recipient is required/);

    // Self-messaging prohibited
    expect(() => createThreadEntities(aliceId, [aliceId])).toThrowError(/solely with yourself/);

    // Valid creation
    const { thread, participants } = createThreadEntities(aliceId, [bobId], 'Project Sync');
    expect(thread.id).toBeDefined();
    expect(thread.subject).toBe('Project Sync');
    expect(participants).toHaveLength(2);
    expect(participants.map((p) => p.userId).sort()).toEqual([aliceId, bobId].sort());
  });

  it('enforces participant-only thread authorization', () => {
    const { participants } = createThreadEntities(aliceId, [bobId]);

    // Alice is participant
    expect(() => assertThreadParticipant(participants, aliceId)).not.toThrow();

    // Bob is participant
    expect(() => assertThreadParticipant(participants, bobId)).not.toThrow();

    // Charlie is not participant -> FORBIDDEN
    expect(() => assertThreadParticipant(participants, charlieId)).toThrowError(
      /User is not a participant in this conversation thread/
    );
  });

  it('validates message creation constraints', () => {
    const threadId = 'thread-1';

    // Empty message
    expect(() => createMessageEntity(threadId, aliceId, '   ')).toThrowError(/Message content cannot be empty/);

    // Too long message
    const tooLong = 'x'.repeat(5001);
    expect(() => createMessageEntity(threadId, aliceId, tooLong)).toThrowError(/exceeds maximum allowed length/);

    // Valid message
    const msg = createMessageEntity(threadId, aliceId, 'Hello Bob!', 'client-msg-123');
    expect(msg.content).toBe('Hello Bob!');
    expect(msg.clientMessageId).toBe('client-msg-123');
    expect(msg.status).toBe('sent');
  });

  it('calculates unread messages correctly', () => {
    const threadId = 'thread-1';
    const participantBob: ThreadParticipant = {
      id: 'p-bob',
      threadId,
      userId: bobId,
      lastReadAt: new Date(Date.now() - 50000).toISOString(),
      createdAt: new Date(Date.now() - 100000).toISOString(),
    };

    const oldMsg: Message = {
      id: 'm-1',
      threadId,
      senderId: aliceId,
      content: 'Early message',
      status: 'read',
      createdAt: new Date(Date.now() - 60000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString(),
    };

    const newMsg1: Message = {
      id: 'm-2',
      threadId,
      senderId: aliceId,
      content: 'New message 1',
      status: 'delivered',
      createdAt: new Date(Date.now() - 20000).toISOString(),
      updatedAt: new Date(Date.now() - 20000).toISOString(),
    };

    const newMsg2: Message = {
      id: 'm-3',
      threadId,
      senderId: bobId, // Bob's own message
      content: 'Bob response',
      status: 'sent',
      createdAt: new Date(Date.now() - 10000).toISOString(),
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const messages = [oldMsg, newMsg1, newMsg2];
    const unread = calculateUnreadCount(messages, participantBob);

    // Only newMsg1 is unread from Alice (Bob's own message is excluded)
    expect(unread).toBe(1);
  });
});

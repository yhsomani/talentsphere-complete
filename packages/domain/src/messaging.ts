import { DomainError } from './core.js';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageThread {
  id: string;
  subject?: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  id: string;
  threadId: string;
  userId: string;
  lastReadAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  clientMessageId?: string | null;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates and initializes a new message thread and its participants (WF-10, F-10).
 */
export function createThreadEntities(
  creatorId: string,
  recipientIds: string[],
  subject?: string
): { thread: MessageThread; participants: ThreadParticipant[] } {
  if (!creatorId) {
    throw new DomainError('VALIDATION_FAILED', 'Thread creator profile ID is required.');
  }

  const validRecipients = Array.from(
    new Set(recipientIds.filter((id) => id && id.trim().length > 0))
  );

  if (validRecipients.length === 0) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'At least one recipient is required to start a conversation.'
    );
  }

  // Anti-gaming / self-messaging rule
  if (validRecipients.length === 1 && validRecipients[0] === creatorId) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Cannot start a direct message thread solely with yourself.'
    );
  }

  const threadId = crypto.randomUUID();
  const now = new Date().toISOString();

  const thread: MessageThread = {
    id: threadId,
    subject: subject?.trim() || null,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const allParticipantIds = Array.from(new Set([creatorId, ...validRecipients]));
  const participants: ThreadParticipant[] = allParticipantIds.map((userId) => ({
    id: crypto.randomUUID(),
    threadId,
    userId,
    lastReadAt: userId === creatorId ? now : new Date(0).toISOString(),
    createdAt: now,
  }));

  return { thread, participants };
}

/**
 * Authorizes that the user is an active participant of the thread.
 */
export function assertThreadParticipant(
  participants: ThreadParticipant[],
  userId: string
): ThreadParticipant {
  const participant = participants.find((p) => p.userId === userId);
  if (!participant) {
    throw new DomainError('FORBIDDEN', 'User is not a participant in this conversation thread.');
  }
  return participant;
}

/**
 * Creates a message entity with content validation.
 */
export function createMessageEntity(
  threadId: string,
  senderId: string,
  content: string,
  clientMessageId?: string | null
): Message {
  const trimmed = content ? content.trim() : '';
  if (trimmed.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Message content cannot be empty.');
  }
  if (trimmed.length > 5000) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Message content exceeds maximum allowed length of 5000 characters.'
    );
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    threadId,
    senderId,
    content: trimmed,
    clientMessageId: clientMessageId || null,
    status: 'sent',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Computes unread message count for a participant.
 */
export function calculateUnreadCount(messages: Message[], participant: ThreadParticipant): number {
  const lastReadTime = new Date(participant.lastReadAt).getTime();
  return messages.filter(
    (m) => m.senderId !== participant.userId && new Date(m.createdAt).getTime() > lastReadTime
  ).length;
}

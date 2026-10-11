/**
 * Conversations (GET /api/v1/threads, /threads/:id). Who may start one is
 * the server's rule: connected people, or a hiring team and someone who
 * applied to one of its jobs. Two people share one conversation.
 */
export interface ConversationParticipant {
  id: string;
  threadId: string;
  /** Profile id. */
  userId: string;
  lastReadAt: string;
  fullName: string;
}

export interface ConversationMessage {
  id: string;
  threadId: string;
  /** Profile id of the sender. */
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  subject?: string | null;
  lastMessageAt: string;
  participants: ConversationParticipant[];
  lastMessage: ConversationMessage | null;
  unreadCount: number;
}

/** Everyone in the conversation except me, by name ("Deleted account" when gone). */
export function otherNames(participants: ConversationParticipant[], myProfileId?: string): string {
  const others = participants.filter((p) => p.userId !== myProfileId).map((p) => p.fullName);
  return others.length > 0 ? others.join(', ') : 'Deleted account';
}

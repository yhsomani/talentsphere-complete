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
export declare function createThreadEntities(creatorId: string, recipientIds: string[], subject?: string): {
    thread: MessageThread;
    participants: ThreadParticipant[];
};
/**
 * Authorizes that the user is an active participant of the thread.
 */
export declare function assertThreadParticipant(participants: ThreadParticipant[], userId: string): ThreadParticipant;
/**
 * Creates a message entity with content validation.
 */
export declare function createMessageEntity(threadId: string, senderId: string, content: string, clientMessageId?: string | null): Message;
/**
 * Computes unread message count for a participant.
 */
export declare function calculateUnreadCount(messages: Message[], participant: ThreadParticipant): number;
//# sourceMappingURL=messaging.d.ts.map
/**
 * TalentSphere Professional Networking Domain (F-09)
 * Connection request state machine, anti-self connection invariant,
 * and relationship queries.
 */
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export interface Connection {
    id: string;
    senderId: string;
    recipientId: string;
    status: ConnectionStatus;
    note?: string;
    acceptedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface RequestConnectionInput {
    senderId: string;
    recipientId: string;
    note?: string;
}
/**
 * Validates and initializes a new connection request.
 * Enforces anti-self connection and duplicate connection prevention.
 */
export declare function requestConnection(input: RequestConnectionInput, existingConnections?: Connection[]): Connection;
/**
 * Accepts a pending connection request.
 * Only the designated recipient can accept.
 */
export declare function acceptConnection(connection: Connection, actorId: string): Connection;
/**
 * Rejects a pending connection request.
 * Only the designated recipient can reject.
 */
export declare function rejectConnection(connection: Connection, actorId: string): Connection;
/**
 * Withdraws a pending connection request.
 * Only the sender who initiated the request can withdraw it.
 */
export declare function withdrawConnection(connection: Connection, actorId: string): Connection;
/**
 * Determines whether two users share an accepted connection.
 */
export declare function areConnected(connections: Connection[], userA: string, userB: string): boolean;
/**
 * Retrieves any existing connection between two users regardless of status.
 */
export declare function getConnectionBetween(connections: Connection[], userA: string, userB: string): Connection | undefined;
//# sourceMappingURL=networking.d.ts.map
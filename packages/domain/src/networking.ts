/**
 * TalentSphere Professional Networking Domain (F-09)
 * Connection request state machine, anti-self connection invariant,
 * and relationship queries.
 */

import { DomainError } from './core.js';

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
export function requestConnection(
  input: RequestConnectionInput,
  existingConnections: Connection[] = []
): Connection {
  if (input.senderId === input.recipientId) {
    throw new DomainError('VALIDATION_FAILED', 'Cannot send a connection request to yourself.');
  }

  if (input.note && input.note.length > 500) {
    throw new DomainError('VALIDATION_FAILED', 'Connection note cannot exceed 500 characters.');
  }

  const existing = existingConnections.find(
    (c) =>
      (c.senderId === input.senderId && c.recipientId === input.recipientId) ||
      (c.senderId === input.recipientId && c.recipientId === input.senderId)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      throw new DomainError('CONFLICT', 'Users are already connected.');
    }
    if (existing.status === 'pending') {
      throw new DomainError(
        'CONFLICT',
        'A connection request is already pending between these users.'
      );
    }
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    senderId: input.senderId,
    recipientId: input.recipientId,
    status: 'pending',
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Accepts a pending connection request.
 * Only the designated recipient can accept.
 */
export function acceptConnection(connection: Connection, actorId: string): Connection {
  if (connection.recipientId !== actorId) {
    throw new DomainError('FORBIDDEN', 'Only the recipient can accept a connection request.');
  }

  if (connection.status !== 'pending') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot accept connection with status '${connection.status}'. Only pending requests can be accepted.`
    );
  }

  const now = new Date().toISOString();
  return {
    ...connection,
    status: 'accepted',
    acceptedAt: now,
    updatedAt: now,
  };
}

/**
 * Rejects a pending connection request.
 * Only the designated recipient can reject.
 */
export function rejectConnection(connection: Connection, actorId: string): Connection {
  if (connection.recipientId !== actorId) {
    throw new DomainError('FORBIDDEN', 'Only the recipient can reject a connection request.');
  }

  if (connection.status !== 'pending') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot reject connection with status '${connection.status}'. Only pending requests can be rejected.`
    );
  }

  const now = new Date().toISOString();
  return {
    ...connection,
    status: 'rejected',
    updatedAt: now,
  };
}

/**
 * Withdraws a pending connection request.
 * Only the sender who initiated the request can withdraw it.
 */
export function withdrawConnection(connection: Connection, actorId: string): Connection {
  if (connection.senderId !== actorId) {
    throw new DomainError('FORBIDDEN', 'Only the sender can withdraw a connection request.');
  }

  if (connection.status !== 'pending') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot withdraw connection with status '${connection.status}'. Only pending requests can be withdrawn.`
    );
  }

  const now = new Date().toISOString();
  return {
    ...connection,
    status: 'withdrawn',
    updatedAt: now,
  };
}

/**
 * Determines whether two users share an accepted connection.
 */
export function areConnected(connections: Connection[], userA: string, userB: string): boolean {
  return connections.some(
    (c) =>
      c.status === 'accepted' &&
      ((c.senderId === userA && c.recipientId === userB) ||
        (c.senderId === userB && c.recipientId === userA))
  );
}

/**
 * Retrieves any existing connection between two users regardless of status.
 */
export function getConnectionBetween(
  connections: Connection[],
  userA: string,
  userB: string
): Connection | undefined {
  return connections.find(
    (c) =>
      (c.senderId === userA && c.recipientId === userB) ||
      (c.senderId === userB && c.recipientId === userA)
  );
}

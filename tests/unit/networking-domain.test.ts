import { describe, it, expect } from 'vitest';
import {
  requestConnection,
  acceptConnection,
  rejectConnection,
  withdrawConnection,
  areConnected,
  getConnectionBetween,
  DomainError,
  type Connection,
} from '../../packages/domain/src/index.js';

describe('Professional Networking Domain (F-09)', () => {
  const userA = '11111111-1111-1111-1111-111111111111';
  const userB = '22222222-2222-2222-2222-222222222222';
  const userC = '33333333-3333-3333-3333-333333333333';

  describe('requestConnection', () => {
    it('prevents self-connection requests (Anti-Self Invariant)', () => {
      expect(() => {
        requestConnection({
          senderId: userA,
          recipientId: userA,
          note: 'Connecting with myself',
        });
      }).toThrowError(/Cannot send a connection request to yourself/);

      try {
        requestConnection({ senderId: userA, recipientId: userA });
      } catch (err) {
        expect(err).toBeInstanceOf(DomainError);
        expect((err as DomainError).code).toBe('VALIDATION_FAILED');
      }
    });

    it('rejects connection notes exceeding 500 characters', () => {
      const longNote = 'a'.repeat(501);
      expect(() => {
        requestConnection({
          senderId: userA,
          recipientId: userB,
          note: longNote,
        });
      }).toThrowError(/Connection note cannot exceed 500 characters/);
    });

    it('successfully initiates a connection request', () => {
      const conn = requestConnection({
        senderId: userA,
        recipientId: userB,
        note: '  Hi, let us collaborate on open source!  ',
      });

      expect(conn.id).toBeDefined();
      expect(conn.senderId).toBe(userA);
      expect(conn.recipientId).toBe(userB);
      expect(conn.status).toBe('pending');
      expect(conn.note).toBe('Hi, let us collaborate on open source!');
      expect(conn.createdAt).toBeDefined();
      expect(conn.updatedAt).toBeDefined();
    });

    it('prevents duplicate pending requests in either direction', () => {
      const existing: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Same direction
      expect(() => {
        requestConnection({ senderId: userA, recipientId: userB }, [existing]);
      }).toThrowError(/already pending/);

      // Reverse direction
      expect(() => {
        requestConnection({ senderId: userB, recipientId: userA }, [existing]);
      }).toThrowError(/already pending/);
    });

    it('prevents requests when already connected', () => {
      const existing: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => {
        requestConnection({ senderId: userA, recipientId: userB }, [existing]);
      }).toThrowError(/already connected/);

      expect(() => {
        requestConnection({ senderId: userB, recipientId: userA }, [existing]);
      }).toThrowError(/already connected/);
    });
  });

  describe('acceptConnection', () => {
    it('allows only the recipient to accept the connection', () => {
      const conn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Sender cannot accept own request
      expect(() => acceptConnection(conn, userA)).toThrowError(/Only the recipient can accept/);

      // Third party cannot accept
      expect(() => acceptConnection(conn, userC)).toThrowError(/Only the recipient can accept/);

      // Recipient can accept
      const accepted = acceptConnection(conn, userB);
      expect(accepted.status).toBe('accepted');
      expect(accepted.acceptedAt).toBeDefined();
    });

    it('prevents accepting non-pending connections', () => {
      const acceptedConn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => acceptConnection(acceptedConn, userB)).toThrowError(
        /Only pending requests can be accepted/
      );
    });
  });

  describe('rejectConnection', () => {
    it('allows only the recipient to reject the connection', () => {
      const conn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => rejectConnection(conn, userA)).toThrowError(/Only the recipient can reject/);
      expect(() => rejectConnection(conn, userC)).toThrowError(/Only the recipient can reject/);

      const rejected = rejectConnection(conn, userB);
      expect(rejected.status).toBe('rejected');
    });

    it('prevents rejecting non-pending connections', () => {
      const rejectedConn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'rejected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => rejectConnection(rejectedConn, userB)).toThrowError(
        /Only pending requests can be rejected/
      );
    });
  });

  describe('withdrawConnection', () => {
    it('allows only the sender to withdraw the connection', () => {
      const conn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => withdrawConnection(conn, userB)).toThrowError(/Only the sender can withdraw/);
      expect(() => withdrawConnection(conn, userC)).toThrowError(/Only the sender can withdraw/);

      const withdrawn = withdrawConnection(conn, userA);
      expect(withdrawn.status).toBe('withdrawn');
    });

    it('prevents withdrawing non-pending connections', () => {
      const withdrawnConn: Connection = {
        id: 'conn-1',
        senderId: userA,
        recipientId: userB,
        status: 'withdrawn',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => withdrawConnection(withdrawnConn, userA)).toThrowError(
        /Only pending requests can be withdrawn/
      );
    });
  });

  describe('areConnected & getConnectionBetween', () => {
    it('correctly evaluates connection status in both directions', () => {
      const connections: Connection[] = [
        {
          id: 'conn-1',
          senderId: userA,
          recipientId: userB,
          status: 'accepted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'conn-2',
          senderId: userA,
          recipientId: userC,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(areConnected(connections, userA, userB)).toBe(true);
      expect(areConnected(connections, userB, userA)).toBe(true);
      expect(areConnected(connections, userA, userC)).toBe(false);
      expect(areConnected(connections, userB, userC)).toBe(false);

      expect(getConnectionBetween(connections, userA, userB)?.id).toBe('conn-1');
      expect(getConnectionBetween(connections, userB, userA)?.id).toBe('conn-1');
      expect(getConnectionBetween(connections, userA, userC)?.id).toBe('conn-2');
      expect(getConnectionBetween(connections, userB, userC)).toBeUndefined();
    });
  });
});

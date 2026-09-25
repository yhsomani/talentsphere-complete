import { describe, it, expect } from 'vitest';
import {
  discoverWarmIntroPaths,
  createWarmIntroRequest,
  respondToIntroRequest,
  WarmIntroPreferences,
  WarmIntroRequest,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Domain: Warm Introduction Paths (F-121, S-11, BR-209..BR-216)', () => {
  const requesterId = '11111111-1111-1111-1111-111111111111';
  const introducerId = '22222222-2222-2222-2222-222222222222';
  const targetId = '33333333-3333-3333-3333-333333333333';
  const blockedUserId = '44444444-4444-4444-4444-444444444444';

  describe('discoverWarmIntroPaths (BR-210, BR-215, BR-216)', () => {
    it('returns empty array if requester and target are the same user', () => {
      const graph = new Map<string, Set<string>>();
      const prefs = new Map<string, WarmIntroPreferences>();
      const paths = discoverWarmIntroPaths(requesterId, requesterId, graph, prefs);
      expect(paths).toEqual([]);
    });

    it('returns empty array if target blocks all incoming intros (BR-213)', () => {
      const graph = new Map<string, Set<string>>([
        [requesterId, new Set([introducerId])],
        [targetId, new Set([introducerId])],
      ]);
      const prefs = new Map<string, WarmIntroPreferences>([
        [
          targetId,
          {
            userId: targetId,
            optOutIntroducer: false,
            blockAllIncomingIntros: true,
            blockedUserIds: [],
            updatedAt: '',
          },
        ],
      ]);

      const paths = discoverWarmIntroPaths(requesterId, targetId, graph, prefs);
      expect(paths).toEqual([]);
    });

    it('returns empty array if target blocked requester (BR-216)', () => {
      const graph = new Map<string, Set<string>>([
        [requesterId, new Set([introducerId])],
        [targetId, new Set([introducerId])],
      ]);
      const prefs = new Map<string, WarmIntroPreferences>([
        [
          targetId,
          {
            userId: targetId,
            optOutIntroducer: false,
            blockAllIncomingIntros: false,
            blockedUserIds: [requesterId],
            updatedAt: '',
          },
        ],
      ]);

      const paths = discoverWarmIntroPaths(requesterId, targetId, graph, prefs);
      expect(paths).toEqual([]);
    });

    it('discovers valid 2-hop paths through mutual connections', () => {
      const graph = new Map<string, Set<string>>([
        [requesterId, new Set([introducerId])],
        [introducerId, new Set([requesterId, targetId])],
        [targetId, new Set([introducerId])],
      ]);
      const prefs = new Map<string, WarmIntroPreferences>();

      const paths = discoverWarmIntroPaths(requesterId, targetId, graph, prefs);
      expect(paths).toHaveLength(1);
      expect(paths[0].introducerUserId).toBe(introducerId);
      expect(paths[0].targetUserId).toBe(targetId);
      expect(paths[0].hops).toBe(2);
      expect(paths[0].pathScore).toBeGreaterThan(0);
    });

    it('filters out introducers who have opted out (BR-212)', () => {
      const graph = new Map<string, Set<string>>([
        [requesterId, new Set([introducerId])],
        [targetId, new Set([introducerId])],
      ]);
      const prefs = new Map<string, WarmIntroPreferences>([
        [
          introducerId,
          {
            userId: introducerId,
            optOutIntroducer: true,
            blockAllIncomingIntros: false,
            blockedUserIds: [],
            updatedAt: '',
          },
        ],
      ]);

      const paths = discoverWarmIntroPaths(requesterId, targetId, graph, prefs);
      expect(paths).toEqual([]);
    });
  });

  describe('createWarmIntroRequest (BR-209, BR-211..BR-216)', () => {
    it('creates a pending intro request with valid parameters', () => {
      const req = createWarmIntroRequest(
        {
          requesterUserId: requesterId,
          targetUserId: targetId,
          introducerUserId: introducerId,
          purpose: 'Exploring engineering opportunities',
          note: 'Hi, would love to connect to discuss your team.',
        },
        3
      );

      expect(req.id).toBeDefined();
      expect(req.status).toBe('pending_introducer');
      expect(req.requesterUserId).toBe(requesterId);
      expect(req.targetUserId).toBe(targetId);
      expect(req.introducerUserId).toBe(introducerId);
      expect(req.threadId).toBeUndefined();
    });

    it('rejects self-request and invalid user configurations', () => {
      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: requesterId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: 'Hello',
          },
          0
        )
      ).toThrowError(DomainError);

      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: requesterId,
            purpose: 'Test',
            note: 'Hello',
          },
          0
        )
      ).toThrowError(DomainError);
    });

    it('enforces weekly rate limit of 10 requests/week (BR-211)', () => {
      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: 'Hello',
          },
          10
        )
      ).toThrowError(/Weekly warm introduction request limit reached/);
    });

    it('rejects request if introducer opted out (BR-212)', () => {
      const introducerPrefs: WarmIntroPreferences = {
        userId: introducerId,
        optOutIntroducer: true,
        blockAllIncomingIntros: false,
        blockedUserIds: [],
        updatedAt: '',
      };

      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: 'Hello',
          },
          0,
          introducerPrefs
        )
      ).toThrowError(/Introducer has opted out/);
    });

    it('rejects request if target blocks all incoming intros (BR-213)', () => {
      const targetPrefs: WarmIntroPreferences = {
        userId: targetId,
        optOutIntroducer: false,
        blockAllIncomingIntros: true,
        blockedUserIds: [],
        updatedAt: '',
      };

      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: 'Hello',
          },
          0,
          undefined,
          targetPrefs
        )
      ).toThrowError(/Target user does not accept incoming introductions/);
    });

    it('rejects request if introducer or target blocked requester (BR-216)', () => {
      const introducerPrefs: WarmIntroPreferences = {
        userId: introducerId,
        optOutIntroducer: false,
        blockAllIncomingIntros: false,
        blockedUserIds: [requesterId],
        updatedAt: '',
      };

      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: 'Hello',
          },
          0,
          introducerPrefs
        )
      ).toThrowError(/Cannot send introduction request to this user/);
    });

    it('enforces note character length limit of 500 characters', () => {
      const longNote = 'a'.repeat(501);
      expect(() =>
        createWarmIntroRequest(
          {
            requesterUserId: requesterId,
            targetUserId: targetId,
            introducerUserId: introducerId,
            purpose: 'Test',
            note: longNote,
          },
          0
        )
      ).toThrowError(/must not exceed 500 characters/);
    });
  });

  describe('respondToIntroRequest (BR-209, BR-214)', () => {
    const pendingRequest: WarmIntroRequest = {
      id: '99999999-9999-9999-9999-999999999999',
      requesterUserId: requesterId,
      targetUserId: targetId,
      introducerUserId: introducerId,
      purpose: 'Connect for mentoring',
      note: 'Looking for advice',
      status: 'pending_introducer',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    it('requires introducer consent to respond (BR-209)', () => {
      expect(() => respondToIntroRequest(pendingRequest, requesterId, 'approve')).toThrowError(
        /Only the designated introducer can approve/
      );
    });

    it('delivers three-way thread upon approval (BR-214)', () => {
      const approved = respondToIntroRequest(pendingRequest, introducerId, 'approve');

      expect(approved.status).toBe('approved');
      expect(approved.threadId).toBeDefined();
      expect(approved.deliveredAt).toBeDefined();
    });

    it('updates status and captures reason upon decline', () => {
      const declined = respondToIntroRequest(
        pendingRequest,
        introducerId,
        'decline',
        'Not in touch recently'
      );

      expect(declined.status).toBe('declined');
      expect(declined.declineReason).toBe('Not in touch recently');
      expect(declined.threadId).toBeUndefined();
    });

    it('rejects responding to already resolved requests', () => {
      const approved = respondToIntroRequest(pendingRequest, introducerId, 'approve');
      expect(() => respondToIntroRequest(approved, introducerId, 'decline')).toThrowError(
        /Cannot respond to introduction request in 'approved' status/
      );
    });
  });
});

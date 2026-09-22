/**
 * Network Service - Manages user social interactions
 * 
 * Features:
 * - Block/Unblock users (NET-005)
 * - Connection requests
 * - User relationships
 * 
 * Dependency Injection Pattern: Requires DatabaseAdapter instance
 * Usage: const service = new NetworkService(databaseAdapter);
 */

import { createDatabaseAdapter, type DatabaseAdapter } from '../lib/database/adapter';
import { AppErrors, isAppError } from '../lib/errors/index';
import { CandidateService } from './candidate.service';

export interface BlockedUserRecord {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
  blocked_user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export interface BlockUserInput {
  blockedUserId: string;
  reason?: string;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface ConnectionUserSummary {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  headline?: string | null;
  organization?: string | null;
  location?: string | null;
}

export interface ConnectionRecord {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  requester?: ConnectionUserSummary;
  recipient?: ConnectionUserSummary;
  connected_user?: ConnectionUserSummary;
}

export interface SendConnectionInput {
  recipientId: string;
  note?: string;
}

export interface ConnectionSuggestionPreferences {
  alumniOnly?: boolean;
  colleaguesOnly?: boolean;
  sharedSkillsOnly?: boolean;
}

export interface ConnectionSuggestion {
  user: ConnectionUserSummary;
  score: number;
  reasonTags: string[];
  sharedCompany?: string;
  sharedInstitution?: string;
  sharedSkills: string[];
  mutualCount?: number;
}

export interface NetworkStats {
  totalConnections: number;
  pendingReceived: number;
  pendingSent: number;
}

export class NetworkService {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Block a user - prevents them from interacting with you
   * Implements NET-005: User Blocking Mechanism
   */
  async blockUser(
    inputOrBlockerId: BlockUserInput | string,
    optionalBlockedId?: string,
    optionalReason?: string
  ): Promise<BlockedUserRecord> {
    try {
      let blockerId: string;
      let blockedId: string;
      let reason: string | null = null;

      if (typeof inputOrBlockerId === 'string') {
        if (optionalBlockedId) {
          blockerId = inputOrBlockerId;
          blockedId = optionalBlockedId;
          reason = optionalReason || null;
        } else {
          const authResult = await this.db.auth.getUser();
          if (!authResult.data?.user) {
            throw AppErrors.unauthorized('Must be authenticated to block users');
          }
          blockerId = authResult.data.user.id;
          blockedId = inputOrBlockerId;
          reason = optionalReason || null;
        }
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to block users');
        }
        blockerId = authResult.data.user.id;
        blockedId = inputOrBlockerId.blockedUserId;
        reason = inputOrBlockerId.reason || null;
      }

      // Prevent self-blocking
      if (blockerId === blockedId) {
        throw AppErrors.validation('Cannot block yourself');
      }

      // Check if already blocked (idempotent)
      const existingBlock = await this.db
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId)
        .maybeSingle();

      if (existingBlock.data) {
        return existingBlock.data as unknown as BlockedUserRecord;
      }

      // Create block record
      const insertPayload = {
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.db
        .from('blocked_users')
        .insert(insertPayload);

      if (error) {
        throw AppErrors.database('Failed to block user', {
          cause: error,
          context: { blockerId, blockedId },
        });
      }

      // Fetch user profile info for blocked_user if available
      let blockedUser: BlockedUserRecord['blocked_user'];
      try {
        const { data: userData } = await this.db
          .from('users')
          .select('id, full_name, email, avatar_url')
          .eq('id', blockedId)
          .maybeSingle();
        if (userData) {
          blockedUser = userData as unknown as BlockedUserRecord['blocked_user'];
        }
      } catch {
        // Non-blocking user lookup
      }

      const record = Array.isArray(data) ? data[0] : (data || insertPayload);

      return {
        id: ((record as Record<string, unknown>).id as string) || crypto.randomUUID(),
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason,
        created_at: ((record as Record<string, unknown>).created_at as string) || new Date().toISOString(),
        blocked_user: blockedUser,
      };
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database('Unexpected error blocking user', {
        cause: error,
      });
    }
  }

  /**
   * Unblock a previously blocked user
   */
  async unblockUser(inputOrBlockerId: string, optionalBlockedId?: string): Promise<boolean> {
    try {
      let blockerId: string;
      let blockedUserId: string;

      if (optionalBlockedId) {
        blockerId = inputOrBlockerId;
        blockedUserId = optionalBlockedId;
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to unblock users');
        }
        blockerId = authResult.data.user.id;
        blockedUserId = inputOrBlockerId;
      }

      const { error } = await this.db
        .from('blocked_users')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedUserId);

      if (error) {
        throw AppErrors.database('Failed to unblock user', {
          cause: error,
          context: { blockerId, blockedUserId },
        });
      }

      return true;
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database('Unexpected error unblocking user', {
        cause: error,
      });
    }
  }

  /**
   * Get list of users blocked by current user
   */
  async getBlockedUsers(optionalUserId?: string): Promise<BlockedUserRecord[]> {
    try {
      let userId = optionalUserId;
      if (!userId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to view blocked users');
        }
        userId = authResult.data.user.id;
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw AppErrors.database('Failed to fetch blocked users', {
          cause: error,
        });
      }

      const records = (data as unknown) as Array<{
        id: string;
        blocker_id: string;
        blocked_id: string;
        reason?: string | null;
        created_at: string;
      }>;

      if (!records || records.length === 0) {
        return [];
      }

      // Fetch user profile info for blocked users
      const blockedUserIds = records.map(r => r.blocked_id);
      const userMap = new Map<string, { id: string; full_name: string; email: string; avatar_url: string | null }>();

      try {
        const { data: usersData } = await this.db
          .from('users')
          .select('id, full_name, email, avatar_url')
          .in('id', blockedUserIds);

        if (usersData) {
          const rawUsers = usersData as unknown as Array<{ id: string; full_name: string; email: string; avatar_url: string | null }>;
          for (const u of rawUsers) {
            userMap.set(u.id, u);
          }
        }
      } catch {
        // Fallback gracefully if users table query fails
      }

      return records.map(r => ({
        id: r.id,
        blocker_id: r.blocker_id,
        blocked_id: r.blocked_id,
        reason: r.reason || null,
        created_at: r.created_at,
        blocked_user: userMap.get(r.blocked_id),
      }));
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database('Unexpected error fetching blocked users', {
        cause: error,
      });
    }
  }

  /**
   * Check if a specific user is blocked by blocker user
   */
  async isUserBlocked(userIdOrBlockerId: string, optionalTargetId?: string): Promise<boolean> {
    try {
      let blockerId: string;
      let targetId: string;

      if (optionalTargetId) {
        blockerId = userIdOrBlockerId;
        targetId = optionalTargetId;
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          return false;
        }
        blockerId = authResult.data.user.id;
        targetId = userIdOrBlockerId;
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', targetId)
        .maybeSingle();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Check if user is blocked by another user
   */
  async isBlockedBy(userIdOrTargetId: string, optionalBlockerId?: string): Promise<boolean> {
    try {
      let targetId: string;
      let blockerId: string;

      if (optionalBlockerId) {
        targetId = userIdOrTargetId;
        blockerId = optionalBlockerId;
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          return false;
        }
        targetId = authResult.data.user.id;
        blockerId = userIdOrTargetId;
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', targetId)
        .maybeSingle();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if blocked by user:', error);
      return false;
    }
  }

  /**
   * Check mutual block status between two users or current user and another user
   */
  async getBlockStatus(userIdOrUser1: string, optionalUser2?: string): Promise<{
    isBlocked: boolean;
    isBlockedBy: boolean;
    canMessage: boolean;
    iBlockedThem: boolean;
    theyBlockedMe: boolean;
  }> {
    let user1: string;
    let user2: string;

    if (optionalUser2) {
      user1 = userIdOrUser1;
      user2 = optionalUser2;
    } else {
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        return { isBlocked: false, isBlockedBy: false, canMessage: true, iBlockedThem: false, theyBlockedMe: false };
      }
      user1 = authResult.data.user.id;
      user2 = userIdOrUser1;
    }

    const [isBlocked, isBlockedBy] = await Promise.all([
      this.isUserBlocked(user1, user2),
      this.isBlockedBy(user1, user2),
    ]);

    return {
      isBlocked,
      isBlockedBy,
      canMessage: !isBlocked && !isBlockedBy,
      iBlockedThem: isBlocked,
      theyBlockedMe: isBlockedBy,
    };
  }

  // ============================================================================
  // SOCIAL NETWORKING & CONNECTION LIFECYCLE (NET-001, NET-002)
  // ============================================================================

  /**
   * Send a connection request to another user
   * Implements NET-002: Connection Lifecycle & Idempotency
   */
  async sendConnectionRequest(
    inputOrRequesterId: SendConnectionInput | string,
    optionalRecipientId?: string,
    optionalNote?: string
  ): Promise<ConnectionRecord> {
    try {
      let requesterId: string;
      let recipientId: string;
      let note: string | null = null;

      if (typeof inputOrRequesterId === 'string') {
        if (optionalRecipientId) {
          requesterId = inputOrRequesterId;
          recipientId = optionalRecipientId;
          note = optionalNote || null;
        } else {
          const authResult = await this.db.auth.getUser();
          if (!authResult.data?.user) {
            throw AppErrors.unauthorized('Must be authenticated to send connection requests');
          }
          requesterId = authResult.data.user.id;
          recipientId = inputOrRequesterId;
          note = optionalNote || null;
        }
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to send connection requests');
        }
        requesterId = authResult.data.user.id;
        recipientId = inputOrRequesterId.recipientId;
        note = inputOrRequesterId.note || null;
      }

      // Prevent self-connections
      if (requesterId === recipientId) {
        throw AppErrors.validation('Cannot connect with yourself');
      }

      // Verify mutual block status
      const isBlocked = await this.isUserBlocked(requesterId, recipientId);
      const isBlockedBy = await this.isBlockedBy(requesterId, recipientId);
      if (isBlocked || isBlockedBy) {
        throw AppErrors.validation('Cannot connect with this user');
      }

      // Check existing connection in both directions
      const { data: existingOut } = await this.db
        .from('connections')
        .select('*')
        .eq('requester_id', requesterId)
        .eq('recipient_id', recipientId)
        .maybeSingle();

      const { data: existingIn } = await this.db
        .from('connections')
        .select('*')
        .eq('requester_id', recipientId)
        .eq('recipient_id', requesterId)
        .maybeSingle();

      const existing = (existingOut || existingIn) as unknown as Record<string, unknown> | null;

      if (existing) {
        const currentStatus = existing.status as ConnectionStatus;

        // If already connected, return idempotently
        if (currentStatus === 'accepted') {
          return this.enrichConnectionRecord(existing, requesterId);
        }

        // If other party had sent a pending request, auto-accept immediately (mutual connection)
        if (existing.requester_id === recipientId && currentStatus === 'pending') {
          return this.respondToConnectionRequest(existing.id as string, 'accept', requesterId);
        }

        // If current user already has pending request sent, return idempotently
        if (currentStatus === 'pending') {
          return this.enrichConnectionRecord(existing, requesterId);
        }

        // If previously declined or cancelled, reactivate connection request
        const updatePayload = {
          requester_id: requesterId,
          recipient_id: recipientId,
          status: 'pending' as ConnectionStatus,
          note,
          updated_at: new Date().toISOString(),
        };

        const { data: updated, error: updateError } = await this.db
          .from('connections')
          .update(updatePayload)
          .eq('id', existing.id as string);

        if (updateError) {
          throw AppErrors.database('Failed to update connection request', { cause: updateError });
        }

        const rec = (Array.isArray(updated) ? updated[0] : (updated || { ...existing, ...updatePayload })) as Record<string, unknown>;
        await this.notifyConnectionRequest(recipientId, requesterId, note);
        return this.enrichConnectionRecord(rec, requesterId);
      }

      // Insert new connection record
      const insertPayload = {
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending' as ConnectionStatus,
        note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.db
        .from('connections')
        .insert(insertPayload);

      if (error) {
        throw AppErrors.database('Failed to send connection request', { cause: error });
      }

      const rec = (Array.isArray(data) ? data[0] : (data || insertPayload)) as Record<string, unknown>;
      const connId = (rec.id as string) || crypto.randomUUID();
      const finalRec = { ...rec, id: connId };

      await this.notifyConnectionRequest(recipientId, requesterId, note);
      return this.enrichConnectionRecord(finalRec, requesterId);
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error sending connection request', { cause: error });
    }
  }

  /**
   * Respond to a pending connection request (accept or decline)
   * Automatically triggers 'Master Networker' badge evaluation on acceptance!
   */
  async respondToConnectionRequest(
    connectionId: string,
    action: 'accept' | 'decline',
    optionalUserId?: string
  ): Promise<ConnectionRecord> {
    try {
      let userId = optionalUserId;
      if (!userId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to respond to connection requests');
        }
        userId = authResult.data.user.id;
      }

      const { data: existing, error: fetchError } = await this.db
        .from('connections')
        .select('*')
        .eq('id', connectionId)
        .maybeSingle();

      if (fetchError || !existing) {
        throw AppErrors.notFound('Connection request not found');
      }

      const conn = existing as unknown as Record<string, unknown>;
      const newStatus: ConnectionStatus = action === 'accept' ? 'accepted' : 'declined';

      const updatePayload = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await this.db
        .from('connections')
        .update(updatePayload)
        .eq('id', connectionId);

      if (updateError) {
        throw AppErrors.database('Failed to respond to connection request', { cause: updateError });
      }

      const updatedRec = (Array.isArray(updated) ? updated[0] : (updated || { ...conn, ...updatePayload })) as Record<string, unknown>;

      if (action === 'accept') {
        // Send notification to the original requester
        const requesterId = conn.requester_id as string;
        try {
          await this.db.from('notifications').insert({
            user_id: requesterId,
            type: 'invitation',
            title: 'Connection Accepted',
            message: 'Your connection request was accepted.',
            link_url: '/network',
            link_label: 'View Network',
            created_at: new Date().toISOString(),
          });
        } catch {
          // non-blocking
        }

        // Award Master Networker badge if milestone reached
        await this.checkAndAwardNetworkerBadge(requesterId);
        await this.checkAndAwardNetworkerBadge(conn.recipient_id as string);
      }

      return this.enrichConnectionRecord(updatedRec, userId);
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error responding to connection request', { cause: error });
    }
  }

  /**
   * Cancel an outgoing pending connection request
   */
  async cancelConnectionRequest(connectionId: string, optionalRequesterId?: string): Promise<boolean> {
    try {
      let requesterId = optionalRequesterId;
      if (!requesterId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to cancel request');
        }
        requesterId = authResult.data.user.id;
      }

      const { error } = await this.db
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        throw AppErrors.database('Failed to cancel connection request', { cause: error });
      }

      return true;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error cancelling connection request', { cause: error });
    }
  }

  /**
   * Remove an accepted connection
   */
  async removeConnection(connectionIdOrOtherUserId: string, optionalCurrentUserId?: string): Promise<boolean> {
    try {
      let currentUserId = optionalCurrentUserId;
      if (!currentUserId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to remove connection');
        }
        currentUserId = authResult.data.user.id;
      }

      // Check if parameter is a direct connection ID
      const { data: byId } = await this.db
        .from('connections')
        .select('id')
        .eq('id', connectionIdOrOtherUserId)
        .maybeSingle();

      if (byId) {
        const { error } = await this.db
          .from('connections')
          .delete()
          .eq('id', connectionIdOrOtherUserId);
        return !error;
      }

      // Otherwise parameter is the other user's ID
      const otherUserId = connectionIdOrOtherUserId;
      const { error: err1 } = await this.db
        .from('connections')
        .delete()
        .eq('requester_id', currentUserId)
        .eq('recipient_id', otherUserId);

      const { error: err2 } = await this.db
        .from('connections')
        .delete()
        .eq('requester_id', otherUserId)
        .eq('recipient_id', currentUserId);

      return !err1 && !err2;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error removing connection', { cause: error });
    }
  }

  /**
   * Get connections for a user filtered by status ('accepted', 'pending', 'all')
   */
  async getConnections(
    optionalUserId?: string,
    status: ConnectionStatus | 'all' = 'accepted'
  ): Promise<ConnectionRecord[]> {
    try {
      let userId = optionalUserId;
      if (!userId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to fetch connections');
        }
        userId = authResult.data.user.id;
      }

      // Fetch outgoing and incoming connections
      const { data: outConns } = await this.db
        .from('connections')
        .select('*')
        .eq('requester_id', userId);

      const { data: inConns } = await this.db
        .from('connections')
        .select('*')
        .eq('recipient_id', userId);

      const all = [
        ...(((outConns as unknown as Array<Record<string, unknown>>) || [])),
        ...(((inConns as unknown as Array<Record<string, unknown>>) || [])),
      ];

      // Deduplicate by connection ID and filter by status
      const seen = new Set<string>();
      const filtered: Array<Record<string, unknown>> = [];
      for (const c of all) {
        const id = c.id as string;
        if (!seen.has(id)) {
          seen.add(id);
          if (status === 'all' || c.status === status) {
            filtered.push(c);
          }
        }
      }

      // Sort newest first
      filtered.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());

      return this.enrichConnectionRecords(filtered, userId);
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error fetching connections', { cause: error });
    }
  }

  /**
   * Check connection relationship between two users
   */
  async getConnectionStatus(
    user1OrCurrent: string,
    optionalUser2?: string
  ): Promise<{
    status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined' | 'blocked';
    connectionId?: string;
  }> {
    try {
      let user1: string;
      let user2: string;

      if (optionalUser2) {
        user1 = user1OrCurrent;
        user2 = optionalUser2;
      } else {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          return { status: 'none' };
        }
        user1 = authResult.data.user.id;
        user2 = user1OrCurrent;
      }

      // Check block status first
      const isBlocked = await this.isUserBlocked(user1, user2);
      const isBlockedBy = await this.isBlockedBy(user1, user2);
      if (isBlocked || isBlockedBy) {
        return { status: 'blocked' };
      }

      // Check outgoing connection
      const { data: outConn } = await this.db
        .from('connections')
        .select('id, status')
        .eq('requester_id', user1)
        .eq('recipient_id', user2)
        .maybeSingle();

      if (outConn) {
        const c = outConn as unknown as { id: string; status: ConnectionStatus };
        if (c.status === 'accepted') return { status: 'accepted', connectionId: c.id };
        if (c.status === 'pending') return { status: 'pending_sent', connectionId: c.id };
        if (c.status === 'declined') return { status: 'declined', connectionId: c.id };
      }

      // Check incoming connection
      const { data: inConn } = await this.db
        .from('connections')
        .select('id, status')
        .eq('requester_id', user2)
        .eq('recipient_id', user1)
        .maybeSingle();

      if (inConn) {
        const c = inConn as unknown as { id: string; status: ConnectionStatus };
        if (c.status === 'accepted') return { status: 'accepted', connectionId: c.id };
        if (c.status === 'pending') return { status: 'pending_received', connectionId: c.id };
        if (c.status === 'declined') return { status: 'declined', connectionId: c.id };
      }

      return { status: 'none' };
    } catch {
      return { status: 'none' };
    }
  }

  /**
   * Suggest peer connections based on preferences, alumni, colleagues, and shared skills
   * Implements NET-001: Connection Suggestions with Preferences (Colleagues / Alumni)
   */
  async getSuggestedConnections(
    optionalUserId?: string,
    limit = 10,
    preferences: ConnectionSuggestionPreferences = {}
  ): Promise<ConnectionSuggestion[]> {
    try {
      let userId = optionalUserId;
      if (!userId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to get suggestions');
        }
        userId = authResult.data.user.id;
      }

      // 1. Get current user's profile and details
      const { data: myProfileData } = await this.db
        .from('candidate_profiles')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      const myProfileId = myProfileData ? (((myProfileData as unknown) as Record<string, unknown>).id as string) : null;

      // Current user's past companies (experience)
      let myCompanies: string[] = [];
      if (myProfileId) {
        const { data: myExp } = await this.db
          .from('experience')
          .select('company_name')
          .eq('candidate_profile_id', myProfileId);
        if (myExp) {
          myCompanies = ((myExp as unknown) as Array<{ company_name?: string | null }>)
            .map(e => (e.company_name || '').trim().toLowerCase())
            .filter(Boolean);
        }
      }

      // Current user's educational institutions (education)
      let mySchools: string[] = [];
      if (myProfileId) {
        const { data: myEdu } = await this.db
          .from('education')
          .select('institution_name')
          .eq('candidate_profile_id', myProfileId);
        if (myEdu) {
          mySchools = ((myEdu as unknown) as Array<{ institution_name?: string | null }>)
            .map(e => (e.institution_name || '').trim().toLowerCase())
            .filter(Boolean);
        }
      }

      // Current user's skills
      let mySkillIds: string[] = [];
      if (myProfileId) {
        const { data: mySkills } = await this.db
          .from('candidate_skills')
          .select('skill_id')
          .eq('candidate_profile_id', myProfileId);
        if (mySkills) {
          mySkillIds = ((mySkills as unknown) as Array<{ skill_id: string }>).map(s => s.skill_id);
        }
      }

      // 2. Fetch existing connections & blocked users to exclude
      const [existingConns, blockedUsers] = await Promise.all([
        this.getConnections(userId, 'all'),
        this.getBlockedUsers(userId),
      ]);

      const excludedUserIds = new Set<string>([userId]);
      for (const c of existingConns) {
        excludedUserIds.add(c.requester_id);
        excludedUserIds.add(c.recipient_id);
      }
      for (const b of blockedUsers) {
        excludedUserIds.add(b.blocked_id);
      }

      // 3. Fetch all candidate profiles
      const { data: allProfilesData } = await this.db
        .from('candidate_profiles')
        .select('*');

      const profiles = (allProfilesData as unknown as Array<Record<string, unknown>>) || [];
      const candidateUserIds = profiles
        .map(p => p.user_id as string)
        .filter(id => id && !excludedUserIds.has(id));

      if (candidateUserIds.length === 0) {
        return [];
      }

      // Fetch matching users
      const { data: usersData } = await this.db
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', candidateUserIds);

      const userMap = new Map<string, ConnectionUserSummary>();
      if (usersData) {
        for (const u of (usersData as unknown as Array<{ id: string; full_name: string | null; email: string; avatar_url: string | null }>)) {
          userMap.set(u.id, {
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            avatar_url: u.avatar_url,
          });
        }
      }

      // Fetch skill dictionary
      const skillNameMap = new Map<string, string>();
      const { data: allSkills } = await this.db.from('skills').select('id, name');
      if (allSkills) {
        for (const s of (allSkills as unknown as Array<{ id: string; name: string }>)) {
          skillNameMap.set(s.id, s.name);
        }
      }

      const suggestions: ConnectionSuggestion[] = [];

      for (const p of profiles) {
        const pUserId = p.user_id as string;
        if (!pUserId || excludedUserIds.has(pUserId)) continue;
        const u = userMap.get(pUserId);
        if (!u) continue;

        let score = 10;
        const reasonTags: string[] = [];
        let matchedCompany: string | undefined;
        let matchedSchool: string | undefined;
        const matchedSkills: string[] = [];

        // Check experience (colleagues)
        const { data: candExp } = await this.db
          .from('experience')
          .select('company_name')
          .eq('candidate_profile_id', p.id as string);

        if (candExp && myCompanies.length > 0) {
          const expList = candExp as unknown as Array<{ company_name?: string | null }>;
          for (const exp of expList) {
            const cName = (exp.company_name || '').trim();
            if (cName && myCompanies.includes(cName.toLowerCase())) {
              matchedCompany = cName;
              score += 35;
              reasonTags.push(`Colleague from ${cName}`);
              break;
            }
          }
        }

        // Check education (alumni)
        const { data: candEdu } = await this.db
          .from('education')
          .select('institution_name')
          .eq('candidate_profile_id', p.id as string);

        if (candEdu && mySchools.length > 0) {
          const eduList = candEdu as unknown as Array<{ institution_name?: string | null }>;
          for (const edu of eduList) {
            const sName = (edu.institution_name || '').trim();
            if (sName && mySchools.includes(sName.toLowerCase())) {
              matchedSchool = sName;
              score += 30;
              reasonTags.push(`Alumni from ${sName}`);
              break;
            }
          }
        }

        // Check skills overlap
        const { data: candSkills } = await this.db
          .from('candidate_skills')
          .select('skill_id')
          .eq('candidate_profile_id', p.id as string);

        if (candSkills && mySkillIds.length > 0) {
          const skillsList = candSkills as unknown as Array<{ skill_id: string }>;
          for (const cs of skillsList) {
            if (mySkillIds.includes(cs.skill_id)) {
              const skillName = skillNameMap.get(cs.skill_id) || 'Skill';
              matchedSkills.push(skillName);
              score += 10;
            }
          }
          if (matchedSkills.length > 0) {
            reasonTags.push(`${matchedSkills.length} shared skill${matchedSkills.length > 1 ? 's' : ''}`);
          }
        }

        // Open to work bonus
        if (p.availability_status === 'open_to_work' || p.availability_status === 'available') {
          score += 15;
          reasonTags.push('Open to opportunities');
        }

        // Apply strict preferences if set
        if (preferences.alumniOnly && !matchedSchool) continue;
        if (preferences.colleaguesOnly && !matchedCompany) continue;
        if (preferences.sharedSkillsOnly && matchedSkills.length === 0) continue;

        suggestions.push({
          user: {
            id: u.id,
            full_name: u.full_name || 'TalentSphere Member',
            email: u.email,
            avatar_url: u.avatar_url,
            headline: (p.headline as string) || null,
            location: p.location_city ? `${p.location_city as string}, ${(p.location_country as string) || ''}`.trim() : null,
          },
          score,
          reasonTags: reasonTags.length > 0 ? reasonTags : ['Recommended peer in your field'],
          sharedCompany: matchedCompany,
          sharedInstitution: matchedSchool,
          sharedSkills: matchedSkills,
        });
      }

      suggestions.sort((a, b) => b.score - a.score);
      return suggestions.slice(0, limit);
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error getting suggested connections', { cause: error });
    }
  }

  /**
   * Get high-level network statistics for a user
   */
  async getNetworkStats(optionalUserId?: string): Promise<NetworkStats> {
    try {
      let userId = optionalUserId;
      if (!userId) {
        const authResult = await this.db.auth.getUser();
        if (!authResult.data?.user) {
          throw AppErrors.unauthorized('Must be authenticated to get network stats');
        }
        userId = authResult.data.user.id;
      }

      const all = await this.getConnections(userId, 'all');

      let totalConnections = 0;
      let pendingReceived = 0;
      let pendingSent = 0;

      for (const c of all) {
        if (c.status === 'accepted') {
          totalConnections++;
        } else if (c.status === 'pending') {
          if (c.recipient_id === userId) {
            pendingReceived++;
          } else if (c.requester_id === userId) {
            pendingSent++;
          }
        }
      }

      return {
        totalConnections,
        pendingReceived,
        pendingSent,
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error getting network stats', { cause: error });
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async notifyConnectionRequest(
    recipientId: string,
    requesterId: string,
    note?: string | null
  ): Promise<void> {
    try {
      let requesterName = 'Someone';
      const { data: u } = await this.db.from('users').select('full_name').eq('id', requesterId).maybeSingle();
      if (u) {
        const uRec = u as unknown as { full_name?: string | null };
        if (uRec.full_name) {
          requesterName = uRec.full_name;
        }
      }

      await this.db.from('notifications').insert({
        user_id: recipientId,
        type: 'invitation',
        title: 'New Connection Request',
        message: note
          ? `${requesterName} invited you to connect: "${note}"`
          : `${requesterName} wants to connect with you on TalentSphere.`,
        link_url: '/network?tab=pending',
        link_label: 'View Request',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking notification emission
    }
  }

  private async checkAndAwardNetworkerBadge(userId: string): Promise<void> {
    try {
      const { data: profile } = await this.db
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) return;
      const profileId = ((profile as unknown) as Record<string, unknown>).id as string;

      const connections = await this.getConnections(userId, 'accepted');
      if (connections.length >= 1) {
        const candidateService = new CandidateService(this.db);
        await candidateService.awardBadge(profileId, 'b1000000-0000-0000-0000-000000000006', {
          connectionCount: connections.length,
          milestone: 'First connection established',
        });
      }
    } catch {
      // Non-blocking badge award
    }
  }

  private async enrichConnectionRecords(records: Array<Record<string, unknown>>, viewerUserId?: string): Promise<ConnectionRecord[]> {
    if (!records || records.length === 0) return [];

    const userIds = new Set<string>();
    for (const r of records) {
      if (r.requester_id) userIds.add(r.requester_id as string);
      if (r.recipient_id) userIds.add(r.recipient_id as string);
    }

    const userMap = new Map<string, ConnectionUserSummary>();

    try {
      const { data: usersData } = await this.db
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(userIds));

      if (usersData) {
        for (const u of (usersData as unknown as Array<{ id: string; full_name: string | null; email: string; avatar_url: string | null }>)) {
          userMap.set(u.id, {
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            avatar_url: u.avatar_url,
          });
        }
      }

      // Fetch headlines from candidate profiles
      const { data: profilesData } = await this.db
        .from('candidate_profiles')
        .select('user_id, headline, location_city, location_country')
        .in('user_id', Array.from(userIds));

      if (profilesData) {
        for (const p of (profilesData as unknown as Array<{ user_id: string; headline?: string | null; location_city?: string | null; location_country?: string | null }>)) {
          const u = userMap.get(p.user_id);
          if (u) {
            u.headline = p.headline;
            u.location = p.location_city ? `${p.location_city}, ${p.location_country || ''}`.trim() : null;
          }
        }
      }
    } catch {
      // Non-blocking enrichment
    }

    return records.map(r => {
      const reqId = r.requester_id as string;
      const recId = r.recipient_id as string;
      const requester = userMap.get(reqId) || {
        id: reqId,
        full_name: null,
        email: '',
        avatar_url: null,
      };

      const recipient = userMap.get(recId) || {
        id: recId,
        full_name: null,
        email: '',
        avatar_url: null,
      };

      let connectedUser: ConnectionUserSummary | undefined;
      if (viewerUserId) {
        connectedUser = viewerUserId === reqId ? recipient : requester;
      }

      return {
        id: r.id as string,
        requester_id: reqId,
        recipient_id: recId,
        status: r.status as ConnectionStatus,
        note: (r.note as string) || null,
        created_at: r.created_at as string,
        updated_at: (r.updated_at as string) || (r.created_at as string),
        requester,
        recipient,
        connected_user: connectedUser,
      };
    });
  }

  private async enrichConnectionRecord(record: Record<string, unknown>, viewerUserId?: string): Promise<ConnectionRecord> {
    const list = await this.enrichConnectionRecords([record], viewerUserId);
    return list[0];
  }
}

import { AppConfig } from '../config/index';

// Export singleton instance for browser usage
let _instance: NetworkService | null = null;

export function getNetworkService(): NetworkService {
  if (_instance) {
    return _instance;
  }

  const adapter = createDatabaseAdapter({
    supabaseUrl: AppConfig.supabase.url,
    supabaseKey: AppConfig.supabase.anonKey,
  });

  _instance = new NetworkService(adapter);
  return _instance;
}

export const networkService = getNetworkService();

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

import { createDatabaseAdapter, type DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

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

export class NetworkService {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Block a user - prevents them from interacting with you
   * Implements NET-005: User Blocking Mechanism
   */
  async blockUser(input: BlockUserInput): Promise<BlockedUserRecord> {
    try {
      // Get current user
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        throw AppErrors.unauthorized('Must be authenticated to block users');
      }

      const blockerId = authResult.data.user.id;
      const blockedId = input.blockedUserId;

      // Prevent self-blocking
      if (blockerId === blockedId) {
        throw AppErrors.validation('Cannot block yourself');
      }

      // Check if already blocked
      const existingBlock = await this.db
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId)
        .maybeSingle();

      if (existingBlock.data) {
        throw AppErrors.validation('User is already blocked');
      }

      // Create block record
      const { data, error } = await this.db
        .from('blocked_users')
        .insert({
          blocker_id: blockerId,
          blocked_id: blockedId,
          reason: input.reason || null,
        })
        .select(`
          *,
          blocked_user:users!blocked_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw AppErrors.database('Failed to block user', {
          cause: error,
          context: { blockerId, blockedId },
        });
      }

      return data as unknown as BlockedUserRecord;
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw AppErrors.database('Unexpected error blocking user', {
        cause: error,
        context: { blockedUserId: input.blockedUserId },
      });
    }
  }

  /**
   * Unblock a previously blocked user
   */
  async unblockUser(blockedUserId: string): Promise<boolean> {
    try {
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        throw AppErrors.unauthorized('Must be authenticated to unblock users');
      }

      const blockerId = authResult.data.user.id;

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
        context: { blockedUserId },
      });
    }
  }

  /**
   * Get list of users blocked by current user
   */
  async getBlockedUsers(): Promise<BlockedUserRecord[]> {
    try {
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        throw AppErrors.unauthorized('Must be authenticated to view blocked users');
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select(`
          *,
          blocked_user:users!blocked_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('blocker_id', authResult.data.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw AppErrors.database('Failed to fetch blocked users', {
          cause: error,
        });
      }

      return (data as unknown as BlockedUserRecord[]) || [];
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
   * Check if a specific user is blocked by current user
   */
  async isUserBlocked(userId: string): Promise<boolean> {
    try {
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        return false;
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', authResult.data.user.id)
        .eq('blocked_id', userId)
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
   * Check if current user is blocked by another user
   */
  async isBlockedBy(userId: string): Promise<boolean> {
    try {
      const authResult = await this.db.auth.getUser();
      if (!authResult.data?.user) {
        return false;
      }

      const { data, error } = await this.db
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', userId)
        .eq('blocked_id', authResult.data.user.id)
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
   * Check mutual block status between current user and another user
   */
  async getBlockStatus(userId: string): Promise<{
    iBlockedThem: boolean;
    theyBlockedMe: boolean;
  }> {
    const [iBlockedThem, theyBlockedMe] = await Promise.all([
      this.isUserBlocked(userId),
      this.isBlockedBy(userId),
    ]);

    return {
      iBlockedThem,
      theyBlockedMe,
    };
  }
}

// Export singleton instance for browser usage
let _instance: NetworkService | null = null;

export function getNetworkService(): NetworkService {
  if (_instance) {
    return _instance;
  }

  const adapter = createDatabaseAdapter({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  _instance = new NetworkService(adapter);
  return _instance;
}

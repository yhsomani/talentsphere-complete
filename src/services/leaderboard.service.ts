/**
 * Leaderboard Service - Refactored Version
 * 
 * Data access layer for leaderboard and ranking operations.
 * Handles all Supabase interactions for user rankings and gamification.
 * Uses DatabaseAdapter for loose coupling and testability.
 */

import type { Database } from '@/types/database.types';
import { DatabaseAdapter } from '@/lib/database/adapter';
import { AppErrors, isAppError } from '@/lib/errors';

export interface LeaderboardRankItem {
  rank: number;
  userId: string;
  name: string;
  email: string;
  headline?: string;
  avatarUrl?: string;
  level: number;
  xpPoints: number;
  badgesCount?: number;
  isCurrentUser?: boolean;
}

export interface UserLevelStats {
  user_id: string;
  current_level: number;
  total_xp_earned: number;
  xp_to_next_level: number;
  rank?: number;
}

/**
 * LeaderboardService class with dependency injection
 */
export class LeaderboardService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Fetch leaderboard rankings for a period
   */
  async getLeaderboard(
    _period: 'all_time' | 'weekly' | 'monthly' = 'all_time',
    currentUserId?: string
  ): Promise<LeaderboardRankItem[]> {
    try {
      // Query user_levels joined with users, ordered by total_xp_earned desc
      const result = await this.db.list<any>('user_levels', {
        pagination: {
          page: 1,
          pageSize: 50,
          orderBy: 'total_xp_earned',
          ascending: false,
        },
      });

      if (result.error || !result.data || result.data.length === 0) {
        // Fallback seed rankings if database is fresh
        return this.getSeedLeaderboard(currentUserId);
      }

      // Fetch user details for all users in the leaderboard
      const userIds = result.data.map((item: any) => item.user_id);
      const usersResult = await this.db.list<any>('users', {
        filters: [{ field: 'id', operator: 'in', value: userIds }],
      });

      const userMap = new Map<string, any>();
      (usersResult.data || []).forEach((u: any) => {
        userMap.set(u.id, u);
      });

      return result.data.map((item: any, index: number) => {
        const u = userMap.get(item.user_id);
        const name =
          u?.full_name?.trim() || u?.email?.split('@')[0] || 'TalentSphere Candidate';

        return {
          rank: index + 1,
          userId: item.user_id,
          name,
          email: u?.email || '',
          headline: u?.headline || 'Software Engineer',
          avatarUrl: u?.avatar_url || undefined,
          level: item.current_level || 1,
          xpPoints: item.total_xp_earned || 0,
          badgesCount: Math.floor((item.total_xp_earned || 0) / 300),
          isCurrentUser: currentUserId === item.user_id,
        };
      });
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      const error = isAppError(err) ? err : AppErrors.UNKNOWN;
      throw error;
    }
  }

  /**
   * Get seed/fallback leaderboard data
   */
  private getSeedLeaderboard(currentUserId?: string): LeaderboardRankItem[] {
    return [
      {
        rank: 1,
        userId: 'u-1',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        headline: 'Staff Full-Stack & Distributed Systems Architect',
        level: 8,
        xpPoints: 3450,
        badgesCount: 12,
        isCurrentUser: currentUserId === 'u-1',
      },
      {
        rank: 2,
        userId: 'u-2',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        headline: 'Senior Cloud & DevOps Engineer | Kubernetes Specialist',
        level: 7,
        xpPoints: 2890,
        badgesCount: 9,
        isCurrentUser: currentUserId === 'u-2',
      },
      {
        rank: 3,
        userId: 'u-3',
        name: 'Marcus Chen',
        email: 'marcus.chen@example.com',
        headline: 'Frontend Lead & React Ecosystem Specialist',
        level: 6,
        xpPoints: 2420,
        badgesCount: 8,
        isCurrentUser: currentUserId === 'u-3',
      },
      {
        rank: 4,
        userId: 'u-4',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        headline: 'AI & Machine Learning Research Engineer',
        level: 5,
        xpPoints: 1980,
        badgesCount: 6,
        isCurrentUser: currentUserId === 'u-4',
      },
      {
        rank: 5,
        userId: 'u-5',
        name: 'Devon Vance',
        email: 'devon.v@example.com',
        headline: 'Senior Backend Engineer (Go & PostgreSQL)',
        level: 4,
        xpPoints: 1540,
        badgesCount: 5,
        isCurrentUser: currentUserId === 'u-5',
      },
    ];
  }

  /**
   * Get user's current level and XP stats
   */
  async getUserStats(userId: string): Promise<UserLevelStats | null> {
    try {
      const result = await this.db.get<any>('user_levels', undefined, {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      if (result.error || !result.data) {
        return null;
      }

      const levelData = result.data;
      const xpToNext = this.calculateXpToNextLevel(levelData.current_level, levelData.total_xp_earned);

      return {
        user_id: userId,
        current_level: levelData.current_level || 1,
        total_xp_earned: levelData.total_xp_earned || 0,
        xp_to_next_level: xpToNext,
      };
    } catch (err) {
      console.error('Error fetching user stats:', err);
      return null;
    }
  }

  /**
   * Calculate XP needed to reach next level
   */
  private calculateXpToNextLevel(currentLevel: number, totalXp: number): number {
    const xpRequiredForLevel = (level: number) => level * level * 100;
    const nextLevelXp = xpRequiredForLevel(currentLevel + 1);
    const currentLevelXp = xpRequiredForLevel(currentLevel);
    const xpInCurrentLevel = totalXp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return Math.max(0, xpNeeded - xpInCurrentLevel);
  }

  /**
   * Get user's rank position in leaderboard
   */
  async getUserRank(userId: string): Promise<number | null> {
    try {
      const result = await this.db.list<any>('user_levels', {
        pagination: {
          orderBy: 'total_xp_earned',
          ascending: false,
        },
      });

      if (result.error || !result.data) {
        return null;
      }

      const index = result.data.findIndex((item: any) => item.user_id === userId);
      return index >= 0 ? index + 1 : null;
    } catch (err) {
      console.error('Error fetching user rank:', err);
      return null;
    }
  }

  /**
   * Add XP to a user (with level progression)
   */
  async addXp(userId: string, xpAmount: number, reason?: string): Promise<UserLevelStats | null> {
    try {
      // Get current level data
      const existing = await this.db.get<any>('user_levels', undefined, {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      let levelData;
      if (existing.data) {
        levelData = existing.data;
      } else {
        // Create initial level record
        const createResult = await this.db.create<any>('user_levels', {
          user_id: userId,
          current_level: 1,
          total_xp_earned: 0,
        });
        if (createResult.error || !createResult.data) {
          return null;
        }
        levelData = createResult.data;
      }

      // Calculate new XP and level
      const newXp = (levelData.total_xp_earned || 0) + xpAmount;
      const newLevel = this.calculateLevelFromXp(newXp);

      // Update user_levels
      const updateResult = await this.db.update<any>('user_levels', undefined, {
        total_xp_earned: newXp,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      }, {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      });

      if (updateResult.error) {
        return null;
      }

      // Log XP history if reason provided
      if (reason) {
        await this.db.create<any>('xp_history', {
          user_id: userId,
          xp_change: xpAmount,
          reason,
          new_total_xp: newXp,
          new_level: newLevel,
        });
      }

      const xpToNext = this.calculateXpToNextLevel(newLevel, newXp);

      return {
        user_id: userId,
        current_level: newLevel,
        total_xp_earned: newXp,
        xp_to_next_level: xpToNext,
      };
    } catch (err) {
      console.error('Error adding XP:', err);
      return null;
    }
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevelFromXp(totalXp: number): number {
    let level = 1;
    while (totalXp >= level * level * 100) {
      level++;
    }
    return level - 1;
  }

  /**
   * Get XP history for a user
   */
  async getXpHistory(userId: string, limit = 20): Promise<Array<{
    id: string;
    xp_change: number;
    reason?: string;
    new_total_xp: number;
    new_level: number;
    created_at: string;
  }>> {
    try {
      const result = await this.db.list<any>('xp_history', {
        filters: [{ field: 'user_id', operator: 'eq', value: userId }],
        pagination: {
          page: 1,
          pageSize: limit,
          orderBy: 'created_at',
          ascending: false,
        },
      });

      if (result.error || !result.data) {
        return [];
      }

      return result.data.map((h: any) => ({
        id: h.id,
        xp_change: h.xp_change,
        reason: h.reason,
        new_total_xp: h.new_total_xp,
        new_level: h.new_level,
        created_at: h.created_at,
      }));
    } catch (err) {
      console.error('Error fetching XP history:', err);
      return [];
    }
  }

  /**
   * Get top N users by level
   */
  async getTopUsersByLevel(limit = 10): Promise<LeaderboardRankItem[]> {
    try {
      const result = await this.db.list<any>('user_levels', {
        pagination: {
          page: 1,
          pageSize: limit,
          orderBy: 'current_level',
          ascending: false,
        },
      });

      if (result.error || !result.data) {
        return [];
      }

      const userIds = result.data.map((item: any) => item.user_id);
      const usersResult = await this.db.list<any>('users', {
        filters: [{ field: 'id', operator: 'in', value: userIds }],
      });

      const userMap = new Map<string, any>();
      (usersResult.data || []).forEach((u: any) => {
        userMap.set(u.id, u);
      });

      return result.data.map((item: any, index: number) => {
        const u = userMap.get(item.user_id);
        return {
          rank: index + 1,
          userId: item.user_id,
          name: u?.full_name || u?.email?.split('@')[0] || 'User',
          email: u?.email || '',
          level: item.current_level || 1,
          xpPoints: item.total_xp_earned || 0,
        };
      });
    } catch (err) {
      console.error('Error fetching top users:', err);
      return [];
    }
  }
}

// Backward compatible exports
let defaultLeaderboardService: LeaderboardService | null = null;

export function initLeaderboardService(db: DatabaseAdapter): LeaderboardService {
  defaultLeaderboardService = new LeaderboardService(db);
  return defaultLeaderboardService;
}

export const leaderboardService = new Proxy<LeaderboardService>({} as LeaderboardService, {
  get(_target, prop) {
    if (!defaultLeaderboardService) {
      throw new Error('LeaderboardService not initialized. Call initLeaderboardService() first.');
    }
    return (defaultLeaderboardService as any)[prop];
  },
});

/**
 * TalentSphere Gamification & XP Ledger Domain (F-22, F-23, BR-25, WF-11)
 * Level progression curves, daily 200 XP ledger cap, streak maintenance, and badge unlocks.
 */
import { XpTransaction } from './assessment.js';
export type BadgeCategory = 'skills' | 'challenges' | 'learning' | 'community' | 'streak';
export interface Badge {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: BadgeCategory;
    iconUrl?: string;
    criteriaType: string;
    criteriaThreshold: number;
}
export interface UserBadge {
    id: string;
    userId: string;
    badgeId: string;
    awardedAt: string;
}
export interface GamificationProfile {
    userId: string;
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: string;
    createdAt: string;
    updatedAt: string;
}
export interface LevelInfo {
    level: number;
    currentLevelFloorXp: number;
    nextLevelXp: number;
    progressPercent: number;
}
export declare const DAILY_XP_CAP = 200;
/**
 * Baseline Platform Badges Catalog
 */
export declare const DEFAULT_PLATFORM_BADGES: Omit<Badge, 'id'>[];
/**
 * Calculates level and progress towards next level given total lifetime XP.
 * Progression curve:
 * Level 1: 0 XP
 * Level 2: 100 XP (+100)
 * Level 3: 250 XP (+150)
 * Level 4: 450 XP (+200)
 * Level 5: 700 XP (+250)
 * Level 6: 1000 XP (+300)...
 */
export declare function calculateLevel(totalXp: number): LevelInfo;
/**
 * Updates streak counters based on the date of activity.
 */
export declare function updateStreak(profile: GamificationProfile, activityDate?: string): GamificationProfile;
export interface ProcessXpAwardParams {
    userId: string;
    amount: number;
    referenceType: string;
    referenceId: string;
    description?: string;
    profile: GamificationProfile;
    existingTransactions: XpTransaction[];
    currentDate?: string;
}
export interface ProcessXpAwardResult {
    transaction?: XpTransaction;
    updatedProfile: GamificationProfile;
    awardedAmount: number;
    isDuplicate: boolean;
    isCapReached: boolean;
}
/**
 * Idempotently awards XP to a user, strictly enforcing:
 * 1. Idempotency per (user_id, reference_type, reference_id) (BR-25, WIT-011)
 * 2. Daily 200 XP ledger cap (BR-25)
 * 3. Level recomputation and streak maintenance
 */
export declare function processXpAward(params: ProcessXpAwardParams): ProcessXpAwardResult;
export interface UserMetrics {
    totalXp: number;
    completedChallengesCount: number;
    completedCoursesCount: number;
    currentStreak: number;
    connectionsCount: number;
}
/**
 * Checks for any newly unlocked badges based on updated user metrics.
 */
export declare function evaluateEligibleBadges(metrics: UserMetrics, allBadges: Badge[], alreadyAwardedBadgeIds: string[]): Badge[];
export interface LeaderboardUserRecord {
    userId: string;
    displayName: string;
    totalXp: number;
    level: number;
    currentStreak: number;
    badgesCount: number;
    weeklyXp: number;
}
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    xp: number;
    level: number;
    currentStreak: number;
    badgesCount: number;
}
/**
 * Computes ranked leaderboard for weekly or all-time periods (OD-06, F-23).
 */
export declare function computeLeaderboard(records: LeaderboardUserRecord[], period?: 'weekly' | 'all_time', limit?: number): LeaderboardEntry[];
//# sourceMappingURL=gamification.d.ts.map
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

export const DAILY_XP_CAP = 200; // Canonical BR-25

/**
 * Baseline Platform Badges Catalog
 */
export const DEFAULT_PLATFORM_BADGES: Omit<Badge, 'id'>[] = [
  {
    slug: 'first_challenge',
    name: 'Arena Pioneer',
    description: 'Passed your first proctored coding challenge in the Arena.',
    category: 'challenges',
    criteriaType: 'challenges_completed',
    criteriaThreshold: 1,
  },
  {
    slug: 'first_course',
    name: 'Certified Scholar',
    description: 'Completed your first LMS course and minted a digital certificate.',
    category: 'learning',
    criteriaType: 'courses_completed',
    criteriaThreshold: 1,
  },
  {
    slug: 'streak_3',
    name: 'Consistent Contributor',
    description: 'Maintained an active 3-day learning and practice streak.',
    category: 'streak',
    criteriaType: 'streak_days',
    criteriaThreshold: 3,
  },
  {
    slug: 'streak_7',
    name: 'Dedication Master',
    description: 'Maintained an active 7-day learning and practice streak.',
    category: 'streak',
    criteriaType: 'streak_days',
    criteriaThreshold: 7,
  },
  {
    slug: 'xp_500',
    name: 'XP Prodigy',
    description: 'Accumulated 500 lifetime XP through verified tasks.',
    category: 'skills',
    criteriaType: 'total_xp',
    criteriaThreshold: 500,
  },
  {
    slug: 'first_connection',
    name: 'Network Builder',
    description: 'Formed your first verified professional connection.',
    category: 'community',
    criteriaType: 'connections_count',
    criteriaThreshold: 1,
  },
];

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
export function calculateLevel(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));

  let currentLevel = 1;
  let floorXp = 0;
  let nextThreshold = 100;
  let stepIncrement = 100;

  while (safeXp >= nextThreshold) {
    currentLevel += 1;
    floorXp = nextThreshold;
    stepIncrement += 50;
    nextThreshold = floorXp + stepIncrement;
  }

  const range = nextThreshold - floorXp;
  const earnedInRange = safeXp - floorXp;
  const progressPercent = Math.min(100, Math.floor((earnedInRange / range) * 100));

  return {
    level: currentLevel,
    currentLevelFloorXp: floorXp,
    nextLevelXp: nextThreshold,
    progressPercent,
  };
}

/**
 * Updates streak counters based on the date of activity.
 */
export function updateStreak(
  profile: GamificationProfile,
  activityDate: string = new Date().toISOString().slice(0, 10)
): GamificationProfile {
  if (profile.lastActivityDate === activityDate) {
    return profile;
  }

  let currentStreak = profile.currentStreak;
  let longestStreak = profile.longestStreak;

  if (!profile.lastActivityDate) {
    currentStreak = 1;
    longestStreak = Math.max(longestStreak, 1);
  } else {
    const lastDate = new Date(profile.lastActivityDate);
    const currentDate = new Date(activityDate);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  const now = new Date().toISOString();
  return {
    ...profile,
    currentStreak,
    longestStreak,
    lastActivityDate: activityDate,
    updatedAt: now,
  };
}

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
export function processXpAward(params: ProcessXpAwardParams): ProcessXpAwardResult {
  const currentDate = params.currentDate || new Date().toISOString().slice(0, 10);

  // 1. Idempotency check
  const duplicate = params.existingTransactions.find(
    (t) => t.referenceType === params.referenceType && t.referenceId === params.referenceId
  );
  if (duplicate) {
    return {
      transaction: duplicate,
      updatedProfile: params.profile,
      awardedAmount: 0,
      isDuplicate: true,
      isCapReached: false,
    };
  }

  // 2. Daily Cap check (BR-25)
  const todayTransactions = params.existingTransactions.filter((t) =>
    t.createdAt.startsWith(currentDate)
  );
  const currentTotalToday = todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remainingAllowance = Math.max(0, DAILY_XP_CAP - currentTotalToday);

  if (remainingAllowance <= 0) {
    return {
      updatedProfile: params.profile,
      awardedAmount: 0,
      isDuplicate: false,
      isCapReached: true,
    };
  }

  const awardedAmount = Math.min(params.amount, remainingAllowance);
  if (awardedAmount <= 0) {
    return {
      updatedProfile: params.profile,
      awardedAmount: 0,
      isDuplicate: false,
      isCapReached: true,
    };
  }

  const now = new Date().toISOString();
  const txCreatedAt = params.currentDate
    ? params.currentDate.includes('T')
      ? params.currentDate
      : `${params.currentDate}T${now.slice(11)}`
    : now;
  const transaction: XpTransaction = {
    id: crypto.randomUUID(),
    userId: params.userId,
    amount: awardedAmount,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
    description: params.description || `${params.referenceType} XP award`,
    createdAt: txCreatedAt,
  };

  // 3. Recompute profile metrics
  const newTotalXp = params.profile.totalXp + awardedAmount;
  const levelInfo = calculateLevel(newTotalXp);
  const withStreak = updateStreak(params.profile, currentDate);

  const updatedProfile: GamificationProfile = {
    ...withStreak,
    totalXp: newTotalXp,
    currentLevel: levelInfo.level,
    updatedAt: now,
  };

  return {
    transaction,
    updatedProfile,
    awardedAmount,
    isDuplicate: false,
    isCapReached: false,
  };
}

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
export function evaluateEligibleBadges(
  metrics: UserMetrics,
  allBadges: Badge[],
  alreadyAwardedBadgeIds: string[]
): Badge[] {
  const eligible: Badge[] = [];

  for (const badge of allBadges) {
    if (alreadyAwardedBadgeIds.includes(badge.id)) {
      continue;
    }

    let qualifies = false;
    switch (badge.criteriaType) {
      case 'challenges_completed':
        qualifies = metrics.completedChallengesCount >= badge.criteriaThreshold;
        break;
      case 'courses_completed':
        qualifies = metrics.completedCoursesCount >= badge.criteriaThreshold;
        break;
      case 'streak_days':
        qualifies = metrics.currentStreak >= badge.criteriaThreshold;
        break;
      case 'total_xp':
        qualifies = metrics.totalXp >= badge.criteriaThreshold;
        break;
      case 'connections_count':
        qualifies = metrics.connectionsCount >= badge.criteriaThreshold;
        break;
      default:
        qualifies = false;
    }

    if (qualifies) {
      eligible.push(badge);
    }
  }

  return eligible;
}

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
export function computeLeaderboard(
  records: LeaderboardUserRecord[],
  period: 'weekly' | 'all_time' = 'all_time',
  limit = 50
): LeaderboardEntry[] {
  const sorted = [...records].sort((a, b) => {
    const xpA = period === 'weekly' ? a.weeklyXp : a.totalXp;
    const xpB = period === 'weekly' ? b.weeklyXp : b.totalXp;
    if (xpB !== xpA) {
      return xpB - xpA;
    }
    // Secondary tie-breaker: streak descending
    if (b.currentStreak !== a.currentStreak) {
      return b.currentStreak - a.currentStreak;
    }
    return a.userId.localeCompare(b.userId);
  });

  return sorted.slice(0, limit).map((record, index) => ({
    rank: index + 1,
    userId: record.userId,
    displayName: record.displayName,
    xp: period === 'weekly' ? record.weeklyXp : record.totalXp,
    level: record.level,
    currentStreak: record.currentStreak,
    badgesCount: record.badgesCount,
  }));
}

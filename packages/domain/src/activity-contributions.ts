import crypto from 'node:crypto';
import { DomainError } from './core.js';

export type ActivityCategory = 'learning' | 'creation' | 'collaboration' | 'social';
export type EngagementBand = 'passive' | 'active' | 'power_contributor' | 'luminary';

export interface ActivityEvent {
  id: string;
  userId: string;
  category: ActivityCategory;
  activityType: string;
  weight: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export interface ContributionScore {
  userId: string;
  compositeScore: number;
  engagementBand: EngagementBand;
  learningScore: number;
  creationScore: number;
  collaborationScore: number;
  socialScore: number;
  activeStreakDays: number;
  totalEventsCount: number;
  lastActiveAt: string | null;
  updatedAt: string;
}

export interface RecordActivityEventParams {
  id?: string;
  userId: string;
  category: ActivityCategory;
  activityType: string;
  weight?: number;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
}

export function determineEngagementBand(score: number): EngagementBand {
  if (score >= 80) return 'luminary';
  if (score >= 50) return 'power_contributor';
  if (score >= 20) return 'active';
  return 'passive';
}

export function recordActivityEvent(params: RecordActivityEventParams): ActivityEvent {
  if (!params.userId || params.userId.trim().length === 0) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'User ID is required for recording an activity event.'
    );
  }

  const validCategories: ActivityCategory[] = ['learning', 'creation', 'collaboration', 'social'];
  if (!validCategories.includes(params.category)) {
    throw new DomainError('VALIDATION_FAILED', `Invalid activity category '${params.category}'.`);
  }

  if (!params.activityType || params.activityType.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Activity type is required.');
  }

  const weight = params.weight !== undefined ? params.weight : 1.0;
  if (weight <= 0 || weight > 10.0) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Activity event weight must be between 0.1 and 10.0.'
    );
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    userId: params.userId,
    category: params.category,
    activityType: params.activityType.trim().toLowerCase(),
    weight,
    metadata: params.metadata || {},
    occurredAt: params.occurredAt || now,
    createdAt: now,
  };
}

/**
 * Computes deterministic contribution and engagement scores across all activity categories (F-146, S-09).
 */
export function calculateContributionScores(
  userId: string,
  events: ActivityEvent[],
  referenceDate?: Date
): ContributionScore {
  const ref = referenceDate || new Date();
  const refTime = ref.getTime();
  const nowIso = ref.toISOString();

  if (events.length === 0) {
    return {
      userId,
      compositeScore: 0,
      engagementBand: 'passive',
      learningScore: 0,
      creationScore: 0,
      collaborationScore: 0,
      socialScore: 0,
      activeStreakDays: 0,
      totalEventsCount: 0,
      lastActiveAt: null,
      updatedAt: nowIso,
    };
  }

  // Multipliers per category
  // learning: 5 points per weighted unit
  // creation: 10 points per weighted unit
  // collaboration: 8 points per weighted unit
  // social: 3 points per weighted unit
  let learningRaw = 0;
  let creationRaw = 0;
  let collaborationRaw = 0;
  let socialRaw = 0;

  const activeDaysSet = new Set<string>();
  let latestActiveTime = 0;

  for (const ev of events) {
    const evTime = new Date(ev.occurredAt).getTime();
    if (evTime > latestActiveTime) {
      latestActiveTime = evTime;
    }

    // Decay factor: 1.0 within 30 days, continuous decay for older events (60-day half-life)
    const ageDays = Math.max(0, (refTime - evTime) / (1000 * 60 * 60 * 24));
    let decayFactor = 1.0;
    if (ageDays > 30) {
      decayFactor = Math.pow(0.5, (ageDays - 30) / 60);
    }

    const effectiveWeight = ev.weight * decayFactor;

    if (ev.category === 'learning') {
      learningRaw += effectiveWeight * 5;
    } else if (ev.category === 'creation') {
      creationRaw += effectiveWeight * 10;
    } else if (ev.category === 'collaboration') {
      collaborationRaw += effectiveWeight * 8;
    } else if (ev.category === 'social') {
      socialRaw += effectiveWeight * 3;
    }

    // Record day for streak
    const dayKey = ev.occurredAt.substring(0, 10);
    activeDaysSet.add(dayKey);
  }

  const learningScore = Math.min(100, Math.round(learningRaw));
  const creationScore = Math.min(100, Math.round(creationRaw));
  const collaborationScore = Math.min(100, Math.round(collaborationRaw));
  const socialScore = Math.min(100, Math.round(socialRaw));

  // Composite: weighted mix of the 4 dimensions
  const compositeScore = Math.min(
    100,
    Math.round(
      learningScore * 0.35 + creationScore * 0.3 + collaborationScore * 0.25 + socialScore * 0.1
    )
  );

  // Calculate active streak (consecutive calendar days ending at ref or ref - 1 day)
  let streak = 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  let checkDate = new Date(ref);

  // If today has no activity, start checking from yesterday
  const todayKey = checkDate.toISOString().substring(0, 10);
  if (!activeDaysSet.has(todayKey)) {
    checkDate = new Date(refTime - oneDayMs);
  }

  while (true) {
    const key = checkDate.toISOString().substring(0, 10);
    if (activeDaysSet.has(key)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - oneDayMs);
    } else {
      break;
    }
  }

  const engagementBand = determineEngagementBand(compositeScore);

  return {
    userId,
    compositeScore,
    engagementBand,
    learningScore,
    creationScore,
    collaborationScore,
    socialScore,
    activeStreakDays: streak,
    totalEventsCount: events.length,
    lastActiveAt: latestActiveTime > 0 ? new Date(latestActiveTime).toISOString() : null,
    updatedAt: nowIso,
  };
}

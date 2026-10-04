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
export declare function determineEngagementBand(score: number): EngagementBand;
export declare function recordActivityEvent(params: RecordActivityEventParams): ActivityEvent;
/**
 * Computes deterministic contribution and engagement scores across all activity categories (F-146, S-09).
 */
export declare function calculateContributionScores(userId: string, events: ActivityEvent[], referenceDate?: Date): ContributionScore;
//# sourceMappingURL=activity-contributions.d.ts.map
export type WarmIntroStatus = 'pending_introducer' | 'approved' | 'declined' | 'completed' | 'cancelled';
export interface WarmIntroPreferences {
    userId: string;
    optOutIntroducer: boolean;
    blockAllIncomingIntros: boolean;
    blockedUserIds: string[];
    updatedAt: string;
}
export interface WarmIntroRequest {
    id: string;
    requesterUserId: string;
    targetUserId: string;
    introducerUserId: string;
    purpose: string;
    note: string;
    status: WarmIntroStatus;
    declineReason?: string;
    threadId?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface IntroductionPath {
    targetUserId: string;
    introducerUserId: string;
    hops: number;
    pathScore: number;
    mutualConnectionCount: number;
}
export interface CreateWarmIntroRequestParams {
    id?: string;
    requesterUserId: string;
    targetUserId: string;
    introducerUserId: string;
    purpose: string;
    note: string;
}
/**
 * Discovers and ranks warm introduction paths up to max depth 4 (BR-210, BR-215, BR-216).
 */
export declare function discoverWarmIntroPaths(requesterId: string, targetId: string, connectionGraph: Map<string, Set<string>>, prefsByUserId: Map<string, WarmIntroPreferences>): IntroductionPath[];
/**
 * Creates a warm introduction request subject to weekly rate limits and consent rules (BR-209..BR-216).
 */
export declare function createWarmIntroRequest(params: CreateWarmIntroRequestParams, recentWeeklyRequestsCount: number, introducerPrefs?: WarmIntroPreferences, targetPrefs?: WarmIntroPreferences): WarmIntroRequest;
/**
 * Responds to an intro request with mandatory introducer consent (BR-209).
 */
export declare function respondToIntroRequest(request: WarmIntroRequest, actorUserId: string, decision: 'approve' | 'decline', reason?: string, currentTime?: Date): WarmIntroRequest;
//# sourceMappingURL=warm-introductions.d.ts.map
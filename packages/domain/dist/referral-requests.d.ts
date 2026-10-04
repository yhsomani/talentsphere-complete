export type ReferralRequestStatus = 'pending' | 'approved' | 'forwarded' | 'declined' | 'expired';
export type ReferralOutcomeStatus = 'referred' | 'interviewing' | 'hired' | 'rejected';
export interface ReferralRequest {
    id: string;
    candidateId: string;
    referrerId: string;
    jobId: string;
    orgId: string;
    pitch: string;
    resumeId?: string;
    status: ReferralRequestStatus;
    declineReason?: string;
    forwardedToUserId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ReferralOutcome {
    id: string;
    referralRequestId: string;
    candidateId: string;
    referrerId: string;
    jobId: string;
    orgId: string;
    status: ReferralOutcomeStatus;
    attributionExpiresAt: string;
    rewardXp: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateReferralRequestParams {
    id?: string;
    candidateId: string;
    referrerId: string;
    jobId: string;
    orgId: string;
    pitch: string;
    resumeId?: string;
}
export interface RespondReferralRequestResult {
    request: ReferralRequest;
    outcome?: ReferralOutcome;
}
/**
 * Creates a referral request under network limits and employment verification (BR-233, BR-237, BR-238).
 */
export declare function createReferralRequest(params: CreateReferralRequestParams, recentRequests30DaysCount: number, isReferrerEmployedAtOrg: boolean, isBlocked?: boolean): ReferralRequest;
/**
 * Responds to a referral request with mandatory referrer consent (BR-234, BR-236, BR-239, BR-240).
 */
export declare function respondToReferralRequest(request: ReferralRequest, actorUserId: string, action: 'refer' | 'forward' | 'decline', quarterlyReferralsCount: number, declineReason?: string, forwardedToUserId?: string, currentTime?: Date): RespondReferralRequestResult;
//# sourceMappingURL=referral-requests.d.ts.map
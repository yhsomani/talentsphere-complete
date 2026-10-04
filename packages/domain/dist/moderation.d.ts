export type ModerationTargetType = 'user' | 'job' | 'message' | 'evidence' | 'review' | 'portfolio_project';
export type ModerationReason = 'spam' | 'harassment' | 'fraud' | 'inappropriate' | 'intellectual_property' | 'security_violation' | 'other';
export type ModerationReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ModerationAction = 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned' | 'dismissed';
export type ModerationAppealStatus = 'pending' | 'under_review' | 'upheld' | 'denied';
export interface ModerationReport {
    id: string;
    reporterId: string;
    targetType: ModerationTargetType;
    targetId: string;
    reason: ModerationReason;
    details?: string;
    status: ModerationReportStatus;
    severity: ModerationSeverity;
    actionTaken: ModerationAction;
    resolvedBy?: string;
    resolvedAt?: string;
    resolutionNotes?: string;
    appealEligibleUntil?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ModerationAppeal {
    id: string;
    reportId: string;
    appellantId: string;
    reason: string;
    status: ModerationAppealStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    decisionNotes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ContentScanResult {
    isFlagged: boolean;
    score: number;
    matchedCategories: string[];
    suggestedAction: 'allow' | 'flag_for_review' | 'block';
    reason?: string;
}
/**
 * Scans user-generated content for abuse, scam, or security violations prior to publication (BR-125).
 */
export declare function scanContentForAbuse(text: string): ContentScanResult;
export interface CreateModerationReportParams {
    id?: string;
    reporterId: string;
    targetType: ModerationTargetType;
    targetId: string;
    reason: ModerationReason;
    details?: string;
    existingReports: ModerationReport[];
}
/**
 * Creates a new Trust & Safety report.
 * Enforces anti-self reporting and duplicate active report constraints.
 */
export declare function createModerationReport(params: CreateModerationReportParams): ModerationReport;
/**
 * Asserts that the actor holds moderator or platform_admin authority.
 */
export declare function assertModeratorAuthority(roles: string[]): void;
/**
 * Transitions a moderation report status following canonical lifecycle (BR-34):
 * pending -> under_review -> resolved / dismissed.
 */
export declare function transitionReportStatus(report: ModerationReport, nextStatus: ModerationReportStatus, actor: {
    userId: string;
    roles: string[];
}): ModerationReport;
export interface ResolveModerationReportParams {
    report: ModerationReport;
    action: ModerationAction;
    resolutionNotes: string;
    resolver: {
        userId: string;
        roles: string[];
    };
    secondApproverId?: string;
    secondApproverRoles?: string[];
}
/**
 * Resolves a moderation report with an enforcement action.
 * Enforces dual-human platform admin approval for permanent account bans (BR-068, WIT-008).
 * Opens a 14-day appeal window when enforcement actions are applied (WIT-013, BR-154).
 */
export declare function resolveModerationReport(params: ResolveModerationReportParams): ModerationReport;
/**
 * Submits an appeal against an adverse moderation action within the eligible appeal window (WIT-013, BR-154).
 */
export declare function createModerationAppeal(report: ModerationReport, appellantId: string, reason: string, existingAppeals?: ModerationAppeal[]): ModerationAppeal;
/**
 * Reviews and decides an appeal (upheld reverses the penalty; denied maintains it).
 */
export declare function reviewModerationAppeal(appeal: ModerationAppeal, decision: 'upheld' | 'denied', decisionNotes: string, reviewer: {
    userId: string;
    roles: string[];
}): ModerationAppeal;
//# sourceMappingURL=moderation.d.ts.map
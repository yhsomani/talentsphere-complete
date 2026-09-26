import { DomainError } from './core.js';

export type ModerationTargetType =
  'user' | 'job' | 'message' | 'evidence' | 'review' | 'portfolio_project';

export type ModerationReason =
  | 'spam'
  | 'harassment'
  | 'fraud'
  | 'inappropriate'
  | 'intellectual_property'
  | 'security_violation'
  | 'other';

export type ModerationReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ModerationAction =
  'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned' | 'dismissed';

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
  score: number; // 0.0 to 1.0 (abuse risk score)
  matchedCategories: string[];
  suggestedAction: 'allow' | 'flag_for_review' | 'block';
  reason?: string;
}

// Banned patterns for automated abuse screening (BR-125)
const ABUSIVE_PATTERNS = [
  {
    regex: /\b(crypto\s+investment|guaranteed\s+returns|send\s+eth|wire\s+funds)\b/i,
    category: 'financial_scam',
    severity: 'critical',
  },
  {
    regex: /\b(hacked|exploit|phishing|stolen\s+credentials|dumped\s+database)\b/i,
    category: 'security_violation',
    severity: 'critical',
  },
  {
    regex: /\b(viagra|cialis|free\s+money|click\s+here\s+now|earn\s+\$?\d{4,}\s+daily)\b/i,
    category: 'spam',
    severity: 'high',
  },
  {
    regex: /\b(idiot|moron|loser|kill\s+yourself|die\s+in\s+a\s+fire)\b/i,
    category: 'harassment',
    severity: 'high',
  },
];

/**
 * Scans user-generated content for abuse, scam, or security violations prior to publication (BR-125).
 */
export function scanContentForAbuse(text: string): ContentScanResult {
  if (!text || text.trim().length === 0) {
    return {
      isFlagged: false,
      score: 0.0,
      matchedCategories: [],
      suggestedAction: 'allow',
    };
  }

  const matchedCategories: string[] = [];
  let maxSeverityScore = 0.0;

  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.regex.test(text)) {
      matchedCategories.push(pattern.category);
      if (pattern.severity === 'critical') {
        maxSeverityScore = Math.max(maxSeverityScore, 0.95);
      } else if (pattern.severity === 'high') {
        maxSeverityScore = Math.max(maxSeverityScore, 0.75);
      } else {
        maxSeverityScore = Math.max(maxSeverityScore, 0.5);
      }
    }
  }

  if (maxSeverityScore >= 0.9) {
    return {
      isFlagged: true,
      score: maxSeverityScore,
      matchedCategories,
      suggestedAction: 'block',
      reason: `Content blocked due to high-risk detected patterns: ${matchedCategories.join(', ')}`,
    };
  }

  if (maxSeverityScore >= 0.5) {
    return {
      isFlagged: true,
      score: maxSeverityScore,
      matchedCategories,
      suggestedAction: 'flag_for_review',
      reason: `Content flagged for moderator review: ${matchedCategories.join(', ')}`,
    };
  }

  return {
    isFlagged: false,
    score: 0.0,
    matchedCategories: [],
    suggestedAction: 'allow',
  };
}

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
export function createModerationReport(params: CreateModerationReportParams): ModerationReport {
  // Anti-self reporting invariant: user cannot report themselves
  if (params.targetType === 'user' && params.reporterId === params.targetId) {
    throw new DomainError('VALIDATION_FAILED', 'You cannot report your own profile.');
  }

  // Prevent duplicate active reports for the same target by the same reporter
  const activeExisting = params.existingReports.find(
    (r) =>
      r.reporterId === params.reporterId &&
      r.targetType === params.targetType &&
      r.targetId === params.targetId &&
      (r.status === 'pending' || r.status === 'under_review')
  );

  if (activeExisting) {
    throw new DomainError(
      'CONFLICT',
      'You already have an active report under review for this entity.'
    );
  }

  // Determine initial severity based on reason
  let severity: ModerationSeverity = 'medium';
  if (params.reason === 'fraud' || params.reason === 'security_violation') {
    severity = 'high';
  } else if (params.reason === 'harassment') {
    severity = 'high';
  } else if (params.reason === 'spam') {
    severity = 'low';
  }

  const now = new Date().toISOString();
  return {
    id: params.id || crypto.randomUUID(),
    reporterId: params.reporterId,
    targetType: params.targetType,
    targetId: params.targetId,
    reason: params.reason,
    details: params.details?.trim(),
    status: 'pending',
    severity,
    actionTaken: 'none',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Asserts that the actor holds moderator or platform_admin authority.
 */
export function assertModeratorAuthority(roles: string[]): void {
  if (!roles.includes('moderator') && !roles.includes('platform_admin')) {
    throw new DomainError(
      'FORBIDDEN',
      'Access denied. Moderator or Platform Admin privileges required.'
    );
  }
}

/**
 * Transitions a moderation report status following canonical lifecycle (BR-34):
 * pending -> under_review -> resolved / dismissed.
 */
export function transitionReportStatus(
  report: ModerationReport,
  nextStatus: ModerationReportStatus,
  actor: { userId: string; roles: string[] }
): ModerationReport {
  assertModeratorAuthority(actor.roles);

  if (report.status === 'resolved' || report.status === 'dismissed') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Cannot transition report from terminal status "${report.status}".`
    );
  }

  if (report.status === 'pending' && nextStatus !== 'under_review' && nextStatus !== 'dismissed') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Report in "pending" status must move to "under_review" or "dismissed" before resolution.`
    );
  }

  const now = new Date().toISOString();
  return {
    ...report,
    status: nextStatus,
    updatedAt: now,
  };
}

export interface ResolveModerationReportParams {
  report: ModerationReport;
  action: ModerationAction;
  resolutionNotes: string;
  resolver: { userId: string; roles: string[] };
  secondApproverId?: string;
  secondApproverRoles?: string[];
}

/**
 * Resolves a moderation report with an enforcement action.
 * Enforces dual-human platform admin approval for permanent account bans (BR-068, WIT-008).
 * Opens a 14-day appeal window when enforcement actions are applied (WIT-013, BR-154).
 */
export function resolveModerationReport(params: ResolveModerationReportParams): ModerationReport {
  assertModeratorAuthority(params.resolver.roles);

  const { report, action, resolutionNotes, resolver, secondApproverId, secondApproverRoles } =
    params;

  if (report.status === 'resolved' || report.status === 'dismissed') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Report with ID "${report.id}" has already reached terminal status "${report.status}".`
    );
  }

  // Dual-human approval requirement for account termination / permanent bans (BR-068, WIT-008)
  if (action === 'user_banned') {
    if (!resolver.roles.includes('platform_admin')) {
      throw new DomainError(
        'FORBIDDEN',
        'Permanent account termination requires Platform Admin authority (BR-068).'
      );
    }
    if (!secondApproverId || !secondApproverRoles?.includes('platform_admin')) {
      throw new DomainError(
        'POLICY_VIOLATION',
        'Account termination requires dual Platform Admin approval to prevent unilateral lockout (BR-068, WIT-008).'
      );
    }
    if (secondApproverId === resolver.userId) {
      throw new DomainError(
        'POLICY_VIOLATION',
        'Dual approval requires two distinct Platform Admins; self-confirmation is prohibited.'
      );
    }
  }

  const now = new Date().toISOString();
  const terminalStatus: ModerationReportStatus =
    action === 'dismissed' || action === 'none' ? 'dismissed' : 'resolved';

  // Open 14-day appeal window if an enforcement action was taken
  let appealEligibleUntil: string | undefined;
  if (
    action === 'warning' ||
    action === 'content_removed' ||
    action === 'user_suspended' ||
    action === 'user_banned'
  ) {
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    appealEligibleUntil = new Date(Date.now() + fourteenDaysMs).toISOString();
  }

  return {
    ...report,
    status: terminalStatus,
    actionTaken: action,
    resolvedBy: resolver.userId,
    resolvedAt: now,
    resolutionNotes: resolutionNotes.trim(),
    appealEligibleUntil,
    updatedAt: now,
  };
}

/**
 * Submits an appeal against an adverse moderation action within the eligible appeal window (WIT-013, BR-154).
 */
export function createModerationAppeal(
  report: ModerationReport,
  appellantId: string,
  reason: string,
  existingAppeals: ModerationAppeal[] = []
): ModerationAppeal {
  if (
    report.status !== 'resolved' ||
    report.actionTaken === 'none' ||
    report.actionTaken === 'dismissed'
  ) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Appeals can only be submitted against active enforcement actions.'
    );
  }

  if (!report.appealEligibleUntil || new Date().toISOString() > report.appealEligibleUntil) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'The 14-day appeal window for this moderation action has expired (WIT-013).'
    );
  }

  const existing = existingAppeals.find(
    (a) => a.reportId === report.id && (a.status === 'pending' || a.status === 'under_review')
  );
  if (existing) {
    throw new DomainError(
      'CONFLICT',
      'An active appeal for this moderation report is already pending review.'
    );
  }

  if (!reason || reason.trim().length < 10) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Appeal reason must be at least 10 characters detailing justification.'
    );
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    reportId: report.id,
    appellantId,
    reason: reason.trim(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Reviews and decides an appeal (upheld reverses the penalty; denied maintains it).
 */
export function reviewModerationAppeal(
  appeal: ModerationAppeal,
  decision: 'upheld' | 'denied',
  decisionNotes: string,
  reviewer: { userId: string; roles: string[] }
): ModerationAppeal {
  assertModeratorAuthority(reviewer.roles);

  if (appeal.status === 'upheld' || appeal.status === 'denied') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      `Appeal has already reached terminal status "${appeal.status}".`
    );
  }

  const now = new Date().toISOString();
  return {
    ...appeal,
    status: decision,
    reviewedBy: reviewer.userId,
    reviewedAt: now,
    decisionNotes: decisionNotes.trim(),
    updatedAt: now,
  };
}

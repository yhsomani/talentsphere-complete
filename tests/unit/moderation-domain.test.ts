import { describe, it, expect } from 'vitest';
import {
  scanContentForAbuse,
  createModerationReport,
  assertModeratorAuthority,
  transitionReportStatus,
  resolveModerationReport,
  createModerationAppeal,
  reviewModerationAppeal,
  ModerationReport,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Trust, Safety & Moderation Domain Unit Tests (F-24, BR-34, BR-68, BR-125, BR-154, WIT-008, WIT-013)', () => {
  describe('scanContentForAbuse (BR-125 Pre-Publish Screening)', () => {
    it('allows clean and legitimate professional content', () => {
      const result = scanContentForAbuse(
        'Senior Full-Stack Engineer with 8 years of React and Node experience.'
      );
      expect(result.isFlagged).toBe(false);
      expect(result.suggestedAction).toBe('allow');
      expect(result.score).toBe(0.0);
      expect(result.matchedCategories).toHaveLength(0);
    });

    it('blocks high-risk financial scam content', () => {
      const result = scanContentForAbuse(
        'Join our telegram for guaranteed returns and send eth to our wallet!'
      );
      expect(result.isFlagged).toBe(true);
      expect(result.suggestedAction).toBe('block');
      expect(result.matchedCategories).toContain('financial_scam');
      expect(result.score).toBeGreaterThanOrEqual(0.9);
    });

    it('blocks security exploit and credential theft content', () => {
      const result = scanContentForAbuse(
        'Looking to buy stolen credentials and dumped database records.'
      );
      expect(result.isFlagged).toBe(true);
      expect(result.suggestedAction).toBe('block');
      expect(result.matchedCategories).toContain('security_violation');
      expect(result.score).toBeGreaterThanOrEqual(0.9);
    });

    it('flags spam for human review', () => {
      const result = scanContentForAbuse('Click here now to earn $5000 daily with zero effort.');
      expect(result.isFlagged).toBe(true);
      expect(result.suggestedAction).toBe('flag_for_review');
      expect(result.matchedCategories).toContain('spam');
    });

    it('flags abusive harassment language for moderator review', () => {
      const result = scanContentForAbuse('You are an absolute idiot and a complete loser.');
      expect(result.isFlagged).toBe(true);
      expect(result.suggestedAction).toBe('flag_for_review');
      expect(result.matchedCategories).toContain('harassment');
    });

    it('returns allow for empty or whitespace content', () => {
      const result = scanContentForAbuse('   ');
      expect(result.isFlagged).toBe(false);
      expect(result.suggestedAction).toBe('allow');
    });
  });

  describe('createModerationReport', () => {
    const reporterId = '11111111-1111-4000-a000-000000000001';
    const targetUserId = '22222222-2222-4000-a000-000000000002';

    it('creates a valid report with pending status and calibrated severity', () => {
      const report = createModerationReport({
        reporterId,
        targetType: 'job',
        targetId: 'job-999',
        reason: 'fraud',
        details: 'Demands upfront payment before interviewing.',
        existingReports: [],
      });

      expect(report.id).toBeDefined();
      expect(report.reporterId).toBe(reporterId);
      expect(report.targetType).toBe('job');
      expect(report.targetId).toBe('job-999');
      expect(report.status).toBe('pending');
      expect(report.severity).toBe('high');
      expect(report.actionTaken).toBe('none');
    });

    it('prohibits self-reporting (anti-self reporting invariant)', () => {
      expect(() => {
        createModerationReport({
          reporterId,
          targetType: 'user',
          targetId: reporterId, // Self-report
          reason: 'harassment',
          existingReports: [],
        });
      }).toThrowError('You cannot report your own profile.');
    });

    it('prevents duplicate active reports for the same target by the same reporter', () => {
      const existing: ModerationReport = {
        id: 'rep-1',
        reporterId,
        targetType: 'user',
        targetId: targetUserId,
        reason: 'harassment',
        status: 'under_review',
        severity: 'high',
        actionTaken: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => {
        createModerationReport({
          reporterId,
          targetType: 'user',
          targetId: targetUserId,
          reason: 'harassment',
          existingReports: [existing],
        });
      }).toThrowError('You already have an active report under review for this entity.');
    });
  });

  describe('assertModeratorAuthority', () => {
    it('accepts moderator and platform_admin roles', () => {
      expect(() => assertModeratorAuthority(['moderator'])).not.toThrow();
      expect(() => assertModeratorAuthority(['platform_admin'])).not.toThrow();
      expect(() => assertModeratorAuthority(['candidate', 'moderator'])).not.toThrow();
    });

    it('denies standard candidate and recruiter roles', () => {
      expect(() => assertModeratorAuthority(['candidate'])).toThrow(DomainError);
      expect(() => assertModeratorAuthority(['recruiter'])).toThrow(DomainError);
    });
  });

  describe('transitionReportStatus (BR-34 Canonical Lifecycle)', () => {
    const report: ModerationReport = {
      id: 'rep-lifecycle',
      reporterId: 'user-rep',
      targetType: 'message',
      targetId: 'msg-456',
      reason: 'spam',
      status: 'pending',
      severity: 'low',
      actionTaken: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('transitions pending report to under_review', () => {
      const updated = transitionReportStatus(report, 'under_review', {
        userId: 'mod-1',
        roles: ['moderator'],
      });
      expect(updated.status).toBe('under_review');
    });

    it('rejects transitioning directly from pending to resolved without review', () => {
      expect(() => {
        transitionReportStatus(report, 'resolved', {
          userId: 'mod-1',
          roles: ['moderator'],
        });
      }).toThrowError('must move to "under_review" or "dismissed" before resolution');
    });

    it('rejects state transition from terminal state', () => {
      const resolvedReport = { ...report, status: 'resolved' as const };
      expect(() => {
        transitionReportStatus(resolvedReport, 'under_review', {
          userId: 'mod-1',
          roles: ['moderator'],
        });
      }).toThrowError('Cannot transition report from terminal status');
    });
  });

  describe('resolveModerationReport (Dual-Admin Rule BR-068/WIT-008 & 14-day Appeal Window WIT-013)', () => {
    const report: ModerationReport = {
      id: 'rep-resolve',
      reporterId: 'user-rep',
      targetType: 'user',
      targetId: 'user-bad',
      reason: 'security_violation',
      status: 'under_review',
      severity: 'high',
      actionTaken: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('allows moderator to apply warning or suspension with single approval and sets 14-day appeal window', () => {
      const resolved = resolveModerationReport({
        report,
        action: 'user_suspended',
        resolutionNotes: 'Suspended for repeated phishing links.',
        resolver: { userId: 'mod-1', roles: ['moderator'] },
      });

      expect(resolved.status).toBe('resolved');
      expect(resolved.actionTaken).toBe('user_suspended');
      expect(resolved.resolvedBy).toBe('mod-1');
      expect(resolved.appealEligibleUntil).toBeDefined();

      const appealExpiry = new Date(resolved.appealEligibleUntil!).getTime();
      const expectedMin = Date.now() + 13 * 24 * 60 * 60 * 1000;
      expect(appealExpiry).toBeGreaterThan(expectedMin);
    });

    it('rejects permanent account ban when executed by moderator without platform_admin authority', () => {
      expect(() => {
        resolveModerationReport({
          report,
          action: 'user_banned',
          resolutionNotes: 'Banning account.',
          resolver: { userId: 'mod-1', roles: ['moderator'] },
        });
      }).toThrowError('Permanent account termination requires Platform Admin authority (BR-068).');
    });

    it('rejects permanent account ban without second platform admin approver (WIT-008, BR-068)', () => {
      expect(() => {
        resolveModerationReport({
          report,
          action: 'user_banned',
          resolutionNotes: 'Unilateral ban attempt.',
          resolver: { userId: 'admin-1', roles: ['platform_admin'] },
        });
      }).toThrowError('Account termination requires dual Platform Admin approval');
    });

    it('rejects self-approval for permanent ban', () => {
      expect(() => {
        resolveModerationReport({
          report,
          action: 'user_banned',
          resolutionNotes: 'Self-confirm ban attempt.',
          resolver: { userId: 'admin-1', roles: ['platform_admin'] },
          secondApproverId: 'admin-1',
          secondApproverRoles: ['platform_admin'],
        });
      }).toThrowError('Dual approval requires two distinct Platform Admins');
    });

    it('successfully bans account when dual distinct platform admins approve', () => {
      const resolved = resolveModerationReport({
        report,
        action: 'user_banned',
        resolutionNotes: 'Confirmed coordinated credential harvesting scheme.',
        resolver: { userId: 'admin-1', roles: ['platform_admin'] },
        secondApproverId: 'admin-2',
        secondApproverRoles: ['platform_admin'],
      });

      expect(resolved.status).toBe('resolved');
      expect(resolved.actionTaken).toBe('user_banned');
      expect(resolved.appealEligibleUntil).toBeDefined();
    });
  });

  describe('createModerationAppeal & reviewModerationAppeal (WIT-013, BR-154)', () => {
    const resolvedReport: ModerationReport = {
      id: 'rep-appealed',
      reporterId: 'user-rep',
      targetType: 'user',
      targetId: 'user-penalized',
      reason: 'harassment',
      status: 'resolved',
      severity: 'high',
      actionTaken: 'user_suspended',
      appealEligibleUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('creates an appeal within eligible appeal window with valid justification', () => {
      const appeal = createModerationAppeal(
        resolvedReport,
        'user-penalized',
        'My account was compromised at that time and I have since secured it.',
        []
      );

      expect(appeal.id).toBeDefined();
      expect(appeal.reportId).toBe(resolvedReport.id);
      expect(appeal.status).toBe('pending');
      expect(appeal.appellantId).toBe('user-penalized');
    });

    it('rejects appeal when justification is too short (< 10 chars)', () => {
      expect(() => {
        createModerationAppeal(resolvedReport, 'user-penalized', 'Too short', []);
      }).toThrowError('Appeal reason must be at least 10 characters');
    });

    it('rejects appeal after 14-day window expires', () => {
      const expiredReport = {
        ...resolvedReport,
        appealEligibleUntil: new Date(Date.now() - 1000).toISOString(),
      };

      expect(() => {
        createModerationAppeal(
          expiredReport,
          'user-penalized',
          'I would like to appeal this suspension now.',
          []
        );
      }).toThrowError('The 14-day appeal window for this moderation action has expired (WIT-013).');
    });

    it('moderator reviews and upholds appeal to reverse penalty', () => {
      const appeal = createModerationAppeal(
        resolvedReport,
        'user-penalized',
        'Account was verified compromised; credentials reset.',
        []
      );

      const reviewed = reviewModerationAppeal(
        appeal,
        'upheld',
        'Confirmed credential intrusion from distinct IP. Reversing suspension.',
        { userId: 'mod-1', roles: ['moderator'] }
      );

      expect(reviewed.status).toBe('upheld');
      expect(reviewed.reviewedBy).toBe('mod-1');
      expect(reviewed.decisionNotes).toContain('Reversing suspension');
    });
  });
});

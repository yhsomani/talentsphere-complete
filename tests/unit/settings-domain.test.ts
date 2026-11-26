import { describe, it, expect } from 'vitest';
import {
  createDefaultUserSettings,
  updateUserSettings,
  requestAccountErasure,
  cancelAccountErasure,
  executeLogicalAnonymization,
  compileDataExportArchive,
  withProfileVisibility,
  GDPR_GRACE_PERIOD_DAYS,
  erasureCompleteBy,
} from '../../packages/domain/src/index.js';
import type { User, Profile } from '../../packages/domain/src/index.js';

describe('Account Settings, Privacy & GDPR Erasure Domain (F-15, §31, BR-06)', () => {
  const userId = '00000000-0000-0000-0000-000000000001';

  const mockUser: User = {
    id: userId,
    email: 'alex.chen@example.com',
    roles: ['candidate'],
    status: 'active',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  };

  const mockProfile: Profile = {
    id: '00000000-0000-0000-0000-000000000002',
    userId,
    fullName: 'Alex Chen',
    headline: 'Senior Full Stack Engineer',
    bio: 'Passionate about distributed systems',
    location: 'San Francisco, CA',
    avatarUrl: 'https://example.com/avatar.jpg',
    privacy: 'public',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  };

  describe('createDefaultUserSettings', () => {
    it('initializes safe default settings with privacy-by-design baseline', () => {
      const settings = createDefaultUserSettings(userId);

      expect(settings.userId).toBe(userId);
      expect(settings.theme).toBe('system');
      expect(settings.language).toBe('en');
      expect(settings.timezone).toBe('UTC');
      expect(settings.profileVisibility).toBe('public');
      expect(settings.showEmail).toBe(false);
      expect(settings.showActivity).toBe(true);
      expect(settings.allowConnectionRequests).toBe(true);
      expect(settings.allowDirectMessages).toBe('everyone');
      expect(settings.searchEngineIndexing).toBe(false);
      expect(settings.emailNotifications).toBe(true);
      expect(settings.pushNotifications).toBe(true);
      expect(settings.marketingEmails).toBe(false);
      expect(settings.digestFrequency).toBe('daily');
      expect(settings.twoFactorEnabled).toBe(false);
      expect(settings.byoAiKey).toBeNull();
      expect(settings.aiDataUsageConsent).toBe(false);
    });
  });

  describe('updateUserSettings', () => {
    it('applies valid setting updates and bumps updatedAt', () => {
      const initial = createDefaultUserSettings(userId);
      const updated = updateUserSettings(initial, {
        theme: 'dark',
        showEmail: true,
        digestFrequency: 'weekly',
        byoAiKey: 'sk-test-key-12345',
      });

      expect(updated.theme).toBe('dark');
      expect(updated.showEmail).toBe(true);
      expect(updated.digestFrequency).toBe('weekly');
      expect(updated.byoAiKey).toBe('sk-test-key-12345');
      expect(updated.language).toBe('en'); // Unchanged
    });

    it('rejects invalid theme options', () => {
      const initial = createDefaultUserSettings(userId);
      expect(() => {
        // @ts-expect-error testing invalid enum
        updateUserSettings(initial, { theme: 'neon' });
      }).toThrowError(/Invalid theme/);
    });

    it('rejects invalid profile visibility options', () => {
      const initial = createDefaultUserSettings(userId);
      expect(() => {
        // @ts-expect-error testing invalid enum
        updateUserSettings(initial, { profileVisibility: 'hidden_secret' });
      }).toThrowError(/Invalid profile visibility/);
    });

    it('rejects invalid direct message options', () => {
      const initial = createDefaultUserSettings(userId);
      expect(() => {
        // @ts-expect-error testing invalid enum
        updateUserSettings(initial, { allowDirectMessages: 'friends_only' });
      }).toThrowError(/Invalid direct message/);
    });

    it('rejects invalid digest frequency options', () => {
      const initial = createDefaultUserSettings(userId);
      expect(() => {
        // @ts-expect-error testing invalid enum
        updateUserSettings(initial, { digestFrequency: 'monthly' });
      }).toThrowError(/Invalid digest frequency/);
    });
  });

  describe('requestAccountErasure & cancelAccountErasure (GDPR Art 17)', () => {
    it('initiates erasure with a 14-day cancel window and a 30-day completion deadline (ADR-024)', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const request = requestAccountErasure(userId, 'Leaving the industry', nowIso);

      expect(request.userId).toBe(userId);
      expect(request.status).toBe('grace_period');
      expect(request.reason).toBe('Leaving the industry');

      expect(GDPR_GRACE_PERIOD_DAYS).toBe(14);
      expect(request.gracePeriodEndsAt).toBe('2026-10-08T12:00:00.000Z');
      // Both clocks start at the request (SSOT DOR-017).
      expect(erasureCompleteBy(request)).toBe('2026-10-24T12:00:00.000Z');
    });

    it('cancels erasure request if still within the 14-day cancel window', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const request = requestAccountErasure(userId, 'Changed my mind soon', nowIso);

      // Attempt cancellation 5 days later
      const cancelDateIso = '2026-09-29T12:00:00.000Z';
      const cancelled = cancelAccountErasure(request, cancelDateIso);

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancelledAt).toBe(cancelDateIso);
    });

    it('prohibits cancellation once the 14-day cancel window expires', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const request = requestAccountErasure(userId, 'Permanent departure', nowIso);

      // Attempt cancellation 15 days later
      const tooLateDateIso = '2026-10-09T12:00:00.000Z';
      expect(() => {
        cancelAccountErasure(request, tooLateDateIso);
      }).toThrowError(/Grace period has expired/);
    });

    it('prohibits cancellation of already completed or already cancelled requests', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const request = requestAccountErasure(userId, 'Testing', nowIso);
      const cancelled = cancelAccountErasure(request, nowIso);

      expect(() => {
        cancelAccountErasure(cancelled, nowIso);
      }).toThrowError(/Erasure request is already cancelled/);

      const completed = { ...request, status: 'completed' as const };
      expect(() => {
        cancelAccountErasure(completed, nowIso);
      }).toThrowError(/already been completed/);
    });
  });

  describe('executeLogicalAnonymization (§31.4 FERPA/GDPR Severance Pattern)', () => {
    it('anonymizes user and profile data while preserving auditability and relations', () => {
      const nowIso = '2026-09-24T12:00:00.000Z';
      const result = executeLogicalAnonymization(mockUser, mockProfile, nowIso);

      expect(result.anonymizedUser.id).toBe(mockUser.id);
      expect(result.anonymizedUser.email).toMatch(/^anonymized_[a-f0-9]{12}@talentsphere\.local$/);
      expect(result.anonymizedUser.status).toBe('deactivated');

      expect(result.anonymizedProfile.id).toBe(mockProfile.id);
      expect(result.anonymizedProfile.fullName).toBe('Anonymized User');
      expect(result.anonymizedProfile.headline).toBeUndefined();
      expect(result.anonymizedProfile.bio).toBeUndefined();
      expect(result.anonymizedProfile.location).toBeUndefined();
      expect(result.anonymizedProfile.avatarUrl).toBeUndefined();
      expect(result.anonymizedProfile.privacy).toBe('private');

      expect(result.anonymizedHash).toBeDefined();
      expect(result.anonymizedHash.length).toBe(64); // SHA-256 hex string
      expect(result.completedAt).toBe(nowIso);
    });
  });

  describe('compileDataExportArchive (GDPR Art 15 & 20 Data Portability)', () => {
    it('compiles full user data archive while stripping sensitive BYO keys', () => {
      const settings = createDefaultUserSettings(userId);
      settings.byoAiKey = 'sk-sensitive-api-key-never-export';

      const exportBundle = compileDataExportArchive({
        user: mockUser,
        profile: mockProfile,
        settings,
        evidence: [{ id: 'ev-1', skill: 'TypeScript', score: 95 }],
        applications: [{ id: 'app-1', jobId: 'job-123', status: 'submitted' }],
        resumes: [{ id: 'res-1', title: 'Tech Resume' }],
        portfolio: [{ id: 'proj-1', title: 'Open Source Compiler' }],
        gamification: { totalXp: 350, currentLevel: 3 },
      });

      expect(exportBundle.exportMetadata.subjectId).toBe(userId);
      expect(exportBundle.exportMetadata.compliance).toEqual([]);
      expect(exportBundle.account.email).toBe(mockUser.email);
      expect(exportBundle.profile.fullName).toBe('Alex Chen');
      expect(exportBundle.settings.byoAiKey).toBeUndefined(); // Scrubbed
      expect(exportBundle.evidence).toHaveLength(1);
      expect(exportBundle.applications).toHaveLength(1);
      expect(exportBundle.resumes).toHaveLength(1);
      expect(exportBundle.portfolio).toHaveLength(1);
      expect(exportBundle.gamification?.totalXp).toBe(350);
    });
  });
});

describe('cancelAccountErasure once execution has started', () => {
  it('refuses to cancel a request that is processing', async () => {
    const { cancelAccountErasure } = await import('../../packages/domain/src/index.js');
    const now = new Date().toISOString();
    expect(() =>
      cancelAccountErasure({
        id: 'r1',
        userId: 'u1',
        status: 'processing',
        gracePeriodEndsAt: new Date(Date.now() + 86_400_000).toISOString(),
        createdAt: now,
        updatedAt: now,
      })
    ).toThrow(/cannot be cancelled/);
  });
});

describe('withProfileVisibility (C-25)', () => {
  const settings = createDefaultUserSettings('00000000-0000-0000-0000-0000000000c5');
  it("reports the profile's privacy as the settings visibility", () => {
    expect(withProfileVisibility(settings, { privacy: 'private' }).profileVisibility).toBe(
      'private'
    );
    expect(settings.profileVisibility).toBe('public'); // input not mutated
  });
  it('falls back to the stored value when there is no profile', () => {
    expect(withProfileVisibility(settings, undefined).profileVisibility).toBe('public');
  });
});

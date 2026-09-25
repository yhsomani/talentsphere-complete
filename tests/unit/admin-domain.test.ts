import { describe, it, expect } from 'vitest';
import {
  assertPlatformAdmin,
  computeSystemHealth,
  validateUserStatusTransition,
  updateFeatureFlagState,
  createAdminAuditLog,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Platform Administration & Governance Domain (F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068)', () => {
  const adminId = '00000000-0000-0000-0000-000000000001';
  const targetUserId = '00000000-0000-0000-0000-000000000002';

  describe('assertPlatformAdmin (BR-06)', () => {
    it('allows access when user possesses platform_admin role', () => {
      expect(() => assertPlatformAdmin(['platform_admin'])).not.toThrow();
      expect(() => assertPlatformAdmin(['candidate', 'platform_admin'])).not.toThrow();
    });

    it('allows access when user possesses admin role', () => {
      expect(() => assertPlatformAdmin(['admin'])).not.toThrow();
    });

    it('rejects candidate, recruiter, or missing roles with FORBIDDEN', () => {
      expect(() => assertPlatformAdmin(['candidate'])).toThrow(DomainError);
      try {
        assertPlatformAdmin(['candidate', 'recruiter']);
      } catch (err: any) {
        expect(err.code).toBe('FORBIDDEN');
        expect(err.message).toContain('BR-06');
      }

      expect(() => assertPlatformAdmin([])).toThrow(DomainError);
    });
  });

  describe('computeSystemHealth (BR-28)', () => {
    it('returns maintenance state when maintenance mode is active', () => {
      const health = computeSystemHealth({
        dbConnected: true,
        queueOperational: true,
        inMaintenance: true,
      });
      expect(health).toBe('maintenance');
    });

    it('returns degraded state when db is disconnected', () => {
      const health = computeSystemHealth({
        dbConnected: false,
        queueOperational: true,
        inMaintenance: false,
      });
      expect(health).toBe('degraded');
    });

    it('returns degraded state when queue is not operational', () => {
      const health = computeSystemHealth({
        dbConnected: true,
        queueOperational: false,
        inMaintenance: false,
      });
      expect(health).toBe('degraded');
    });

    it('returns healthy state when all systems are operational and not in maintenance', () => {
      const health = computeSystemHealth({
        dbConnected: true,
        queueOperational: true,
        inMaintenance: false,
      });
      expect(health).toBe('healthy');
    });
  });

  describe('validateUserStatusTransition (BR-29, BR-068)', () => {
    it('permits status changes to active, suspended, or deactivated for different users', () => {
      expect(() =>
        validateUserStatusTransition('active', 'suspended', adminId, targetUserId)
      ).not.toThrow();

      expect(() =>
        validateUserStatusTransition('suspended', 'active', adminId, targetUserId)
      ).not.toThrow();

      expect(() =>
        validateUserStatusTransition('active', 'deactivated', adminId, targetUserId)
      ).not.toThrow();
    });

    it('rejects invalid user status strings with VALIDATION_FAILED', () => {
      expect(() =>
        validateUserStatusTransition('active', 'invalid_status' as any, adminId, targetUserId)
      ).toThrow(DomainError);

      try {
        validateUserStatusTransition('active', 'bogus' as any, adminId, targetUserId);
      } catch (err: any) {
        expect(err.code).toBe('VALIDATION_FAILED');
      }
    });

    it('blocks self-suspension and self-deactivation to prevent governance lockout (BR-29, BR-068)', () => {
      try {
        validateUserStatusTransition('active', 'suspended', adminId, adminId);
        expect.unreachable('Should have thrown POLICY_VIOLATION');
      } catch (err: any) {
        expect(err.code).toBe('POLICY_VIOLATION');
        expect(err.message).toContain('lockout');
      }

      try {
        validateUserStatusTransition('active', 'deactivated', adminId, adminId);
        expect.unreachable('Should have thrown POLICY_VIOLATION');
      } catch (err: any) {
        expect(err.code).toBe('POLICY_VIOLATION');
        expect(err.message).toContain('lockout');
      }
    });

    it('allows self status confirmation/activation', () => {
      expect(() =>
        validateUserStatusTransition('active', 'active', adminId, adminId)
      ).not.toThrow();
    });
  });

  describe('updateFeatureFlagState (F-35)', () => {
    it('updates flag enabled state, description and timestamp', () => {
      const initial = {
        key: 'ai_copilot_v2',
        enabled: false,
        description: 'V2 Copilot Beta',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };

      const updated = updateFeatureFlagState(
        initial,
        true,
        'Updated Copilot Beta',
        '2026-09-24T12:00:00.000Z'
      );
      expect(updated.enabled).toBe(true);
      expect(updated.description).toBe('Updated Copilot Beta');
      expect(updated.updatedAt).toBe('2026-09-24T12:00:00.000Z');
    });

    it('preserves existing description when description is not provided in update', () => {
      const initial = {
        key: 'dark_mode',
        enabled: true,
        description: 'Dark mode theme toggle',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };

      const updated = updateFeatureFlagState(initial, false);
      expect(updated.enabled).toBe(false);
      expect(updated.description).toBe('Dark mode theme toggle');
    });
  });

  describe('createAdminAuditLog (BR-067)', () => {
    it('creates immutable admin audit log entry with actorId and eventName', () => {
      const log = createAdminAuditLog({
        eventName: 'USER_SUSPENDED',
        actorId: adminId,
        targetId: targetUserId,
        targetType: 'user',
        metadata: { reason: 'Terms of service violation', severity: 'high' },
        nowIso: '2026-09-24T15:00:00.000Z',
      });

      expect(log.id).toBeDefined();
      expect(log.eventName).toBe('USER_SUSPENDED');
      expect(log.actorId).toBe(adminId);
      expect(log.targetId).toBe(targetUserId);
      expect(log.targetType).toBe('user');
      expect(log.metadata.reason).toBe('Terms of service violation');
      expect(log.createdAt).toBe('2026-09-24T15:00:00.000Z');
    });
  });
});

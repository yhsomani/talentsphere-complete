/**
 * TalentSphere Platform Administration & Governance Domain
 * Features: F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068
 */

import { DomainError } from './core.js';
import crypto from 'node:crypto';

export type AdminUserStatus = 'active' | 'suspended' | 'deactivated';
export type SystemHealthStatus = 'healthy' | 'degraded' | 'maintenance' | 'not_configured';

export interface AdminAuditLog {
  id: string;
  eventName: string;
  actorId: string;
  targetId?: string;
  targetType?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemDiagnostics {
  status: SystemHealthStatus;
  database: 'connected' | 'disconnected';
  queue: 'operational' | 'paused' | 'degraded';
  inMaintenance: boolean;
  uptimeSeconds: number;
  registeredUsersCount: number;
  activeJobsCount: number;
  evaluatedAt: string;
}

/**
 * BR-06: Asserts that caller holds platform_admin credentials.
 */
export function assertPlatformAdmin(roles: string[]): void {
  if (!roles.includes('platform_admin') && !roles.includes('admin')) {
    throw new DomainError(
      'FORBIDDEN',
      'Access denied. Platform Admin privileges required (BR-06).'
    );
  }
}

/**
 * BR-28: Computes system health status distinguishing live, degraded, and maintenance states.
 */
export function computeSystemHealth(params: {
  dbConnected: boolean;
  queueOperational: boolean;
  inMaintenance: boolean;
}): SystemHealthStatus {
  if (params.inMaintenance) {
    return 'maintenance';
  }
  if (!params.dbConnected || !params.queueOperational) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * BR-29 & BR-068: Validates user status modifications.
 * Prevents self-suspension/self-deactivation to avoid administrative lockout.
 */
export function validateUserStatusTransition(
  _currentStatus: string,
  newStatus: AdminUserStatus,
  actorId: string,
  targetUserId: string
): void {
  if (!['active', 'suspended', 'deactivated'].includes(newStatus)) {
    throw new DomainError('VALIDATION_FAILED', `Invalid user status: ${newStatus}`);
  }

  if (actorId === targetUserId && (newStatus === 'suspended' || newStatus === 'deactivated')) {
    throw new DomainError(
      'POLICY_VIOLATION',
      'Administrators cannot suspend or deactivate their own account to prevent governance lockout.'
    );
  }
}

/**
 * Updates a feature flag state with updated audit timestamp.
 */
export function updateFeatureFlagState(
  current: FeatureFlag,
  enabled: boolean,
  description?: string,
  nowIso: string = new Date().toISOString()
): FeatureFlag {
  return {
    ...current,
    enabled,
    description: description !== undefined ? description : current.description,
    updatedAt: nowIso,
  };
}

/**
 * Features parked by the product transformation plan (decision TPD-04 in
 * docs/product/TRANSFORMATION_PLAN.md §4.3). Their code and tests stay; their
 * routes answer 404 wherever the feature is off.
 */
export const PARKED_FEATURES = {
  FEATURE_BEHAVIORAL_SCORING:
    'Candidate-level behavioral scoring, talent segmentation and career transition probability (SSOT Amendment E)',
  FEATURE_REPUTATION: 'Reputation engine and activity contribution scores',
  FEATURE_GAMIFICATION: 'XP ledger, badges and leaderboard',
  FEATURE_MARKET_INSIGHTS:
    'Salary benchmarks, skill forecasts and learning impact computed from in-memory data',
} as const;

export type ParkedFeatureKey = keyof typeof PARKED_FEATURES;

/**
 * A parked feature is on only where someone chose it: a stored flag decides.
 * With no stored flag it is off in deployed environments (staging, production)
 * and on in development and tests, so its existing tests keep running.
 */
export function isParkedFeatureEnabled(
  stored: Pick<FeatureFlag, 'enabled'> | undefined,
  deployed: boolean
): boolean {
  return stored ? stored.enabled : !deployed;
}

/**
 * BR-067: Creates an immutable administrative audit log record.
 */
export function createAdminAuditLog(params: {
  eventName: string;
  actorId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  nowIso?: string;
}): AdminAuditLog {
  const now = params.nowIso || new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    eventName: params.eventName,
    actorId: params.actorId,
    targetId: params.targetId,
    targetType: params.targetType,
    metadata: params.metadata || {},
    createdAt: now,
  };
}

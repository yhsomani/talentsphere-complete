/**
 * TalentSphere Platform Administration & Governance Domain
 * Features: F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068
 */

import { DomainError } from './index.js';
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

export interface PlatformConfig {
  key: string;
  value: Record<string, unknown>;
  description?: string;
  updatedBy?: string;
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
    throw new DomainError('FORBIDDEN', 'Access denied. Platform Admin privileges required (BR-06).');
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
  currentStatus: string,
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

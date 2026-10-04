/**
 * TalentSphere Platform Administration & Governance Domain
 * Features: F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068
 */
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
export declare function assertPlatformAdmin(roles: string[]): void;
/**
 * BR-28: Computes system health status distinguishing live, degraded, and maintenance states.
 */
export declare function computeSystemHealth(params: {
    dbConnected: boolean;
    queueOperational: boolean;
    inMaintenance: boolean;
}): SystemHealthStatus;
/**
 * BR-29 & BR-068: Validates user status modifications.
 * Prevents self-suspension/self-deactivation to avoid administrative lockout.
 */
export declare function validateUserStatusTransition(_currentStatus: string, newStatus: AdminUserStatus, actorId: string, targetUserId: string): void;
/**
 * Updates a feature flag state with updated audit timestamp.
 */
export declare function updateFeatureFlagState(current: FeatureFlag, enabled: boolean, description?: string, nowIso?: string): FeatureFlag;
/**
 * BR-067: Creates an immutable administrative audit log record.
 */
export declare function createAdminAuditLog(params: {
    eventName: string;
    actorId: string;
    targetId?: string;
    targetType?: string;
    metadata?: Record<string, unknown>;
    nowIso?: string;
}): AdminAuditLog;
//# sourceMappingURL=admin.d.ts.map
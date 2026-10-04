/**
 * Account Settings, Privacy Controls & GDPR/DPDP Erasure Domain
 * Features: F-15, §31 Privacy & Compliance, BR-06, BR-242
 */
import { type User, type Profile } from './core.js';
export type ThemePreference = 'light' | 'dark' | 'system';
export type ProfileVisibility = 'public' | 'connections_only' | 'recruiters_only' | 'private';
export type DirectMessagePreference = 'everyone' | 'connections_only' | 'none';
export type DigestFrequency = 'realtime' | 'daily' | 'weekly' | 'none';
export interface UserSettings {
    userId: string;
    theme: ThemePreference;
    language: string;
    timezone: string;
    profileVisibility: ProfileVisibility;
    showEmail: boolean;
    showActivity: boolean;
    allowConnectionRequests: boolean;
    allowDirectMessages: DirectMessagePreference;
    searchEngineIndexing: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    digestFrequency: DigestFrequency;
    twoFactorEnabled: boolean;
    byoAiKey?: string | null;
    aiDataUsageConsent: boolean;
    createdAt: string;
    updatedAt: string;
}
export type ErasureRequestStatus = 'pending' | 'grace_period' | 'processing' | 'completed' | 'cancelled';
export interface DataErasureRequest {
    id: string;
    userId: string;
    status: ErasureRequestStatus;
    reason?: string;
    gracePeriodEndsAt: string;
    confirmedAt?: string;
    cancelledAt?: string;
    completedAt?: string;
    anonymizedHash?: string;
    createdAt: string;
    updatedAt: string;
}
export type ExportFormat = 'json' | 'csv';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export interface DataExportRequest {
    id: string;
    userId: string;
    status: ExportStatus;
    format: ExportFormat;
    downloadUrl?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface DataExportPayload {
    exportMetadata: {
        version: string;
        exportedAt: string;
        subjectId: string;
        compliance: string[];
    };
    account: {
        id: string;
        email: string;
        roles: string[];
        status: string;
        createdAt: string;
    };
    profile: Partial<Profile>;
    settings: Partial<UserSettings>;
    evidence: Array<Record<string, unknown>>;
    applications: Array<Record<string, unknown>>;
    resumes: Array<Record<string, unknown>>;
    portfolio: Array<Record<string, unknown>>;
    gamification?: Record<string, unknown>;
}
export declare const GDPR_GRACE_PERIOD_DAYS = 30;
/**
 * Initializes default user settings with privacy-by-design baseline.
 */
export declare function createDefaultUserSettings(userId: string): UserSettings;
/**
 * Validates and updates user settings.
 */
export declare function updateUserSettings(current: UserSettings, updates: Partial<UserSettings>): UserSettings;
/**
 * Initiates an account erasure request with mandatory 30-day grace period (GDPR Art 17).
 */
export declare function requestAccountErasure(userId: string, reason?: string, nowIso?: string): DataErasureRequest;
/**
 * Cancels a pending account erasure request if still within the 30-day grace period.
 */
export declare function cancelAccountErasure(request: DataErasureRequest, nowIso?: string): DataErasureRequest;
export interface LogicalAnonymizationResult {
    anonymizedUser: User;
    anonymizedProfile: Profile;
    anonymizedHash: string;
    completedAt: string;
}
/**
 * Executes §31.4 Logical Anonymization & Severance Pattern:
 * 1. Rewrites user email and name to non-identifying cryptographic placeholders.
 * 2. Clears biography, headline, avatar, and personal traits.
 * 3. Preserves immutable relational links for certificates, badges, and verified records.
 * 4. Never hard-deletes rows referenced by ledger aggregates.
 */
export declare function executeLogicalAnonymization(user: User, profile: Profile, nowIso?: string): LogicalAnonymizationResult;
/**
 * Compiles a GDPR Article 15 & 20 compliant Data Portability archive in structured JSON format.
 * Strips sensitive keys and credentials while preserving full subject portability.
 */
export declare function compileDataExportArchive(params: {
    user: User;
    profile: Profile;
    settings: UserSettings;
    evidence?: Array<Record<string, unknown>>;
    applications?: Array<Record<string, unknown>>;
    resumes?: Array<Record<string, unknown>>;
    portfolio?: Array<Record<string, unknown>>;
    gamification?: Record<string, unknown>;
    nowIso?: string;
}): DataExportPayload;
//# sourceMappingURL=settings.d.ts.map
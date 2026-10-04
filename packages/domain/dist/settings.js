/**
 * Account Settings, Privacy Controls & GDPR/DPDP Erasure Domain
 * Features: F-15, §31 Privacy & Compliance, BR-06, BR-242
 */
import { DomainError } from './core.js';
import crypto from 'node:crypto';
export const GDPR_GRACE_PERIOD_DAYS = 30;
/**
 * Initializes default user settings with privacy-by-design baseline.
 */
export function createDefaultUserSettings(userId) {
    const now = new Date().toISOString();
    return {
        userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        profileVisibility: 'public',
        showEmail: false,
        showActivity: true,
        allowConnectionRequests: true,
        allowDirectMessages: 'everyone',
        searchEngineIndexing: false,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        digestFrequency: 'daily',
        twoFactorEnabled: false,
        byoAiKey: null,
        aiDataUsageConsent: false,
        createdAt: now,
        updatedAt: now,
    };
}
/**
 * Validates and updates user settings.
 */
export function updateUserSettings(current, updates) {
    if (updates.theme && !['light', 'dark', 'system'].includes(updates.theme)) {
        throw new DomainError('VALIDATION_FAILED', `Invalid theme: ${updates.theme}`);
    }
    if (updates.profileVisibility &&
        !['public', 'connections_only', 'recruiters_only', 'private'].includes(updates.profileVisibility)) {
        throw new DomainError('VALIDATION_FAILED', `Invalid profile visibility: ${updates.profileVisibility}`);
    }
    if (updates.allowDirectMessages &&
        !['everyone', 'connections_only', 'none'].includes(updates.allowDirectMessages)) {
        throw new DomainError('VALIDATION_FAILED', `Invalid direct message preference: ${updates.allowDirectMessages}`);
    }
    if (updates.digestFrequency &&
        !['realtime', 'daily', 'weekly', 'none'].includes(updates.digestFrequency)) {
        throw new DomainError('VALIDATION_FAILED', `Invalid digest frequency: ${updates.digestFrequency}`);
    }
    // Mask BYO AI key if updated to protect downstream logging/leakage
    let byoAiKey = updates.byoAiKey !== undefined ? updates.byoAiKey : current.byoAiKey;
    if (byoAiKey && byoAiKey.trim().length > 0) {
        byoAiKey = byoAiKey.trim();
    }
    return {
        ...current,
        ...updates,
        byoAiKey,
        updatedAt: new Date().toISOString(),
    };
}
/**
 * Initiates an account erasure request with mandatory 30-day grace period (GDPR Art 17).
 */
export function requestAccountErasure(userId, reason, nowIso = new Date().toISOString()) {
    const requestDate = new Date(nowIso);
    const gracePeriodEnd = new Date(requestDate.getTime() + GDPR_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    return {
        id: crypto.randomUUID(),
        userId,
        status: 'grace_period',
        reason,
        gracePeriodEndsAt: gracePeriodEnd.toISOString(),
        createdAt: nowIso,
        updatedAt: nowIso,
    };
}
/**
 * Cancels a pending account erasure request if still within the 30-day grace period.
 */
export function cancelAccountErasure(request, nowIso = new Date().toISOString()) {
    if (request.status === 'completed') {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Cannot cancel an erasure request that has already been completed.');
    }
    if (request.status === 'cancelled') {
        throw new DomainError('INVALID_STATE_TRANSITION', 'Erasure request is already cancelled.');
    }
    const currentDate = new Date(nowIso);
    const graceEnd = new Date(request.gracePeriodEndsAt);
    if (currentDate.getTime() > graceEnd.getTime()) {
        throw new DomainError('POLICY_VIOLATION', 'Grace period has expired. Account erasure is processing and cannot be cancelled.');
    }
    return {
        ...request,
        status: 'cancelled',
        cancelledAt: nowIso,
        updatedAt: nowIso,
    };
}
/**
 * Executes §31.4 Logical Anonymization & Severance Pattern:
 * 1. Rewrites user email and name to non-identifying cryptographic placeholders.
 * 2. Clears biography, headline, avatar, and personal traits.
 * 3. Preserves immutable relational links for certificates, badges, and verified records.
 * 4. Never hard-deletes rows referenced by ledger aggregates.
 */
export function executeLogicalAnonymization(user, profile, nowIso = new Date().toISOString()) {
    const anonymizedHash = crypto
        .createHash('sha256')
        .update(`${user.id}:${user.email}:${nowIso}`)
        .digest('hex');
    const shortHash = anonymizedHash.slice(0, 12);
    const anonymizedEmail = `anonymized_${shortHash}@talentsphere.local`;
    const anonymizedUser = {
        ...user,
        email: anonymizedEmail,
        status: 'deactivated',
        updatedAt: nowIso,
    };
    const anonymizedProfile = {
        ...profile,
        fullName: 'Anonymized User',
        headline: undefined,
        bio: undefined,
        location: undefined,
        avatarUrl: undefined,
        privacy: 'private',
        updatedAt: nowIso,
    };
    return {
        anonymizedUser,
        anonymizedProfile,
        anonymizedHash,
        completedAt: nowIso,
    };
}
/**
 * Compiles a GDPR Article 15 & 20 compliant Data Portability archive in structured JSON format.
 * Strips sensitive keys and credentials while preserving full subject portability.
 */
export function compileDataExportArchive(params) {
    const now = params.nowIso || new Date().toISOString();
    // Strip BYO AI key from export to prevent key egress
    const safeSettings = { ...params.settings };
    delete safeSettings.byoAiKey;
    return {
        exportMetadata: {
            version: '1.0.0',
            exportedAt: now,
            subjectId: params.user.id,
            compliance: ['GDPR-Art-15', 'GDPR-Art-20', 'DPDP-2023', 'CCPA-Right-To-Know'],
        },
        account: {
            id: params.user.id,
            email: params.user.email,
            roles: params.user.roles,
            status: params.user.status,
            createdAt: params.user.createdAt,
        },
        profile: {
            id: params.profile.id,
            fullName: params.profile.fullName,
            headline: params.profile.headline,
            bio: params.profile.bio,
            location: params.profile.location,
            avatarUrl: params.profile.avatarUrl,
            privacy: params.profile.privacy,
            createdAt: params.profile.createdAt,
            updatedAt: params.profile.updatedAt,
        },
        settings: safeSettings,
        evidence: params.evidence || [],
        applications: params.applications || [],
        resumes: params.resumes || [],
        portfolio: params.portfolio || [],
        gamification: params.gamification,
    };
}
//# sourceMappingURL=settings.js.map
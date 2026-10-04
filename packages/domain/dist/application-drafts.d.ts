import { type Role } from './core.js';
export interface ApplicationDraft {
    id: string;
    candidateId: string;
    jobId: string;
    resumeId?: string;
    coverLetter?: string;
    answers: Record<string, unknown>;
    attachedEvidenceIds: string[];
    stepIndex: number;
    version: number;
    isSubmitted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ApplicationDraftVersion {
    id: string;
    draftId: string;
    version: number;
    coverLetter?: string;
    answers: Record<string, unknown>;
    attachedEvidenceIds: string[];
    stepIndex: number;
    savedAt: string;
}
export interface SaveDraftParams {
    candidateId: string;
    jobId: string;
    actor: {
        userId: string;
        roles: Role[];
    };
    resumeId?: string;
    coverLetter?: string;
    answers?: Record<string, unknown>;
    attachedEvidenceIds?: string[];
    stepIndex?: number;
    existingDraft?: ApplicationDraft;
}
export interface SaveDraftResult {
    draft: ApplicationDraft;
    versionSnapshot: ApplicationDraftVersion;
}
/**
 * Saves or autosaves an application draft with version retention (F-36, BR-18, SSOT 1015).
 */
export declare function saveApplicationDraft(params: SaveDraftParams): SaveDraftResult;
/**
 * Restores a specific prior draft version for recoverable autosave (BR-18).
 */
export declare function restoreApplicationDraftVersion(draft: ApplicationDraft, targetVersion: number, versionsHistory: ApplicationDraftVersion[], actor: {
    userId: string;
    candidateProfileId: string;
}): SaveDraftResult;
/**
 * Marks an application draft as submitted when the official job application is filed.
 */
export declare function markDraftSubmitted(draft: ApplicationDraft): ApplicationDraft;
//# sourceMappingURL=application-drafts.d.ts.map
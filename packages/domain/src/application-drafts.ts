import { DomainError, type Role } from './index.js';

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
export function saveApplicationDraft(params: SaveDraftParams): SaveDraftResult {
  // BR-02: Only candidates may apply / draft applications
  if (params.actor.roles.includes('recruiter') && !params.actor.roles.includes('candidate')) {
    throw new DomainError(
      'FORBIDDEN',
      'Recruiters may not create or save job application drafts (BR-02).'
    );
  }

  // Cover letter validation (SSOT 1015: <= 5000 characters)
  if (params.coverLetter && params.coverLetter.length > 5000) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Cover letter exceeds maximum allowed length of 5000 characters (SSOT 1015).'
    );
  }

  if (params.existingDraft && params.existingDraft.isSubmitted) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'Cannot edit an application draft that has already been submitted.'
    );
  }

  const now = new Date().toISOString();
  const existing = params.existingDraft;

  const version = existing ? existing.version + 1 : 1;
  const draftId = existing ? existing.id : crypto.randomUUID();

  const draft: ApplicationDraft = {
    id: draftId,
    candidateId: params.candidateId,
    jobId: params.jobId,
    resumeId: params.resumeId ?? existing?.resumeId,
    coverLetter: params.coverLetter !== undefined ? params.coverLetter : existing?.coverLetter,
    answers: params.answers ?? existing?.answers ?? {},
    attachedEvidenceIds: params.attachedEvidenceIds ?? existing?.attachedEvidenceIds ?? [],
    stepIndex:
      params.stepIndex !== undefined ? Math.max(0, params.stepIndex) : (existing?.stepIndex ?? 0),
    version,
    isSubmitted: false,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  const versionSnapshot: ApplicationDraftVersion = {
    id: crypto.randomUUID(),
    draftId,
    version,
    coverLetter: draft.coverLetter,
    answers: draft.answers,
    attachedEvidenceIds: draft.attachedEvidenceIds,
    stepIndex: draft.stepIndex,
    savedAt: now,
  };

  return { draft, versionSnapshot };
}

/**
 * Restores a specific prior draft version for recoverable autosave (BR-18).
 */
export function restoreApplicationDraftVersion(
  draft: ApplicationDraft,
  targetVersion: number,
  versionsHistory: ApplicationDraftVersion[],
  actor: {
    userId: string;
    candidateProfileId: string;
  }
): SaveDraftResult {
  if (draft.candidateId !== actor.candidateProfileId) {
    throw new DomainError(
      'FORBIDDEN',
      'Cannot restore an application draft belonging to another candidate.'
    );
  }

  if (draft.isSubmitted) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'Cannot restore a version of an already submitted application.'
    );
  }

  const snapshot = versionsHistory.find(
    (v) => v.draftId === draft.id && v.version === targetVersion
  );

  if (!snapshot) {
    throw new DomainError(
      'NOT_FOUND',
      `Draft version ${targetVersion} not found for this application draft.`
    );
  }

  const now = new Date().toISOString();
  const newVersion = draft.version + 1;

  const restoredDraft: ApplicationDraft = {
    ...draft,
    coverLetter: snapshot.coverLetter,
    answers: snapshot.answers,
    attachedEvidenceIds: snapshot.attachedEvidenceIds,
    stepIndex: snapshot.stepIndex,
    version: newVersion,
    updatedAt: now,
  };

  const newVersionSnapshot: ApplicationDraftVersion = {
    id: crypto.randomUUID(),
    draftId: draft.id,
    version: newVersion,
    coverLetter: restoredDraft.coverLetter,
    answers: restoredDraft.answers,
    attachedEvidenceIds: restoredDraft.attachedEvidenceIds,
    stepIndex: restoredDraft.stepIndex,
    savedAt: now,
  };

  return { draft: restoredDraft, versionSnapshot: newVersionSnapshot };
}

/**
 * Marks an application draft as submitted when the official job application is filed.
 */
export function markDraftSubmitted(draft: ApplicationDraft): ApplicationDraft {
  return {
    ...draft,
    isSubmitted: true,
    updatedAt: new Date().toISOString(),
  };
}

import type pg from 'pg';
import {
  DomainError,
  type ApplicationDraft,
  type ApplicationDraftVersion,
} from '@talentsphere/domain';

/**
 * Application drafts and their version history (F-36, BR-18; migration 00019).
 * In pg mode SQL is the source of truth: there is no in-memory copy to drift.
 * Drafts are keyed by candidate PROFILE id and job id (one draft per pair).
 */
export interface ApplicationDraftStore {
  get(candidateId: string, jobId: string): Promise<ApplicationDraft | null>;
  listVersions(draftId: string): Promise<ApplicationDraftVersion[]>;
  /** Active (not submitted) drafts of one candidate, oldest first. */
  listActive(candidateId: string): Promise<ApplicationDraft[]>;
  /**
   * Writes the draft and appends its version snapshot atomically.
   * `previousVersion` is the version the caller read (null for a new draft);
   * a draft another writer has since created or advanced is a CONFLICT.
   */
  save(
    draft: ApplicationDraft,
    snapshot: ApplicationDraftVersion,
    previousVersion: number | null
  ): Promise<void>;
  /** Marks the draft submitted, if one exists and is still active. */
  markSubmitted(candidateId: string, jobId: string, updatedAt: string): Promise<void>;
  /** Deletes the draft and its versions. Returns false when none existed. */
  remove(candidateId: string, jobId: string): Promise<boolean>;
  eraseCandidate(candidateId: string): Promise<void>;
}

const conflict = () =>
  new DomainError('CONFLICT', 'Draft has changed since it was read. Reload before saving.');

export class MemoryApplicationDraftStore implements ApplicationDraftStore {
  private readonly drafts = new Map<string, ApplicationDraft>(); // `${candidateId}:${jobId}`
  private readonly versions = new Map<string, ApplicationDraftVersion[]>(); // draftId

  async get(candidateId: string, jobId: string): Promise<ApplicationDraft | null> {
    return this.drafts.get(`${candidateId}:${jobId}`) ?? null;
  }
  async listVersions(draftId: string): Promise<ApplicationDraftVersion[]> {
    return [...(this.versions.get(draftId) ?? [])];
  }
  async listActive(candidateId: string): Promise<ApplicationDraft[]> {
    return [...this.drafts.values()].filter((d) => d.candidateId === candidateId && !d.isSubmitted);
  }
  async save(
    draft: ApplicationDraft,
    snapshot: ApplicationDraftVersion,
    previousVersion: number | null
  ): Promise<void> {
    const key = `${draft.candidateId}:${draft.jobId}`;
    const current = this.drafts.get(key);
    if ((current?.version ?? null) !== previousVersion) throw conflict();
    this.drafts.set(key, draft);
    this.versions.set(draft.id, [...(this.versions.get(draft.id) ?? []), snapshot]);
  }
  async markSubmitted(candidateId: string, jobId: string, updatedAt: string): Promise<void> {
    const key = `${candidateId}:${jobId}`;
    const current = this.drafts.get(key);
    if (current && !current.isSubmitted) {
      this.drafts.set(key, { ...current, isSubmitted: true, updatedAt });
    }
  }
  async remove(candidateId: string, jobId: string): Promise<boolean> {
    const key = `${candidateId}:${jobId}`;
    const current = this.drafts.get(key);
    if (!current) return false;
    this.drafts.delete(key);
    this.versions.delete(current.id);
    return true;
  }
  async eraseCandidate(candidateId: string): Promise<void> {
    for (const [key, draft] of this.drafts) {
      if (draft.candidateId !== candidateId) continue;
      this.drafts.delete(key);
      this.versions.delete(draft.id);
    }
  }
}

interface DraftRow {
  id: string;
  candidate_id: string;
  job_id: string;
  resume_id: string | null;
  cover_letter: string | null;
  answers: Record<string, unknown>;
  attached_evidence_ids: string[];
  step_index: number;
  version: number;
  is_submitted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface VersionRow {
  id: string;
  draft_id: string;
  version: number;
  cover_letter: string | null;
  answers: Record<string, unknown>;
  attached_evidence_ids: string[];
  step_index: number;
  saved_at: Date;
}

function draftFromRow(row: DraftRow): ApplicationDraft {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    resumeId: row.resume_id ?? undefined,
    coverLetter: row.cover_letter ?? undefined,
    answers: row.answers ?? {},
    attachedEvidenceIds: row.attached_evidence_ids ?? [],
    stepIndex: row.step_index,
    version: row.version,
    isSubmitted: row.is_submitted,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function versionFromRow(row: VersionRow): ApplicationDraftVersion {
  return {
    id: row.id,
    draftId: row.draft_id,
    version: row.version,
    coverLetter: row.cover_letter ?? undefined,
    answers: row.answers ?? {},
    attachedEvidenceIds: row.attached_evidence_ids ?? [],
    stepIndex: row.step_index,
    savedAt: new Date(row.saved_at).toISOString(),
  };
}

export class PgApplicationDraftStore implements ApplicationDraftStore {
  constructor(private readonly pool: pg.Pool) {}

  async get(candidateId: string, jobId: string): Promise<ApplicationDraft | null> {
    const rows = await this.pool.query<DraftRow>(
      'SELECT * FROM public.application_drafts WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    );
    return rows.rows[0] ? draftFromRow(rows.rows[0]) : null;
  }

  async listVersions(draftId: string): Promise<ApplicationDraftVersion[]> {
    const rows = await this.pool.query<VersionRow>(
      'SELECT * FROM public.application_draft_versions WHERE draft_id = $1 ORDER BY version',
      [draftId]
    );
    return rows.rows.map(versionFromRow);
  }

  async listActive(candidateId: string): Promise<ApplicationDraft[]> {
    const rows = await this.pool.query<DraftRow>(
      `SELECT * FROM public.application_drafts
       WHERE candidate_id = $1 AND is_submitted = false
       ORDER BY created_at, id`,
      [candidateId]
    );
    return rows.rows.map(draftFromRow);
  }

  async save(
    draft: ApplicationDraft,
    snapshot: ApplicationDraftVersion,
    previousVersion: number | null
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const values = [
        draft.id,
        draft.candidateId,
        draft.jobId,
        draft.resumeId ?? null,
        draft.coverLetter ?? null,
        JSON.stringify(draft.answers),
        draft.attachedEvidenceIds,
        draft.stepIndex,
        draft.version,
        draft.isSubmitted,
        draft.createdAt,
        draft.updatedAt,
      ];
      const written =
        previousVersion === null
          ? // The (candidate_id, job_id) unique key turns a racing first save
            // into a CONFLICT instead of a second draft.
            await client.query(
              `INSERT INTO public.application_drafts (
                 id, candidate_id, job_id, resume_id, cover_letter, answers,
                 attached_evidence_ids, step_index, version, is_submitted, created_at, updated_at
               ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12)
               ON CONFLICT (candidate_id, job_id) DO NOTHING`,
              values
            )
          : // Compare-and-set on the version the caller read: two autosaves
            // that read the same version cannot both win.
            await client.query(
              `UPDATE public.application_drafts
               SET resume_id = $4, cover_letter = $5, answers = $6::jsonb,
                   attached_evidence_ids = $7, step_index = $8, version = $9,
                   is_submitted = $10, updated_at = $11
               WHERE id = $1 AND candidate_id = $2 AND job_id = $3
                 AND version = $12 AND is_submitted = false`,
              [...values.slice(0, 10), draft.updatedAt, previousVersion]
            );
      if (!written.rowCount) throw conflict();
      await client.query(
        `INSERT INTO public.application_draft_versions (
           id, draft_id, version, cover_letter, answers, attached_evidence_ids, step_index, saved_at
         ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)`,
        [
          snapshot.id,
          snapshot.draftId,
          snapshot.version,
          snapshot.coverLetter ?? null,
          JSON.stringify(snapshot.answers),
          snapshot.attachedEvidenceIds,
          snapshot.stepIndex,
          snapshot.savedAt,
        ]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async markSubmitted(candidateId: string, jobId: string, updatedAt: string): Promise<void> {
    await this.pool.query(
      `UPDATE public.application_drafts SET is_submitted = true, updated_at = $3
       WHERE candidate_id = $1 AND job_id = $2 AND is_submitted = false`,
      [candidateId, jobId, updatedAt]
    );
  }

  async remove(candidateId: string, jobId: string): Promise<boolean> {
    // ON DELETE CASCADE removes the version history.
    const rows = await this.pool.query(
      'DELETE FROM public.application_drafts WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    );
    return (rows.rowCount ?? 0) > 0;
  }

  async eraseCandidate(candidateId: string): Promise<void> {
    await this.pool.query('DELETE FROM public.application_drafts WHERE candidate_id = $1', [
      candidateId,
    ]);
  }
}

import { describe, it, expect } from 'vitest';
import {
  saveApplicationDraft,
  restoreApplicationDraftVersion,
  markDraftSubmitted,
  type ApplicationDraftVersion,
} from '../../packages/domain/src/application-drafts.js';

describe('Domain: Application Draft Autosave & Recovery (F-36, BR-18, SSOT 1015)', () => {
  const candidateId = 'prof_cand_123';
  const jobId = 'job_789';
  const candidateActor = {
    userId: 'user_cand_123',
    roles: ['candidate'] as any,
  };
  const recruiterActor = {
    userId: 'user_rec_456',
    roles: ['recruiter'] as any,
  };

  it('creates an initial draft with version 1 and snapshot', () => {
    const { draft, versionSnapshot } = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'I am excited about this distributed systems role.',
      answers: { preferredStartDate: '2026-11-01' },
      attachedEvidenceIds: ['ev_1'],
      stepIndex: 1,
    });

    expect(draft.id).toBeDefined();
    expect(draft.version).toBe(1);
    expect(draft.candidateId).toBe(candidateId);
    expect(draft.jobId).toBe(jobId);
    expect(draft.coverLetter).toBe('I am excited about this distributed systems role.');
    expect(draft.answers).toEqual({ preferredStartDate: '2026-11-01' });
    expect(draft.attachedEvidenceIds).toEqual(['ev_1']);
    expect(draft.stepIndex).toBe(1);
    expect(draft.isSubmitted).toBe(false);

    expect(versionSnapshot.draftId).toBe(draft.id);
    expect(versionSnapshot.version).toBe(1);
    expect(versionSnapshot.coverLetter).toBe(draft.coverLetter);
    expect(versionSnapshot.stepIndex).toBe(1);
  });

  it('increments version on subsequent autosave and generates new snapshot (BR-18)', () => {
    const initial = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Draft v1 text',
      stepIndex: 0,
    });

    const second = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Draft v2 expanded text',
      stepIndex: 2,
      existingDraft: initial.draft,
    });

    expect(second.draft.id).toBe(initial.draft.id);
    expect(second.draft.version).toBe(2);
    expect(second.draft.coverLetter).toBe('Draft v2 expanded text');
    expect(second.draft.stepIndex).toBe(2);

    expect(second.versionSnapshot.version).toBe(2);
    expect(second.versionSnapshot.coverLetter).toBe('Draft v2 expanded text');
  });

  it('enforces cover letter maximum length of 5000 characters (SSOT 1015)', () => {
    const longLetter = 'a'.repeat(5001);
    expect(() =>
      saveApplicationDraft({
        candidateId,
        jobId,
        actor: candidateActor,
        coverLetter: longLetter,
      })
    ).toThrowError(/5000 characters/);
  });

  it('prohibits recruiters from creating or editing candidate application drafts (BR-02)', () => {
    expect(() =>
      saveApplicationDraft({
        candidateId,
        jobId,
        actor: recruiterActor,
        coverLetter: 'Recruiter attempting draft',
      })
    ).toThrowError(/Recruiters may not create or save job application drafts/);
  });

  it('prohibits editing an already submitted application draft', () => {
    const initial = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Submitted application',
    });

    const submitted = markDraftSubmitted(initial.draft);
    expect(submitted.isSubmitted).toBe(true);

    expect(() =>
      saveApplicationDraft({
        candidateId,
        jobId,
        actor: candidateActor,
        coverLetter: 'Trying to mutate after submission',
        existingDraft: submitted,
      })
    ).toThrowError(/Cannot edit an application draft that has already been submitted/);
  });

  it('restores an earlier draft version and preserves auditability (BR-18)', () => {
    const v1 = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Version 1 text',
      stepIndex: 0,
    });

    const v2 = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Accidentally erased text',
      stepIndex: 1,
      existingDraft: v1.draft,
    });

    const history: ApplicationDraftVersion[] = [v1.versionSnapshot, v2.versionSnapshot];

    const restored = restoreApplicationDraftVersion(
      v2.draft,
      1,
      history,
      { userId: candidateActor.userId, candidateProfileId: candidateId }
    );

    expect(restored.draft.version).toBe(3); // strictly forward-moving versioning
    expect(restored.draft.coverLetter).toBe('Version 1 text');
    expect(restored.draft.stepIndex).toBe(0);
    expect(restored.versionSnapshot.version).toBe(3);
    expect(restored.versionSnapshot.coverLetter).toBe('Version 1 text');
  });

  it('rejects restoring a non-existent version', () => {
    const v1 = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Version 1 text',
    });

    expect(() =>
      restoreApplicationDraftVersion(
        v1.draft,
        999,
        [v1.versionSnapshot],
        { userId: candidateActor.userId, candidateProfileId: candidateId }
      )
    ).toThrowError(/Draft version 999 not found/);
  });

  it('rejects restoring a draft belonging to another candidate', () => {
    const v1 = saveApplicationDraft({
      candidateId,
      jobId,
      actor: candidateActor,
      coverLetter: 'Secret draft',
    });

    expect(() =>
      restoreApplicationDraftVersion(
        v1.draft,
        1,
        [v1.versionSnapshot],
        { userId: 'other_user', candidateProfileId: 'other_profile' }
      )
    ).toThrowError(/Cannot restore an application draft belonging to another candidate/);
  });
});

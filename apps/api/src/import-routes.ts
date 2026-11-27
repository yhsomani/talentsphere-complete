/**
 * Profile import v1 (plan TS-08, ADR-033). Moved out of server.ts with no
 * behaviour change (ADR-022, plan TS-12): the shared read model is passed in
 * read-only, and every write still goes through persist(), so confirm and
 * undo stay one transaction each.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  applyImportBatch,
  createEvidence,
  createImportBatch,
  createWorkHistory,
  DomainError,
  existingRecordImportKey,
  importCsvTemplate,
  importedEvidenceFields,
  importedRecordInUse,
  importedWorkHistoryFields,
  isImportReviewExpired,
  parseImport,
  planImportCommit,
  reviewImportItems,
  undoImportBatch,
  type AuthPayload,
  type Evidence,
  type ImportBatch,
  type ImportItem,
  type JobApplication,
  type Skill,
} from '@talentsphere/domain';
import {
  CommitImportInputSchema,
  CreateImportInputSchema,
  ImportTemplateParamsSchema,
} from '@talentsphere/contracts';
import type {
  CoreOp,
  EmailChallenge,
  StoredReference,
  StoredWorkHistory,
} from './storage/index.js';

export interface ImportRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  persist(...ops: CoreOp[]): Promise<void>;
  importBatchesById: ReadonlyMap<string, ImportBatch>;
  profilesByUserId: ReadonlyMap<string, { id: string }>;
  skillsById: ReadonlyMap<string, Skill>;
  evidenceById: ReadonlyMap<string, Evidence>;
  evidenceBySubjectId: ReadonlyMap<string, Evidence[]>;
  evidenceSkills: ReadonlyMap<string, Set<string>>;
  applicationsByCandidateId: ReadonlyMap<string, JobApplication[]>;
  verifiedWorkHistoriesById: ReadonlyMap<string, StoredWorkHistory>;
  verifiedWorkHistoriesByCandidateId: ReadonlyMap<string, StoredWorkHistory[]>;
  employmentReferencesByHistoryId: ReadonlyMap<string, StoredReference[]>;
  emailChallengesByHistoryId: ReadonlyMap<string, EmailChallenge>;
}

export function registerImportRoutes(app: FastifyInstance, deps: ImportRouteDeps): void {
  const {
    extractUser,
    persist,
    importBatchesById,
    profilesByUserId,
    skillsById,
    evidenceById,
    evidenceBySubjectId,
    evidenceSkills,
    applicationsByCandidateId,
    verifiedWorkHistoriesById,
    verifiedWorkHistoriesByCandidateId,
    employmentReferencesByHistoryId,
    emailChallengesByHistoryId,
  } = deps;

  // ---------------------------------------------------------------------
  // Profile import v1 (plan TS-08, ADR-033, FR-PRF-019). The user sends a
  // JSON Resume or CSV template file's text; it is parsed here (bounded,
  // text only) and only the parsed entries are kept. Nothing reaches the
  // profile until the user confirms; confirm and undo are each one
  // transaction with the records they create or delete.
  // ---------------------------------------------------------------------

  /** Dedupe keys of everything on the person's profile now (§10.1 rule 4). */
  const profileImportKeys = (userId: string, profileId: string | undefined): Set<string> => {
    const keys = new Set<string>();
    const add = (key: string | null) => key && keys.add(key);
    for (const h of verifiedWorkHistoriesByCandidateId.get(userId) || []) {
      add(existingRecordImportKey({ kind: 'workHistory', ...h }));
    }
    for (const e of profileId ? evidenceBySubjectId.get(profileId) || [] : []) {
      add(existingRecordImportKey({ kind: 'evidence', metadata: e.metadata }));
      for (const skillId of evidenceSkills.get(e.id) ?? []) keys.add(`skill|${skillId}`);
    }
    return keys;
  };

  const ownImportBatch = (userId: string, id: string): ImportBatch => {
    const batch = importBatchesById.get(id);
    // Someone else's import is reported as missing, not forbidden.
    if (
      !batch ||
      batch.ownerId !== userId ||
      isImportReviewExpired(batch, new Date().toISOString())
    ) {
      throw new DomainError('NOT_FOUND', 'Import not found.');
    }
    return batch;
  };

  const importView = (batch: ImportBatch, userId: string) => {
    const nowIso = new Date().toISOString();
    const reviews =
      batch.status === 'ready_for_review'
        ? reviewImportItems(batch.items, {
            existingKeys: profileImportKeys(userId, profilesByUserId.get(userId)?.id),
            skills: skillsById.values(),
            nowIso,
          })
        : [];
    const reviewById = new Map(reviews.map((r) => [r.id, r]));
    const items = batch.items.map((item) => {
      const review = reviewById.get(item.id);
      return {
        id: item.id,
        kind: item.kind,
        payload: item.payload,
        createdRef: item.createdRef ?? null,
        review: review
          ? {
              suggested: review.suggested,
              duplicate: review.duplicate,
              problem: review.problem,
              skill: review.skillId
                ? { id: review.skillId, name: skillsById.get(review.skillId)?.name ?? null }
                : null,
            }
          : null,
      };
    });
    return {
      id: batch.id,
      source: batch.source,
      status: batch.status,
      ignored: batch.ignored,
      reviewExpiresAt: batch.reviewExpiresAt,
      appliedAt: batch.appliedAt ?? null,
      undoUntil: batch.undoUntil ?? null,
      undoneAt: batch.undoneAt ?? null,
      createdAt: batch.createdAt,
      counts: {
        total: items.length,
        suggestedAccept: reviews.filter((r) => r.suggested === 'accept').length,
        duplicates: reviews.filter((r) => r.duplicate).length,
        added: batch.items.filter((i) => i.createdRef).length,
      },
      items,
    };
  };

  app.post(
    '/api/v1/imports',
    { bodyLimit: 2 * 1024 * 1024 },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const session = extractUser(req);
      const input = CreateImportInputSchema.parse(req.body);
      const parsed = parseImport(input.source, input.content);
      const batch = createImportBatch({ ownerId: session.userId, source: input.source, parsed });
      await persist({ kind: 'importBatch', value: batch });
      return reply.status(201).send({ import: importView(batch, session.userId) });
    }
  );

  app.get('/api/v1/imports', async (req: FastifyRequest) => {
    const session = extractUser(req);
    const nowIso = new Date().toISOString();
    const mine = [...importBatchesById.values()]
      .filter((b) => b.ownerId === session.userId && !isImportReviewExpired(b, nowIso))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      imports: mine.map((b) => ({
        id: b.id,
        source: b.source,
        status: b.status,
        entries: b.items.length,
        added: b.items.filter((i) => i.createdRef).length,
        createdAt: b.createdAt,
        reviewExpiresAt: b.reviewExpiresAt,
        undoUntil: b.undoUntil ?? null,
      })),
    };
  });

  // Registered before /imports/:id so "templates" is never read as an id.
  app.get(
    '/api/v1/imports/templates/:source',
    async (req: FastifyRequest<{ Params: { source: string } }>, reply: FastifyReply) => {
      extractUser(req);
      const { source } = ImportTemplateParamsSchema.parse(req.params);
      return reply
        .header('content-type', 'text/csv; charset=utf-8')
        .header('content-disposition', `attachment; filename="talentsphere-${source}.csv"`)
        .send(importCsvTemplate(source));
    }
  );

  app.get('/api/v1/imports/:id', async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const session = extractUser(req);
    return { import: importView(ownImportBatch(session.userId, req.params.id), session.userId) };
  });

  app.post(
    '/api/v1/imports/:id/commit',
    async (req: FastifyRequest<{ Params: { id: string } }>) => {
      const session = extractUser(req);
      const input = CommitImportInputSchema.parse(req.body);
      const batch = ownImportBatch(session.userId, req.params.id);
      const profile = profilesByUserId.get(session.userId);
      const nowIso = new Date().toISOString();
      const plan = planImportCommit(batch, input.accept, {
        existingKeys: profileImportKeys(session.userId, profile?.id),
        skills: skillsById.values(),
        nowIso,
      });
      const ops: CoreOp[] = [];
      const committed: ImportItem[] = [];
      for (const { item, skillId } of plan.items) {
        if (item.kind === 'position') {
          const history = createWorkHistory({
            candidateId: session.userId,
            ...importedWorkHistoryFields(item),
            nowIso,
          });
          ops.push({ kind: 'workHistory', value: history });
          committed.push({ ...item, createdRef: { type: 'workHistory', id: history.id } });
          continue;
        }
        if (!profile) {
          throw new DomainError('NOT_FOUND', 'Profile required before importing evidence.');
        }
        const fields = importedEvidenceFields(batch, item, {
          skillName: skillId ? skillsById.get(skillId)?.name : undefined,
          nowIso,
        });
        const evidence = createEvidence({ subjectId: profile.id, ...fields });
        ops.push({ kind: 'evidence', value: evidence, skillIds: skillId ? [skillId] : [] });
        committed.push({ ...item, createdRef: { type: 'evidence', id: evidence.id } });
      }
      const applied = applyImportBatch(batch, committed, nowIso);
      await persist(...ops, { kind: 'importBatch', value: applied, base: batch });
      return {
        import: importView(applied, session.userId),
        added: committed.length,
        skipped: plan.skipped,
      };
    }
  );

  app.post('/api/v1/imports/:id/undo', async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const session = extractUser(req);
    const batch = ownImportBatch(session.userId, req.params.id);
    const ops: CoreOp[] = [];
    const inUse: string[] = [];
    for (const item of batch.items) {
      const ref = item.createdRef;
      if (!ref) continue;
      if (ref.type === 'workHistory') {
        const h = verifiedWorkHistoriesById.get(ref.id);
        if (!h) continue; // removed by the person since
        const used = importedRecordInUse({
          kind: 'workHistory',
          emailVerifiedAt: h.emailVerifiedAt,
          verificationStatus: h.verificationStatus,
          references: (employmentReferencesByHistoryId.get(h.id) || []).length,
          openEmailCheck: emailChallengesByHistoryId.has(h.id),
        });
        if (used) inUse.push(h.id);
        else ops.push({ kind: 'workHistoryDelete', id: h.id });
      } else {
        const e = evidenceById.get(ref.id);
        if (!e) continue;
        const attached = (applicationsByCandidateId.get(e.subjectId) || []).some((a) =>
          a.attachedEvidenceIds.includes(e.id)
        );
        const used = importedRecordInUse({
          kind: 'evidence',
          status: e.status,
          verificationLevel: e.verificationLevel,
          attached,
        });
        if (used) inUse.push(e.id);
        else ops.push({ kind: 'evidenceDelete', id: e.id });
      }
    }
    const undone = undoImportBatch(batch, new Date().toISOString(), inUse);
    await persist(...ops, { kind: 'importBatch', value: undone, base: batch });
    return { import: importView(undone, session.userId), removed: ops.length };
  });

  // Cancel at review: the parsed entries are deleted; nothing was added.
  app.delete('/api/v1/imports/:id', async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const session = extractUser(req);
    const batch = ownImportBatch(session.userId, req.params.id);
    if (batch.status !== 'ready_for_review') {
      throw new DomainError('CONFLICT', 'A confirmed import is undone, not discarded.', {
        reason: 'not_reviewable',
      });
    }
    await persist({ kind: 'importBatchDelete', id: batch.id });
    return { discarded: true };
  });
}

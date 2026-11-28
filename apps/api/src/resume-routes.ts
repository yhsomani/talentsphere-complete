/**
 * Resume builder (F-13, BR-26). Moved out of server.ts with no behaviour change
 * (ADR-022, plan TS-12). The four resume Maps stay owned by server.ts because
 * application drafts, the data export and erasure read them; these routes
 * update them in place.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createResumeEntity,
  createResumeExport,
  DomainError,
  softDeleteResumeExport,
  updateResumeEntity,
  type AuthPayload,
  type Resume,
  type ResumeExport,
} from '@talentsphere/domain';
import {
  CreateResumeInputSchema,
  ExportResumeInputSchema,
  UpdateResumeInputSchema,
} from '@talentsphere/contracts';

export interface ResumeRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  dispatchJob(event: {
    type: string;
    payload: Record<string, unknown>;
    enqueuedAt?: string;
  }): Promise<void>;
  resumesById: Map<string, Resume>;
  resumesByUserId: Map<string, Resume[]>;
  resumeExportsById: Map<string, ResumeExport>;
  resumeExportsByResumeId: Map<string, ResumeExport[]>;
  profilesByUserId: ReadonlyMap<string, { fullName?: string }>;
}

export function registerResumeRoutes(app: FastifyInstance, deps: ResumeRouteDeps): void {
  const {
    extractUser,
    dispatchJob,
    resumesById,
    resumesByUserId,
    resumeExportsById,
    resumeExportsByResumeId,
    profilesByUserId,
  } = deps;

  app.post('/api/v1/resumes', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateResumeInputSchema.parse(req.body || {});

    const resume = createResumeEntity(session.userId, input);
    resumesById.set(resume.id, resume);

    const userResumes = resumesByUserId.get(session.userId) || [];
    userResumes.unshift(resume);
    resumesByUserId.set(session.userId, userResumes);

    return reply.status(201).send({ resume });
  });

  app.get('/api/v1/resumes', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userResumes = resumesByUserId.get(session.userId) || [];
    return reply.status(200).send({ resumes: userResumes });
  });

  app.get(
    '/api/v1/resumes/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const resume = resumesById.get(id);
      if (!resume) {
        throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
      }

      if (resume.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to resume.');
      }

      return reply.status(200).send({ resume });
    }
  );

  app.patch(
    '/api/v1/resumes/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const resume = resumesById.get(id);
      if (!resume) {
        throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
      }

      if (resume.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to resume.');
      }

      const input = UpdateResumeInputSchema.parse(req.body || {});
      const updated = updateResumeEntity(resume, input);
      resumesById.set(updated.id, updated);

      // Update in user list
      const userResumes = resumesByUserId.get(session.userId) || [];
      const idx = userResumes.findIndex((r) => r.id === updated.id);
      if (idx !== -1) {
        userResumes[idx] = updated;
        resumesByUserId.set(session.userId, userResumes);
      }

      return reply.status(200).send({ resume: updated });
    }
  );

  app.post(
    '/api/v1/resumes/:id/export',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const resume = resumesById.get(id);
      if (!resume) {
        throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
      }

      if (resume.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to resume.');
      }

      const input = ExportResumeInputSchema.parse(req.body || {});
      const profile = profilesByUserId.get(session.userId);

      const exportItem = createResumeExport(resume, input.format, profile?.fullName);
      resumeExportsById.set(exportItem.id, exportItem);

      const resumeExports = resumeExportsByResumeId.get(resume.id) || [];
      resumeExports.unshift(exportItem);
      resumeExportsByResumeId.set(resume.id, resumeExports);

      await dispatchJob({
        type: 'resume.exported',
        payload: {
          userId: session.userId,
          resumeId: resume.id,
          exportId: exportItem.id,
          format: exportItem.format,
          sha256Hash: exportItem.sha256Hash,
        },
        enqueuedAt: exportItem.createdAt,
      });

      return reply.status(201).send({ export: exportItem });
    }
  );

  app.get(
    '/api/v1/resumes/:id/exports',
    async (
      req: FastifyRequest<{ Params: { id: string }; Querystring: { includeDeleted?: string } }>,
      reply: FastifyReply
    ) => {
      const session = extractUser(req);
      const { id } = req.params;

      const resume = resumesById.get(id);
      if (!resume) {
        throw new DomainError('NOT_FOUND', `Resume with ID "${id}" not found.`);
      }

      if (resume.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to resume.');
      }

      const allExports = resumeExportsByResumeId.get(id) || [];
      const filtered =
        req.query.includeDeleted === 'true'
          ? allExports
          : allExports.filter((e) => e.status !== 'deleted');

      return reply.status(200).send({ exports: filtered });
    }
  );

  app.delete(
    '/api/v1/resumes/exports/:exportId',
    async (req: FastifyRequest<{ Params: { exportId: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { exportId } = req.params;

      const exportItem = resumeExportsById.get(exportId);
      if (!exportItem) {
        throw new DomainError('NOT_FOUND', `Resume export with ID "${exportId}" not found.`);
      }

      if (exportItem.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to resume export.');
      }

      const softDeleted = softDeleteResumeExport(exportItem);
      resumeExportsById.set(softDeleted.id, softDeleted);

      // Update in list
      const resumeExports = resumeExportsByResumeId.get(softDeleted.resumeId) || [];
      const idx = resumeExports.findIndex((e) => e.id === softDeleted.id);
      if (idx !== -1) {
        resumeExports[idx] = softDeleted;
        resumeExportsByResumeId.set(softDeleted.resumeId, resumeExports);
      }

      return reply.status(200).send({
        message: 'Resume export soft-deleted (BR-26)',
        export: softDeleted,
      });
    }
  );
}

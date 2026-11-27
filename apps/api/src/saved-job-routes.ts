/**
 * Saved searches, job alerts and saved jobs (F-32, F-04, F-25). Moved out of
 * server.ts with no behaviour change (ADR-022, plan TS-12). The records live
 * in their own SQL-backed stores; only the job read model is passed in.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createSavedSearch,
  DomainError,
  matchJobAgainstCriteria,
  updateSavedSearch,
  type AuthPayload,
  type Job,
  type OrgAction,
} from '@talentsphere/domain';
import {
  CreateSavedSearchInputSchema,
  UpdateSavedSearchInputSchema,
} from '@talentsphere/contracts';
import type { Storage } from './storage/index.js';

export interface SavedJobRouteDeps {
  storage: Pick<Storage, 'savedSearches' | 'jobAlerts' | 'savedJobs'>;
  extractUser(req: FastifyRequest): AuthPayload;
  canInOrg(session: AuthPayload, orgId: string, action: OrgAction): boolean;
  jobsById: ReadonlyMap<string, Job>;
}

export function registerSavedJobRoutes(app: FastifyInstance, deps: SavedJobRouteDeps): void {
  const { storage, extractUser, canInOrg, jobsById } = deps;

  // =========================================================================
  // Saved Searches, Job Alerts & Saved Jobs Endpoints (F-32, F-04, F-25)
  // =========================================================================

  // 1. Create a new saved search
  app.post('/api/v1/jobs/saved-searches', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreateSavedSearchInputSchema.parse(req.body);
    const existing = await storage.savedSearches.listByUser(session.userId);

    const savedSearch = createSavedSearch({
      userId: session.userId,
      title: input.title,
      criteria: input.criteria,
      alertFrequency: input.alertFrequency,
      existingSearches: existing,
    });

    await storage.savedSearches.create(savedSearch);
    return reply.status(201).send({ savedSearch });
  });

  // 2. List candidate's saved searches
  app.get('/api/v1/jobs/saved-searches', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userSearches = await storage.savedSearches.listByUser(session.userId);
    return reply.status(200).send({ savedSearches: userSearches, total: userSearches.length });
  });

  // 3. Get single saved search by ID
  app.get(
    '/api/v1/jobs/saved-searches/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const search = await storage.savedSearches.get(id);
      if (!search) {
        throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
      }
      if (search.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
      }
      return reply.status(200).send({ savedSearch: search });
    }
  );

  // 4. Update saved search
  app.patch(
    '/api/v1/jobs/saved-searches/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const search = await storage.savedSearches.get(id);
      if (!search) {
        throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
      }
      if (search.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
      }
      const input = UpdateSavedSearchInputSchema.parse(req.body);
      const updated = updateSavedSearch(search, input);
      const persisted = await storage.savedSearches.update(updated, search.updatedAt);
      return reply.status(200).send({ savedSearch: persisted });
    }
  );

  // 5. Delete saved search
  app.delete(
    '/api/v1/jobs/saved-searches/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const search = await storage.savedSearches.get(id);
      if (!search) {
        throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
      }
      if (search.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
      }
      await storage.savedSearches.remove(id, session.userId);
      return reply.status(200).send({ message: 'Saved search deleted successfully.' });
    }
  );

  // 6. Run saved search on live published inventory
  app.post(
    '/api/v1/jobs/saved-searches/:id/run',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const search = await storage.savedSearches.get(id);
      if (!search) {
        throw new DomainError('NOT_FOUND', `Saved search with ID "${id}" not found.`);
      }
      if (search.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to this saved search.');
      }
      const published = Array.from(jobsById.values()).filter((j) => j.status === 'published');
      const matched = published.filter((j) => matchJobAgainstCriteria(j, search.criteria));
      return reply.status(200).send({ matchingJobs: matched, total: matched.length });
    }
  );

  // 7. List job alerts for candidate
  app.get('/api/v1/jobs/alerts', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const alerts = await storage.jobAlerts.listByUser(session.userId);
    return reply.status(200).send({ alerts, total: alerts.length });
  });

  // 8. Mark job alert as read
  app.patch(
    '/api/v1/jobs/alerts/:id/read',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;
      const alert = await storage.jobAlerts.markRead(id, session.userId);
      return reply.status(200).send({ alert });
    }
  );

  // 9. Bookmark / save job
  app.post(
    '/api/v1/jobs/:id/save',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id: jobId } = req.params;
      const job = jobsById.get(jobId);
      // Bookmarking must not bypass the same draft/private visibility policy
      // enforced by GET /jobs/:id. Do not disclose an unpublished job's ID.
      if (!job || (job.status !== 'published' && !canInOrg(session, job.orgId, 'view_jobs'))) {
        throw new DomainError('NOT_FOUND', `Job with ID "${jobId}" not found.`);
      }
      const savedJob = await storage.savedJobs.add(session.userId, jobId);
      return reply.status(201).send({ savedJob });
    }
  );

  // 10. Remove saved job bookmark
  app.delete(
    '/api/v1/jobs/:id/save',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id: jobId } = req.params;
      await storage.savedJobs.remove(session.userId, jobId);
      return reply.status(200).send({ message: 'Job removed from saved bookmarks.' });
    }
  );

  // 11. List candidate's saved jobs
  app.get('/api/v1/jobs/saved', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const currentSaved = await storage.savedJobs.list(session.userId);
    const jobs = currentSaved
      .map((s) => jobsById.get(s.jobId))
      .filter(
        (job): job is Job =>
          job !== undefined &&
          (job.status === 'published' || canInOrg(session, job.orgId, 'view_jobs'))
      );
    return reply.status(200).send({ savedJobs: currentSaved, jobs, total: currentSaved.length });
  });
}

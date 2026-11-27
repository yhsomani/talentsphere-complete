/**
 * Portfolio showcase (F-26). Moved out of server.ts with no behaviour change
 * (ADR-022, plan TS-12). Writes go to storage.portfolio first; the two
 * project Maps are the read model, owned by server.ts (boot load and
 * erasure use them) and updated here after each write.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  areConnected,
  assertPortfolioLinks,
  canViewPortfolioProject,
  createPortfolioProject,
  DomainError,
  updatePortfolioProject,
  type AuthPayload,
  type Connection,
  type Evidence,
  type PortfolioProject,
  type Role,
  type Skill,
} from '@talentsphere/domain';
import {
  CreatePortfolioProjectInputSchema,
  UpdatePortfolioProjectInputSchema,
} from '@talentsphere/contracts';
import type { Storage } from './storage/index.js';

export interface PortfolioRouteDeps {
  storage: Pick<Storage, 'portfolio'>;
  extractUser(req: FastifyRequest): AuthPayload;
  maybeExtractUser(req: FastifyRequest): AuthPayload | null;
  dispatchJob(event: {
    type: string;
    payload: Record<string, unknown>;
    enqueuedAt?: string;
  }): Promise<void>;
  portfolioProjectsById: Map<string, PortfolioProject>;
  portfolioProjectsByUserId: Map<string, PortfolioProject[]>;
  connectionsByUserId: ReadonlyMap<string, Connection[]>;
  profilesById: ReadonlyMap<string, { id: string; userId: string }>;
  profilesByUserId: ReadonlyMap<string, { id: string }>;
  evidenceById: ReadonlyMap<string, Evidence>;
  skillsById: ReadonlyMap<string, Skill>;
}

export function registerPortfolioRoutes(app: FastifyInstance, deps: PortfolioRouteDeps): void {
  const {
    storage,
    extractUser,
    maybeExtractUser,
    dispatchJob,
    portfolioProjectsById,
    portfolioProjectsByUserId,
    connectionsByUserId,
    profilesById,
    profilesByUserId,
    evidenceById,
    skillsById,
  } = deps;

  const portfolioLinkCheck = (userId: string) => {
    const profileId = profilesByUserId.get(userId)?.id;
    return {
      isSkill: (id: string) => skillsById.has(id),
      ownsEvidence: (id: string) =>
        profileId !== undefined && evidenceById.get(id)?.subjectId === profileId,
    };
  };

  app.post('/api/v1/portfolio/projects', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = CreatePortfolioProjectInputSchema.parse(req.body || {});

    const project = createPortfolioProject(session.userId, input);
    assertPortfolioLinks(project, portfolioLinkCheck(session.userId));
    await storage.portfolio.save(project);
    portfolioProjectsById.set(project.id, project);

    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    userProjects.push(project);
    portfolioProjectsByUserId.set(session.userId, userProjects);

    await dispatchJob({
      type: 'portfolio.project.created',
      payload: {
        userId: session.userId,
        projectId: project.id,
        title: project.title,
        visibility: project.visibility,
      },
      enqueuedAt: project.createdAt,
    });

    return reply.status(201).send({ project });
  });

  app.get('/api/v1/portfolio/projects', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
    return reply.status(200).send({ projects: userProjects });
  });

  app.get(
    '/api/v1/portfolio/projects/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = req.params;
      const project = portfolioProjectsById.get(id);
      if (!project) {
        throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
      }

      const viewer = maybeExtractUser(req);
      const viewerUserId: string | undefined = viewer?.userId;
      const viewerRoles: Role[] | undefined = viewer?.roles;

      const userConnections = viewerUserId ? connectionsByUserId.get(viewerUserId) || [] : [];
      const isConnected = viewerUserId
        ? areConnected(userConnections, viewerUserId, project.userId)
        : false;

      if (
        !canViewPortfolioProject(project, { userId: viewerUserId, roles: viewerRoles, isConnected })
      ) {
        throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
      }

      return reply.status(200).send({ project });
    }
  );

  app.patch(
    '/api/v1/portfolio/projects/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const project = portfolioProjectsById.get(id);
      if (!project) {
        throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
      }

      if (project.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
      }

      const input = UpdatePortfolioProjectInputSchema.parse(req.body || {});
      // Update a copy: the read model changes only after the write is stored.
      const updated = updatePortfolioProject(
        { ...project, skillIds: [...project.skillIds], evidenceIds: [...project.evidenceIds] },
        input
      );
      assertPortfolioLinks(updated, portfolioLinkCheck(session.userId));
      await storage.portfolio.save(updated);
      portfolioProjectsById.set(updated.id, updated);

      const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
      const idx = userProjects.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        userProjects[idx] = updated;
        portfolioProjectsByUserId.set(session.userId, userProjects);
      }

      await dispatchJob({
        type: 'portfolio.project.updated',
        payload: {
          userId: session.userId,
          projectId: updated.id,
        },
        enqueuedAt: updated.updatedAt,
      });

      return reply.status(200).send({ project: updated });
    }
  );

  app.delete(
    '/api/v1/portfolio/projects/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const project = portfolioProjectsById.get(id);
      if (!project) {
        throw new DomainError('NOT_FOUND', `Portfolio project with ID "${id}" not found.`);
      }

      if (project.userId !== session.userId) {
        throw new DomainError('FORBIDDEN', 'Access denied to portfolio project.');
      }

      await storage.portfolio.remove(id);
      portfolioProjectsById.delete(id);

      const userProjects = portfolioProjectsByUserId.get(session.userId) || [];
      portfolioProjectsByUserId.set(
        session.userId,
        userProjects.filter((p) => p.id !== id)
      );

      await dispatchJob({
        type: 'portfolio.project.removed',
        payload: {
          userId: session.userId,
          projectId: id,
        },
        enqueuedAt: new Date().toISOString(),
      });

      return reply.status(200).send({
        message: 'Portfolio project deleted successfully',
        deletedId: id,
      });
    }
  );

  app.get(
    '/api/v1/portfolio/showcase/:targetUserId',
    async (req: FastifyRequest<{ Params: { targetUserId: string } }>, reply: FastifyReply) => {
      let { targetUserId } = req.params;
      const targetProfile = profilesById.get(targetUserId);
      if (targetProfile) {
        targetUserId = targetProfile.userId;
      }

      const viewer = maybeExtractUser(req);
      const viewerUserId: string | undefined = viewer?.userId;
      const viewerRoles: Role[] | undefined = viewer?.roles;

      const userConnections = viewerUserId ? connectionsByUserId.get(viewerUserId) || [] : [];
      const isConnected = viewerUserId
        ? areConnected(userConnections, viewerUserId, targetUserId)
        : false;

      const allProjects = portfolioProjectsByUserId.get(targetUserId) || [];
      const visibleProjects = allProjects.filter((p) =>
        canViewPortfolioProject(p, { userId: viewerUserId, roles: viewerRoles, isConnected })
      );

      visibleProjects.sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return reply.status(200).send({
        projects: visibleProjects,
        totalCount: visibleProjects.length,
      });
    }
  );
}

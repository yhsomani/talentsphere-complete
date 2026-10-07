/**
 * TalentSphere Portfolio Showcase Domain (F-26)
 * Project showcase models, visibility gating, and canonical skill/evidence associations.
 */

import { DomainError, Role } from './core.js';

export type PortfolioVisibility = 'public' | 'connections_only' | 'recruiters_only' | 'private';
export type PortfolioMediaType = 'image' | 'video' | 'document';

export interface PortfolioProjectMedia {
  id: string;
  mediaUrl: string;
  mediaType: PortfolioMediaType;
  caption?: string;
  orderIndex: number;
}

export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  visibility: PortfolioVisibility;
  featured: boolean;
  orderIndex: number;
  skillIds: string[];
  evidenceIds: string[];
  media: PortfolioProjectMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioProjectInput {
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  visibility?: PortfolioVisibility;
  featured?: boolean;
  orderIndex?: number;
  skillIds?: string[];
  evidenceIds?: string[];
  media?: Array<{
    id?: string;
    mediaUrl: string;
    mediaType?: PortfolioMediaType;
    caption?: string;
    orderIndex?: number;
  }>;
}

export interface ViewerContext {
  userId?: string;
  roles?: Role[];
  isConnected?: boolean;
}

export function createPortfolioProject(
  userId: string,
  input: CreatePortfolioProjectInput
): PortfolioProject {
  if (!userId) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'User ID is required to create a portfolio project.'
    );
  }

  const title = input.title?.trim();
  if (!title || title.length < 2 || title.length > 200) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Project title must be between 2 and 200 characters.'
    );
  }

  const description = input.description?.trim();
  if (!description || description.length < 10 || description.length > 10000) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Project description must be between 10 and 10000 characters.'
    );
  }

  const now = new Date().toISOString();
  const media: PortfolioProjectMedia[] = (input.media || []).map((m, idx) => ({
    id: m.id || crypto.randomUUID(),
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType || 'image',
    caption: m.caption?.trim(),
    orderIndex: m.orderIndex ?? idx,
  }));

  return {
    id: crypto.randomUUID(),
    userId,
    title,
    description,
    projectUrl: input.projectUrl?.trim() || undefined,
    repoUrl: input.repoUrl?.trim() || undefined,
    visibility: input.visibility || 'public',
    featured: input.featured ?? false,
    orderIndex: input.orderIndex ?? 0,
    skillIds: input.skillIds || [],
    evidenceIds: input.evidenceIds || [],
    media,
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePortfolioProject(
  project: PortfolioProject,
  input: Partial<CreatePortfolioProjectInput>
): PortfolioProject {
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length < 2 || title.length > 200) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Project title must be between 2 and 200 characters.'
      );
    }
    project.title = title;
  }

  if (input.description !== undefined) {
    const description = input.description.trim();
    if (description.length < 10 || description.length > 10000) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Project description must be between 10 and 10000 characters.'
      );
    }
    project.description = description;
  }

  if (input.projectUrl !== undefined) {
    project.projectUrl = input.projectUrl ? input.projectUrl.trim() : undefined;
  }

  if (input.repoUrl !== undefined) {
    project.repoUrl = input.repoUrl ? input.repoUrl.trim() : undefined;
  }

  if (input.visibility !== undefined) {
    project.visibility = input.visibility;
  }

  if (input.featured !== undefined) {
    project.featured = input.featured;
  }

  if (input.orderIndex !== undefined) {
    project.orderIndex = input.orderIndex;
  }

  if (input.skillIds !== undefined) {
    project.skillIds = input.skillIds;
  }

  if (input.evidenceIds !== undefined) {
    project.evidenceIds = input.evidenceIds;
  }

  if (input.media !== undefined) {
    project.media = input.media.map((m, idx) => ({
      id: m.id || crypto.randomUUID(),
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType || 'image',
      caption: m.caption?.trim(),
      orderIndex: m.orderIndex ?? idx,
    }));
  }

  project.updatedAt = new Date().toISOString();
  return project;
}

export function canViewPortfolioProject(project: PortfolioProject, viewer: ViewerContext): boolean {
  if (viewer.userId && project.userId === viewer.userId) {
    return true;
  }

  if (project.visibility === 'private') {
    return false;
  }

  if (project.visibility === 'public') {
    return true;
  }

  if (project.visibility === 'connections_only') {
    return Boolean(viewer.isConnected);
  }

  if (project.visibility === 'recruiters_only') {
    const roles = viewer.roles || [];
    return (
      roles.includes('recruiter') ||
      roles.includes('hiring_manager') ||
      roles.includes('platform_admin')
    );
  }

  return false;
}

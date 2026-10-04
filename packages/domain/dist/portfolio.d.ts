/**
 * TalentSphere Portfolio Showcase Domain (F-26)
 * Project showcase models, visibility gating, and canonical skill/evidence associations.
 */
import { Role } from './core.js';
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
export declare function createPortfolioProject(userId: string, input: CreatePortfolioProjectInput): PortfolioProject;
export declare function updatePortfolioProject(project: PortfolioProject, input: Partial<CreatePortfolioProjectInput>): PortfolioProject;
export declare function canViewPortfolioProject(project: PortfolioProject, viewer: ViewerContext): boolean;
//# sourceMappingURL=portfolio.d.ts.map
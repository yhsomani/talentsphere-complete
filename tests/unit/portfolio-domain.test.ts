import { describe, it, expect, beforeAll } from 'vitest';
import {
  createPortfolioProject,
  updatePortfolioProject,
  canViewPortfolioProject,
  DomainError,
  type PortfolioProject,
} from '../../packages/domain/src/index.js';

describe('Portfolio Showcase Domain (F-26)', () => {
  const ownerId = '11111111-1111-1111-1111-111111111111';
  const strangerId = '22222222-2222-2222-2222-222222222222';
  const connectedPeerId = '33333333-3333-3333-3333-333333333333';
  const recruiterId = '44444444-4444-4444-4444-444444444444';

  describe('createPortfolioProject', () => {
    it('rejects missing or empty user ID', () => {
      expect(() => {
        createPortfolioProject('', {
          title: 'My Cool App',
          description: 'A comprehensive full-stack distributed system built with TypeScript and PostgreSQL.',
        });
      }).toThrowError(/User ID is required/);
    });

    it('rejects title shorter than 2 characters or longer than 200 characters', () => {
      expect(() => {
        createPortfolioProject(ownerId, {
          title: 'A',
          description: 'A comprehensive full-stack distributed system built with TypeScript and PostgreSQL.',
        });
      }).toThrowError(/Project title must be between 2 and 200 characters/);

      expect(() => {
        createPortfolioProject(ownerId, {
          title: 'a'.repeat(201),
          description: 'A comprehensive full-stack distributed system built with TypeScript and PostgreSQL.',
        });
      }).toThrowError(/Project title must be between 2 and 200 characters/);
    });

    it('rejects description shorter than 10 characters', () => {
      expect(() => {
        createPortfolioProject(ownerId, {
          title: 'Distributed System',
          description: 'Short',
        });
      }).toThrowError(/Project description must be between 10 and 10000 characters/);
    });

    it('successfully creates a portfolio project with canonical skill tags, evidence links, and media', () => {
      const skillId = '55555555-5555-5555-5555-555555555555';
      const evidenceId = '66666666-6666-6666-6666-666666666666';

      const project = createPortfolioProject(ownerId, {
        title: 'Distributed Event Bus',
        description: 'High-throughput event streaming platform with zero-loss durability and strict idempotency.',
        projectUrl: 'https://demo.example.com/event-bus',
        repoUrl: 'https://github.com/example/event-bus',
        visibility: 'public',
        featured: true,
        orderIndex: 1,
        skillIds: [skillId],
        evidenceIds: [evidenceId],
        media: [
          {
            mediaUrl: 'https://assets.example.com/arch-diagram.png',
            mediaType: 'image',
            caption: 'System Architecture',
          },
        ],
      });

      expect(project.id).toBeDefined();
      expect(project.userId).toBe(ownerId);
      expect(project.title).toBe('Distributed Event Bus');
      expect(project.featured).toBe(true);
      expect(project.skillIds).toEqual([skillId]);
      expect(project.evidenceIds).toEqual([evidenceId]);
      expect(project.media.length).toBe(1);
      expect(project.media[0].caption).toBe('System Architecture');
      expect(project.createdAt).toBeDefined();
    });
  });

  describe('updatePortfolioProject', () => {
    it('updates specified attributes while preserving unmentioned fields', () => {
      const project = createPortfolioProject(ownerId, {
        title: 'Initial Title',
        description: 'Initial description that is sufficiently long for validation.',
        visibility: 'private',
      });

      const updated = updatePortfolioProject(project, {
        title: 'Updated Title',
        visibility: 'connections_only',
        featured: true,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.visibility).toBe('connections_only');
      expect(updated.featured).toBe(true);
      expect(updated.description).toBe('Initial description that is sufficiently long for validation.');
    });
  });

  describe('canViewPortfolioProject (Visibility & Privacy Matrix)', () => {
    let publicProject: PortfolioProject;
    let connectionsProject: PortfolioProject;
    let recruitersProject: PortfolioProject;
    let privateProject: PortfolioProject;

    beforeAll(() => {
      publicProject = createPortfolioProject(ownerId, {
        title: 'Public Showcase App',
        description: 'Open to the entire world and platform ecosystem.',
        visibility: 'public',
      });

      connectionsProject = createPortfolioProject(ownerId, {
        title: 'Internal Collaborator Project',
        description: 'Only visible to confirmed professional network connections.',
        visibility: 'connections_only',
      });

      recruitersProject = createPortfolioProject(ownerId, {
        title: 'Targeted Hiring Work Sample',
        description: 'Only visible to verified recruiters and hiring managers.',
        visibility: 'recruiters_only',
      });

      privateProject = createPortfolioProject(ownerId, {
        title: 'Confidential Stealth MVP',
        description: 'Strictly private and restricted solely to the candidate owner.',
        visibility: 'private',
      });
    });

    it('allows owner to view all projects regardless of visibility', () => {
      const ownerContext = { userId: ownerId, roles: ['candidate' as const] };
      expect(canViewPortfolioProject(publicProject, ownerContext)).toBe(true);
      expect(canViewPortfolioProject(connectionsProject, ownerContext)).toBe(true);
      expect(canViewPortfolioProject(recruitersProject, ownerContext)).toBe(true);
      expect(canViewPortfolioProject(privateProject, ownerContext)).toBe(true);
    });

    it('evaluates public project as viewable by all personas', () => {
      expect(canViewPortfolioProject(publicProject, {})).toBe(true);
      expect(canViewPortfolioProject(publicProject, { userId: strangerId })).toBe(true);
      expect(canViewPortfolioProject(publicProject, { userId: recruiterId, roles: ['recruiter'] })).toBe(true);
    });

    it('enforces connections_only visibility based on network relationship', () => {
      // Unconnected stranger cannot view
      expect(canViewPortfolioProject(connectionsProject, { userId: strangerId, isConnected: false })).toBe(false);

      // Connected peer can view
      expect(canViewPortfolioProject(connectionsProject, { userId: connectedPeerId, isConnected: true })).toBe(true);
    });

    it('enforces recruiters_only visibility based on role authorization', () => {
      // General candidate peer cannot view
      expect(canViewPortfolioProject(recruitersProject, { userId: strangerId, roles: ['candidate'] })).toBe(false);

      // Recruiter can view
      expect(canViewPortfolioProject(recruitersProject, { userId: recruiterId, roles: ['recruiter'] })).toBe(true);

      // Hiring manager can view
      expect(canViewPortfolioProject(recruitersProject, { userId: recruiterId, roles: ['hiring_manager'] })).toBe(true);
    });

    it('enforces private visibility strictly to owner only', () => {
      expect(canViewPortfolioProject(privateProject, { userId: strangerId })).toBe(false);
      expect(canViewPortfolioProject(privateProject, { userId: connectedPeerId, isConnected: true })).toBe(false);
      expect(canViewPortfolioProject(privateProject, { userId: recruiterId, roles: ['recruiter'] })).toBe(false);
    });
  });
});

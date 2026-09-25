import { describe, it, expect } from 'vitest';
import {
  createResumeEntity,
  updateResumeEntity,
  renderResumeToMarkdown,
  createResumeExport,
  softDeleteResumeExport,
  DomainError,
} from '../../packages/domain/src/index.js';

describe('Resume Builder Domain (F-13, BR-26)', () => {
  const userId = '00000000-0000-0000-0000-000000000001';

  describe('createResumeEntity', () => {
    it('creates resume with default values', () => {
      const resume = createResumeEntity(userId, {
        title: 'Full Stack Engineer Resume',
        headline: 'Senior TypeScript Engineer',
      });

      expect(resume.id).toBeDefined();
      expect(resume.userId).toBe(userId);
      expect(resume.title).toBe('Full Stack Engineer Resume');
      expect(resume.headline).toBe('Senior TypeScript Engineer');
      expect(resume.template).toBe('modern');
      expect(resume.experience).toEqual([]);
      expect(resume.education).toEqual([]);
      expect(resume.skills).toEqual([]);
      expect(resume.isPrimary).toBe(false);
      expect(resume.createdAt).toBeDefined();
      expect(resume.updatedAt).toBeDefined();
    });

    it('requires userId to create resume', () => {
      expect(() => createResumeEntity('', { title: 'Test' })).toThrow(DomainError);
    });
  });

  describe('updateResumeEntity', () => {
    it('updates resume fields and preserves immutable identity', () => {
      const resume = createResumeEntity(userId, {
        title: 'Draft Resume',
        template: 'modern',
      });

      const updated = updateResumeEntity(resume, {
        title: 'Final Resume',
        template: 'technical',
        summary: 'Expert in distributed architectures and zero-trust security.',
        experience: [
          {
            id: 'exp-1',
            company: 'TechCorp',
            title: 'Lead Architect',
            startDate: '2023-01-01',
            isCurrent: true,
            highlights: ['Designed high-throughput Fastify modular monolith'],
          },
        ],
      });

      expect(updated.id).toBe(resume.id);
      expect(updated.userId).toBe(resume.userId);
      expect(updated.createdAt).toBe(resume.createdAt);
      expect(updated.title).toBe('Final Resume');
      expect(updated.template).toBe('technical');
      expect(updated.summary).toContain('zero-trust');
      expect(updated.experience).toHaveLength(1);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(resume.updatedAt).getTime()
      );
    });
  });

  describe('renderResumeToMarkdown', () => {
    it('renders structured markdown with linked verified evidence', () => {
      const resume = createResumeEntity(userId, {
        title: 'Engineering CV',
        headline: 'Senior Cloud Engineer',
        contactEmail: 'alex@example.com',
        location: 'San Francisco, CA',
        summary: 'Experienced distributed systems builder.',
        skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
        experience: [
          {
            id: 'exp-1',
            company: 'HyperScale',
            title: 'Staff Engineer',
            startDate: '2022-01-01',
            isCurrent: true,
            highlights: ['Scaled event streaming architecture to 10k ops/sec'],
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'MIT',
            degree: 'B.S. Computer Science',
            startDate: '2016-09-01',
            endDate: '2020-05-30',
          },
        ],
        evidenceIds: ['ev-001', 'ev-002'],
      });

      const md = renderResumeToMarkdown(resume, 'Alex Morgan');

      expect(md).toContain('# Alex Morgan');
      expect(md).toContain('**Senior Cloud Engineer**');
      expect(md).toContain('alex@example.com | San Francisco, CA');
      expect(md).toContain('## Skills & Competencies');
      expect(md).toContain('TypeScript, PostgreSQL');
      expect(md).toContain('### Staff Engineer at HyperScale (2022-01-01 - Present)');
      expect(md).toContain('- Scaled event streaming architecture');
      expect(md).toContain('### B.S. Computer Science — MIT');
      expect(md).toContain('## Verified Evidence & Credentials');
      expect(md).toContain('Verified Credential ID: ev-001');
      expect(md).toContain('Verified Credential ID: ev-002');
    });
  });

  describe('createResumeExport & softDeleteResumeExport (BR-26)', () => {
    it('generates export with SHA-256 hash across supported formats', () => {
      const resume = createResumeEntity(userId, {
        title: 'Export Test Resume',
        headline: 'Software Engineer',
      });

      const jsonExport = createResumeExport(resume, 'json', 'Alex Morgan');
      expect(jsonExport.format).toBe('json');
      expect(jsonExport.sha256Hash).toHaveLength(64);
      expect(jsonExport.status).toBe('active');
      expect(jsonExport.renderedContent).toContain('"candidateName": "Alex Morgan"');

      const mdExport = createResumeExport(resume, 'markdown', 'Alex Morgan');
      expect(mdExport.format).toBe('markdown');
      expect(mdExport.sha256Hash).toHaveLength(64);
      expect(mdExport.status).toBe('active');
      expect(mdExport.renderedContent).toContain('# Alex Morgan');

      const htmlExport = createResumeExport(resume, 'html', 'Alex Morgan');
      expect(htmlExport.format).toBe('html');
      expect(htmlExport.sha256Hash).toHaveLength(64);
      expect(htmlExport.status).toBe('active');
      expect(htmlExport.renderedContent).toContain('<!DOCTYPE html>');
    });

    it('soft-deletes resume export preserving historical audit artifact (BR-26)', () => {
      const resume = createResumeEntity(userId, { title: 'Soft Delete Resume' });
      const exportItem = createResumeExport(resume, 'markdown', 'Alex Morgan');

      expect(exportItem.status).toBe('active');
      expect(exportItem.deletedAt).toBeUndefined();

      const deleted = softDeleteResumeExport(exportItem);

      // BR-26 Invariant: Never hard deleted, artifact marked deleted
      expect(deleted.status).toBe('deleted');
      expect(deleted.deletedAt).toBeDefined();
      expect(deleted.renderedContent).toBe(exportItem.renderedContent);
      expect(deleted.sha256Hash).toBe(exportItem.sha256Hash);

      // Idempotency check
      const deletedTwice = softDeleteResumeExport(deleted);
      expect(deletedTwice.status).toBe('deleted');
      expect(deletedTwice.deletedAt).toBe(deleted.deletedAt);
    });
  });
});

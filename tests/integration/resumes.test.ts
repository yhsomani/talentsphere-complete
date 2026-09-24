import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Resume Builder & Export Engine Integration (F-13, BR-26)', () => {
  let app: FastifyInstance;
  let aliceToken: string;
  let aliceProfileId: string;
  let charlieToken: string;
  let charlieProfileId: string;
  let resumeId: string;
  let exportId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 0,
      LOG_LEVEL: 'error',
    });
    await app.ready();

    // 1. Register Alice
    const aliceRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'alice.resume@example.com',
        password: 'Password123!',
        fullName: 'Alice Architect',
        role: 'candidate',
      },
    });
    const aliceJson = aliceRes.json();
    aliceToken = aliceJson.token;
    aliceProfileId = aliceJson.profile.id;

    // 2. Register Charlie (isolated third party)
    const charlieRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'charlie.resume@example.com',
        password: 'Password123!',
        fullName: 'Charlie Outsider',
        role: 'candidate',
      },
    });
    const charlieJson = charlieRes.json();
    charlieToken = charlieJson.token;
    charlieProfileId = charlieJson.profile.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates candidate resume with experiences, education, skills, and linked evidence', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/resumes',
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        title: 'Principal Distributed Systems Engineer',
        template: 'technical',
        headline: 'Staff Infrastructure & Security Architect',
        summary: '10+ years architecting enterprise distributed backends and zero-trust platforms.',
        contactEmail: 'alice.resume@example.com',
        location: 'San Francisco, CA',
        experience: [
          {
            company: 'TechCorp Cloud',
            title: 'Lead Architect',
            startDate: '2021-03-01',
            isCurrent: true,
            highlights: ['Designed high-throughput modular monolith handling 50k req/sec'],
          },
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'M.S. Computer Science',
            startDate: '2018-09-01',
            endDate: '2020-06-15',
          },
        ],
        skills: [{ name: 'TypeScript' }, { name: 'Fastify' }, { name: 'PostgreSQL' }],
        evidenceIds: ['00000000-0000-0000-0000-000000000001'],
        isPrimary: true,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.resume.id).toBeDefined();
    expect(body.resume.title).toBe('Principal Distributed Systems Engineer');
    expect(body.resume.template).toBe('technical');
    expect(body.resume.skills).toHaveLength(3);
    expect(body.resume.evidenceIds).toHaveLength(1);
    expect(body.resume.isPrimary).toBe(true);

    resumeId = body.resume.id;
  });

  it('retrieves user resumes and specific resume details', async () => {
    // List all user resumes
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/resumes',
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().resumes).toHaveLength(1);

    // Get specific resume
    const detailRes = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${resumeId}`,
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.json().resume.id).toBe(resumeId);
  });

  it('updates resume content and template', async () => {
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/resumes/${resumeId}`,
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        headline: 'VP of Platform Engineering',
        summary: 'Updated leadership summary with organizational scaling expertise.',
      },
    });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.json().resume.headline).toBe('VP of Platform Engineering');
    expect(patchRes.json().resume.summary).toContain('leadership summary');
  });

  it('generates append-only resume exports with SHA-256 integrity hash (BR-26)', async () => {
    // 1. Export in Markdown
    const exportRes = await app.inject({
      method: 'POST',
      url: `/api/v1/resumes/${resumeId}/export`,
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        format: 'markdown',
      },
    });

    expect(exportRes.statusCode).toBe(201);
    const body = exportRes.json();
    expect(body.export.id).toBeDefined();
    expect(body.export.format).toBe('markdown');
    expect(body.export.sha256Hash).toHaveLength(64);
    expect(body.export.status).toBe('active');
    expect(body.export.renderedContent).toContain('# Alice Architect');
    expect(body.export.renderedContent).toContain('Verified Credential ID');

    exportId = body.export.id;

    // 2. Export in JSON
    const jsonExportRes = await app.inject({
      method: 'POST',
      url: `/api/v1/resumes/${resumeId}/export`,
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: {
        format: 'json',
      },
    });
    expect(jsonExportRes.statusCode).toBe(201);
    expect(jsonExportRes.json().export.format).toBe('json');
    expect(jsonExportRes.json().export.sha256Hash).toHaveLength(64);

    // 3. List exports -> 2 active exports
    const listExportsRes = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${resumeId}/exports`,
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(listExportsRes.statusCode).toBe(200);
    expect(listExportsRes.json().exports).toHaveLength(2);
  });

  it('soft-deletes resume export preserving historical audit artifact (BR-26)', async () => {
    // 1. Soft delete markdown export
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/resumes/exports/${exportId}`,
      headers: { authorization: `Bearer ${aliceToken}` },
    });

    expect(deleteRes.statusCode).toBe(200);
    const body = deleteRes.json();
    expect(body.export.status).toBe('deleted');
    expect(body.export.deletedAt).toBeDefined();
    expect(body.export.renderedContent).toBeDefined(); // Content is preserved

    // 2. Querying active exports returns only 1 active export
    const listActiveRes = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${resumeId}/exports`,
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(listActiveRes.statusCode).toBe(200);
    expect(listActiveRes.json().exports).toHaveLength(1);

    // 3. Querying with includeDeleted=true includes the soft-deleted export
    const listAllRes = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${resumeId}/exports?includeDeleted=true`,
      headers: { authorization: `Bearer ${aliceToken}` },
    });
    expect(listAllRes.statusCode).toBe(200);
    expect(listAllRes.json().exports).toHaveLength(2);
    expect(listAllRes.json().exports.some((e: any) => e.status === 'deleted')).toBe(true);
  });

  it('enforces strict privacy isolation across users', async () => {
    // Charlie tries to view Alice's resume -> 403 FORBIDDEN
    const outsiderGetRes = await app.inject({
      method: 'GET',
      url: `/api/v1/resumes/${resumeId}`,
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(outsiderGetRes.statusCode).toBe(403);

    // Charlie tries to update Alice's resume -> 403 FORBIDDEN
    const outsiderPatchRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/resumes/${resumeId}`,
      headers: { authorization: `Bearer ${charlieToken}` },
      payload: { title: 'Hacked Title' },
    });
    expect(outsiderPatchRes.statusCode).toBe(403);

    // Charlie tries to export Alice's resume -> 403 FORBIDDEN
    const outsiderExportRes = await app.inject({
      method: 'POST',
      url: `/api/v1/resumes/${resumeId}/export`,
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(outsiderExportRes.statusCode).toBe(403);

    // Charlie tries to delete Alice's export -> 403 FORBIDDEN
    const outsiderDeleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/resumes/exports/${exportId}`,
      headers: { authorization: `Bearer ${charlieToken}` },
    });
    expect(outsiderDeleteRes.statusCode).toBe(403);
  });
});

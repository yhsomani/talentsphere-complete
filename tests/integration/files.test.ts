import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { LocalDiskObjectStore } from '../../apps/api/src/file-storage/object-store.js';
import type { MalwareScanner } from '../../apps/api/src/file-storage/malware-scanner.js';
import { registerFileRoutes } from '../../apps/api/src/file-routes.js';
import { MemoryFileStore } from '../../apps/api/src/storage/file-store.js';

// File uploads (ADR-020) through the API: purpose rules, malware scanning,
// private files read through short-lived signed links, owner-only access.
const pdf = Buffer.from('%PDF-1.7\n% a tiny resume\n');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-files-'));

const register = async (app: FastifyInstance, email: string) => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { email, password: 'Password123!Secure', fullName: 'File Tester', role: 'candidate' },
  });
  expect(res.statusCode).toBe(201);
  return JSON.parse(res.body).token as string;
};

const upload = (
  app: FastifyInstance,
  token: string,
  body: Buffer,
  contentType = 'application/pdf',
  query = 'purpose=resume&name=cv.pdf'
) =>
  app.inject({
    method: 'POST',
    url: `/api/v1/files?${query}`,
    headers: { authorization: `Bearer ${token}`, 'content-type': contentType },
    payload: body,
  });

describe('File uploads (ADR-020)', () => {
  let app: FastifyInstance;
  let owner: string;
  let other: string;
  let fileId: string;
  const scanned: Buffer[] = [];
  const scanner: MalwareScanner = {
    name: 'fake',
    async scan(bytes) {
      scanned.push(bytes);
      return bytes.includes(Buffer.from('EICAR'))
        ? { clean: false, signature: 'Eicar-Test-Signature' }
        : { clean: true };
    },
  };

  beforeAll(async () => {
    app = await buildApp(
      { NODE_ENV: 'test', PORT: '0', DATABASE_URL: 'postgresql://x@localhost/x' },
      { objectStore: new LocalDiskObjectStore(dir), malwareScanner: scanner }
    );
    await app.ready();
    owner = await register(app, 'files.owner@example.com');
    other = await register(app, 'files.other@example.com');
  });

  afterAll(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('stores a scanned resume and lists it without its storage key', async () => {
    const res = await upload(app, owner, pdf);
    expect(res.statusCode).toBe(201);
    const { file } = JSON.parse(res.body);
    fileId = file.id;
    expect(file).toMatchObject({
      purpose: 'resume',
      contentType: 'application/pdf',
      sizeBytes: pdf.length,
      name: 'cv.pdf',
      scanStatus: 'clean',
    });
    expect(file.storageKey).toBeUndefined();
    expect(scanned.at(-1)?.equals(pdf)).toBe(true);
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/files',
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(JSON.parse(list.body).files.map((f: { id: string }) => f.id)).toEqual([fileId]);
  });

  it('refuses a wrong type, a renamed file, an infected file and a body over the limit', async () => {
    expect((await upload(app, owner, pdf, 'image/png')).statusCode).toBe(422);
    expect((await upload(app, owner, Buffer.from('MZ\x90\x00'))).statusCode).toBe(422);
    const infected = await upload(app, owner, Buffer.from('%PDF-1.7 EICAR'));
    expect(infected.statusCode).toBe(422);
    expect(JSON.parse(infected.body).error.message).toContain('malware scan');
    const huge = await upload(app, owner, Buffer.concat([pdf, Buffer.alloc(5 * 1024 * 1024)]));
    expect(huge.statusCode).toBe(413);
    const badQuery = await upload(app, owner, pdf, 'application/pdf', 'purpose=avatar&name=x');
    expect(badQuery.statusCode).toBe(400);
  });

  it('reads the file only through a signed link that expires', async () => {
    const link = await app.inject({
      method: 'GET',
      url: `/api/v1/files/${fileId}/url`,
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(link.statusCode).toBe(200);
    const { url, expiresAt } = JSON.parse(link.body);
    expect(Date.parse(expiresAt) - Date.now()).toBeLessThanOrEqual(300_000);
    const content = await app.inject({ method: 'GET', url });
    expect(content.statusCode).toBe(200);
    expect(content.rawPayload.equals(pdf)).toBe(true);
    expect(content.headers['content-disposition']).toBe('attachment; filename="cv.pdf"');
    expect(content.headers['x-content-type-options']).toBe('nosniff');

    const forged = url.replace(/signature=[0-9a-f]/, (m: string) =>
      m.endsWith('0') ? m.slice(0, -1) + '1' : m.slice(0, -1) + '0'
    );
    expect((await app.inject({ method: 'GET', url: forged })).statusCode).toBe(403);
    const expired = url.replace(/expires=\d+/, 'expires=1000');
    expect((await app.inject({ method: 'GET', url: expired })).statusCode).toBe(403);
  });

  it('hides a file from everyone but its owner, and deletes it with its bytes', async () => {
    const auth = { authorization: `Bearer ${other}` };
    for (const [method, url] of [
      ['GET', `/api/v1/files/${fileId}/url`],
      ['DELETE', `/api/v1/files/${fileId}`],
    ] as const) {
      expect((await app.inject({ method, url, headers: auth })).statusCode).toBe(404);
    }
    const listed = await app.inject({ method: 'GET', url: '/api/v1/files', headers: auth });
    expect(JSON.parse(listed.body).files).toEqual([]);

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/v1/files/${fileId}`,
      headers: { authorization: `Bearer ${owner}` },
    });
    expect(del.statusCode).toBe(204);
    expect(
      fs.readdirSync(dir, { recursive: true }).filter((p) => String(p).includes(fileId))
    ).toEqual([]);
  });
});

describe('File uploads without a scanner', () => {
  it('stores files marked not_scanned outside deployed environments', async () => {
    const app = await buildApp(
      { NODE_ENV: 'test', PORT: '0', DATABASE_URL: 'postgresql://x@localhost/x' },
      { objectStore: new LocalDiskObjectStore(dir), malwareScanner: null }
    );
    await app.ready();
    const token = await register(app, 'files.unscanned@example.com');
    const res = await upload(app, token, pdf);
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).file.scanStatus).toBe('not_scanned');
    await app.close();
  });

  it('refuses uploads in a deployed environment rather than storing unscanned files', async () => {
    const app = Fastify();
    app.setErrorHandler((err, _req, reply) =>
      reply
        .status(418)
        .send({ code: (err as { code?: string }).code, message: (err as Error).message })
    );
    let stored = 0;
    await registerFileRoutes(app, {
      storage: { files: new MemoryFileStore() },
      objectStore: {
        kind: 'local',
        put: async () => void stored++,
        delete: async () => {},
        signedGetUrl: () => null,
      },
      scanner: null,
      deployed: true,
      urlSecret: 'x'.repeat(32),
      extractUser: () => ({
        userId: 'u1',
        email: 'a@b.c',
        roles: ['candidate'],
        issuedAt: 0,
        expiresAt: 0,
      }),
      log: { warn: () => {}, error: () => {} },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/files?purpose=resume&name=cv.pdf',
      headers: { 'content-type': 'application/pdf' },
      payload: pdf,
    });
    expect(JSON.parse(res.body)).toEqual({
      code: 'SERVICE_UNAVAILABLE',
      message: 'File uploads are not available: no malware scanner is configured.',
    });
    expect(stored).toBe(0);
    await app.close();
  });
});

describe('File storage configuration', () => {
  it('refuses to boot with a half-configured S3 store', async () => {
    await expect(
      buildApp({ NODE_ENV: 'test', FILE_STORAGE: 's3', S3_BUCKET: 'b' } as never)
    ).rejects.toThrow(
      /FILE_STORAGE=s3 requires S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY/
    );
  });
});

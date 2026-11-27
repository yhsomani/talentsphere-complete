/**
 * Uploaded files against real PostgreSQL (migration 00059, ADR-020).
 * Proves file metadata survives a restart, the object store keeps the
 * bytes, and account erasure removes both.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for file tests.');
}

const dbName = `ts_pgfiles_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);
const fileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-pgfiles-'));
const boot = () =>
  buildApp({
    NODE_ENV: 'test',
    STORAGE: 'pg',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'error',
    FILE_STORAGE_DIR: fileDir,
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
  } as never);

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; data: Json; durability: unknown }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: res.statusCode,
    data: res.body ? JSON.parse(res.body) : {},
    durability: res.headers['x-talentsphere-durability'],
  };
}

describe('Uploaded file persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const email = 'files-pg@example.org';
  const password = 'long-enough-file-test-password';
  const pdf = Buffer.from('%PDF-1.7\n% persisted resume\n');

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await admin.connect();
    try {
      await admin.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await admin.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
    fs.rmSync(fileDir, { recursive: true, force: true });
  });

  it('keeps a file across a restart, and erasure removes the row and the bytes', async () => {
    const registered = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email,
      password,
      fullName: 'File Tester',
      role: 'candidate',
    });
    expect(registered.status).toBe(201);
    const userId = registered.data.user.id as string;

    const uploaded = await app.inject({
      method: 'POST',
      url: '/api/v1/files?purpose=resume&name=cv.pdf',
      headers: {
        authorization: `Bearer ${registered.data.token}`,
        'content-type': 'application/pdf',
      },
      payload: pdf,
    });
    expect(uploaded.statusCode).toBe(201);
    expect(uploaded.headers['x-talentsphere-durability']).toBeUndefined();
    const fileId = JSON.parse(uploaded.body).file.id as string;
    const row = await pool.query('SELECT owner_id, storage_key, size_bytes FROM public.files');
    expect(row.rows).toEqual([
      { owner_id: userId, storage_key: `files/${userId}/${fileId}`, size_bytes: pdf.length },
    ]);
    expect(fs.readFileSync(path.join(fileDir, 'files', userId, fileId)).equals(pdf)).toBe(true);

    await app.close();
    app = await boot();
    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, { email, password });
    const token = login.data.token as string;
    const listed = await call(app, 'GET', '/api/v1/files', token);
    expect(listed.data.files.map((f: { id: string }) => f.id)).toEqual([fileId]);
    const link = await call(app, 'GET', `/api/v1/files/${fileId}/url`, token);
    const content = await app.inject({ method: 'GET', url: link.data.url });
    expect(content.rawPayload.equals(pdf)).toBe(true);

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', token, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect((await pool.query('SELECT count(*)::int AS n FROM public.files')).rows[0].n).toBe(0);
    expect(fs.existsSync(path.join(fileDir, 'files', userId, fileId))).toBe(false);
  });
});

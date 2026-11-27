/**
 * Courses and learning progress against real PostgreSQL (plan TS-03,
 * ADR-026). Proves a published course, a learner's enrolment and lesson
 * progress, the certificate it earns and a revocation all survive restarts,
 * and that erasing the learner removes their enrolment and progress while the
 * certificate stays publicly verifiable (owner #5, migration 00062).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { dropTestDatabase } from './test-db.js';
import { createPublishedCourse } from '../helpers/content.js';

const baseUrl = process.env.TEST_DATABASE_URL;
if (!baseUrl) {
  throw new Error('TEST_DATABASE_URL is required for portfolio tests.');
}

const dbName = `ts_pglms_${crypto.randomBytes(4).toString('hex')}`;
const withDb = (url: string, name: string) => {
  const target = new URL(url);
  target.pathname = `/${name}`;
  return target.toString();
};
const databaseUrl = withDb(baseUrl, dbName);
const boot = () =>
  buildApp({
    NODE_ENV: 'test',
    STORAGE: 'pg',
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
  } as never);

const TS = '10000000-0000-4000-a000-000000000001';

type Json = Record<string, any>;
async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; data: Json }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return { status: res.statusCode, data: res.body ? JSON.parse(res.body) : {} };
}

describe('Course and learning progress persistence', () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const password = 'long-enough-lms-password';
  const email = (who: string) => `${who}@lms-pg.example`;
  let tokens: Record<string, string> = {};
  const loginAll = async () => {
    for (const who of ['instructor', 'learner', 'admin']) {
      tokens[who] = (
        await call(app, 'POST', '/api/v1/auth/login', undefined, { email: email(who), password })
      ).data.token;
    }
  };
  const restart = async () => {
    await app.close();
    app = await boot();
    await loginAll();
  };
  const count = async (sql: string) => (await pool.query(sql)).rows[0].n as number;

  beforeAll(async () => {
    const root = new pg.Client({ connectionString: withDb(baseUrl, 'postgres') });
    await root.connect();
    try {
      await root.query(`CREATE DATABASE ${dbName}`);
    } finally {
      await root.end();
    }
    execFileSync('node', ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    });
    pool = new pg.Pool({ connectionString: databaseUrl });
    app = await boot();
    for (const who of ['instructor', 'learner', 'admin']) {
      const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
        email: email(who),
        password,
        fullName: who,
        role: 'candidate',
      });
      expect(res.status).toBe(201);
    }
    // Sessions are checked against the users table, so roles are granted there.
    await pool.query(
      "UPDATE public.users SET roles = ARRAY['candidate', 'instructor'] WHERE email = $1",
      [email('instructor')]
    );
    await pool.query("UPDATE public.users SET roles = ARRAY['platform_admin'] WHERE email = $1", [
      email('admin'),
    ]);
    await restart();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await pool?.end();
    await dropTestDatabase(withDb(baseUrl, 'postgres'), dbName);
  });

  it('keeps courses, progress and certificates across restarts, and erasure keeps only the certificate', async () => {
    const { id: courseId } = await createPublishedCourse(
      app,
      tokens.instructor,
      'pg-durable-course'
    );
    const draft = await call(app, 'POST', '/api/v1/courses', tokens.instructor, {
      title: 'TypeScript drafts',
      slug: 'pg-draft-course',
      description: 'A draft course that links one canonical skill.',
      level: 'beginner',
      estimatedDurationMinutes: 60,
      xpReward: 10,
      skillIds: [TS],
    });
    expect(draft.status).toBe(201);
    expect(
      (
        await call(app, 'POST', '/api/v1/courses', tokens.instructor, {
          title: 'Unknown skill',
          slug: 'pg-unknown-skill',
          description: 'Links a skill that does not exist.',
          level: 'beginner',
          estimatedDurationMinutes: 60,
          xpReward: 10,
          skillIds: ['10000000-0000-4000-a000-0000000000ff'],
        })
      ).status
    ).toBe(404);

    const detail = await call(app, 'GET', `/api/v1/courses/${courseId}`, tokens.learner);
    const [l1, l2] = detail.data.course.modules[0].lessons;
    const [l3] = detail.data.course.modules[1].lessons;
    expect(
      (await call(app, 'POST', `/api/v1/courses/${courseId}/enroll`, tokens.learner)).status
    ).toBe(201);
    expect(
      (await call(app, 'POST', `/api/v1/lessons/${l1.id}/complete`, tokens.learner)).status
    ).toBe(200);

    await restart();

    const catalogue = await call(app, 'GET', '/api/v1/courses', tokens.learner);
    expect(catalogue.data.courses.map((c: Json) => c.id)).toEqual([courseId]);
    expect(catalogue.data.courses[0]).toMatchObject({ moduleCount: 2, lessonCount: 3 });
    const mine = await call(
      app,
      'GET',
      `/api/v1/courses/${draft.data.course.id}`,
      tokens.instructor
    );
    expect(mine.data.course).toMatchObject({ status: 'draft', skillIds: [TS] });
    let progress = await call(app, 'GET', `/api/v1/courses/${courseId}/progress`, tokens.learner);
    expect(progress.data).toMatchObject({ enrolled: true, completedLessonIds: [l1.id] });
    expect(progress.data.enrollment.progressPercent).toBeCloseTo(33.33, 1);
    // Re-completing a stored lesson is still idempotent, and enrolling twice still conflicts.
    expect(
      (await call(app, 'POST', `/api/v1/lessons/${l1.id}/complete`, tokens.learner)).data
        .alreadyCompleted
    ).toBe(true);
    expect(
      (await call(app, 'POST', `/api/v1/courses/${courseId}/enroll`, tokens.learner)).status
    ).toBe(409);

    await call(app, 'POST', `/api/v1/lessons/${l2.id}/complete`, tokens.learner);
    const done = await call(app, 'POST', `/api/v1/lessons/${l3.id}/complete`, tokens.learner);
    expect(done.data.completed).toBe(true);
    const { certificateNumber, verificationProofHash } = done.data.certificate;

    await restart();

    progress = await call(app, 'GET', `/api/v1/courses/${courseId}/progress`, tokens.learner);
    expect(progress.data.enrollment).toMatchObject({ status: 'completed', progressPercent: 100 });
    expect(progress.data.certificate.certificateNumber).toBe(certificateNumber);
    const certs = await call(app, 'GET', '/api/v1/certificates/my', tokens.learner);
    expect(certs.data.certificates.map((c: Json) => c.certificateNumber)).toEqual([
      certificateNumber,
    ]);
    const verified = await call(app, 'GET', `/api/v1/certificates/verify/${verificationProofHash}`);
    expect(verified.data.valid).toBe(true);

    const revoked = await call(
      app,
      'POST',
      `/api/v1/certificates/${certificateNumber}/revoke`,
      tokens.admin,
      { reason: 'Issued in error during a test.' }
    );
    expect(revoked.status).toBe(200);

    await restart();

    const afterRevoke = await call(app, 'GET', `/api/v1/certificates/${certificateNumber}`);
    expect(afterRevoke.data).toMatchObject({ status: 'revoked', isValid: false });

    const erased = await call(app, 'POST', '/api/v1/settings/erasure/execute', tokens.learner, {
      currentPassword: password,
    });
    expect(erased.status).toBe(200);
    expect(await count('SELECT count(*)::int AS n FROM public.course_enrollments')).toBe(0);
    expect(await count('SELECT count(*)::int AS n FROM public.lesson_progress')).toBe(0);
    expect(
      await count(
        'SELECT count(*)::int AS n FROM public.course_certificates WHERE enrollment_id IS NULL'
      )
    ).toBe(1);

    await app.close();
    app = await boot();
    const stillPublic = await call(app, 'GET', `/api/v1/certificates/${certificateNumber}`);
    expect(stillPublic.status).toBe(200);
    expect(stillPublic.data.status).toBe('revoked');
  });
});

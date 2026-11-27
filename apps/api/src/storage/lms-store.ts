import type pg from 'pg';
import type {
  Course,
  CourseCertificate,
  CourseEnrollment,
  CourseModule,
  Lesson,
  LessonProgress,
} from '@talentsphere/domain';

/**
 * Courses and learning progress (F-07, migrations 00005, 00021 and 00062;
 * plan TS-03, ADR-026). The API keeps the LMS in Maps as a read model
 * (catalogue, search, reputation and learning impact read them
 * synchronously); this store is the write-through source of truth the Maps
 * are rebuilt from at boot. Writes go here first, then to the Maps.
 */
export interface LmsSnapshot {
  courses: Course[];
  courseSkills: Array<{ courseId: string; skillId: string }>;
  modules: CourseModule[];
  lessons: Lesson[];
  enrollments: CourseEnrollment[];
  progress: LessonProgress[];
  certificates: CourseCertificate[];
}

export interface LmsStore {
  loadAll(): Promise<LmsSnapshot>;
  /** Inserts or updates a course; skills are written only when given. */
  saveCourse(course: Course, skillIds?: string[]): Promise<void>;
  saveModule(module: CourseModule): Promise<void>;
  saveLesson(lesson: Lesson): Promise<void>;
  saveEnrollment(enrollment: CourseEnrollment): Promise<void>;
  /** One transaction: the lesson's progress, the enrolment, and any certificate it earned. */
  recordLessonCompletion(
    progress: LessonProgress,
    enrollment: CourseEnrollment,
    certificate?: CourseCertificate
  ): Promise<void>;
  saveCertificate(certificate: CourseCertificate): Promise<void>;
  /** Erasure: the learner's enrolments and lesson progress. Certificates stay (owner #5). */
  eraseLearner(profileId: string): Promise<void>;
}

/** Memory mode keeps nothing across restarts; the Maps in server.ts are the data. */
export class MemoryLmsStore implements LmsStore {
  async loadAll(): Promise<LmsSnapshot> {
    return {
      courses: [],
      courseSkills: [],
      modules: [],
      lessons: [],
      enrollments: [],
      progress: [],
      certificates: [],
    };
  }
  async saveCourse(): Promise<void> {}
  async saveModule(): Promise<void> {}
  async saveLesson(): Promise<void> {}
  async saveEnrollment(): Promise<void> {}
  async recordLessonCompletion(): Promise<void> {}
  async saveCertificate(): Promise<void> {}
  async eraseLearner(): Promise<void> {}
}

type Db = Pick<pg.PoolClient, 'query'>;
type Row = Record<string, any>;

const iso = (d: Date | string) => new Date(d).toISOString();
const isoOrNull = (d: Date | string | null) => (d ? iso(d) : null);

const ENROLLMENT_UPSERT = `INSERT INTO public.course_enrollments
     (id, user_id, course_id, status, progress_percent, completed_at, created_at, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   ON CONFLICT (id) DO UPDATE SET
     status = EXCLUDED.status, progress_percent = EXCLUDED.progress_percent,
     completed_at = EXCLUDED.completed_at, updated_at = EXCLUDED.updated_at`;

const CERTIFICATE_UPSERT = `INSERT INTO public.course_certificates
     (id, enrollment_id, user_id, course_id, certificate_number, verification_proof_hash,
      evidence_id, status, revocation_reason, revoked_at, issued_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
   ON CONFLICT (id) DO UPDATE SET
     status = EXCLUDED.status, revocation_reason = EXCLUDED.revocation_reason,
     revoked_at = EXCLUDED.revoked_at`;

const enrollmentParams = (e: CourseEnrollment) => [
  e.id,
  e.userId,
  e.courseId,
  e.status,
  e.progressPercent,
  e.completedAt ?? null,
  e.createdAt,
  e.updatedAt,
];

const certificateParams = (c: CourseCertificate) => [
  c.id,
  c.enrollmentId,
  c.userId,
  c.courseId,
  c.certificateNumber,
  c.verificationProofHash,
  c.evidenceId ?? null,
  c.status,
  c.revocationReason ?? null,
  c.revokedAt ?? null,
  c.issuedAt,
];

export class PgLmsStore implements LmsStore {
  constructor(private readonly pool: pg.Pool) {}

  async loadAll(): Promise<LmsSnapshot> {
    const q = (sql: string) => this.pool.query<Row>(sql).then((r) => r.rows);
    const [courses, courseSkills, modules, lessons, enrollments, progress, certificates] =
      await Promise.all([
        q('SELECT * FROM public.courses ORDER BY created_at, id'),
        q('SELECT course_id, skill_id FROM public.course_skills ORDER BY created_at, id'),
        q('SELECT * FROM public.course_modules ORDER BY course_id, order_index'),
        q('SELECT * FROM public.lessons ORDER BY module_id, order_index'),
        q('SELECT * FROM public.course_enrollments ORDER BY created_at, id'),
        q('SELECT * FROM public.lesson_progress ORDER BY completed_at, id'),
        q('SELECT * FROM public.course_certificates ORDER BY issued_at, id'),
      ]);
    return {
      courses: courses.map((r) => ({
        id: r.id,
        instructorId: r.instructor_id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        status: r.status,
        level: r.level,
        estimatedDurationMinutes: r.estimated_duration_minutes,
        passingScorePercent: r.passing_score_percent,
        xpReward: r.xp_reward,
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      courseSkills: courseSkills.map((r) => ({ courseId: r.course_id, skillId: r.skill_id })),
      modules: modules.map((r) => ({
        id: r.id,
        courseId: r.course_id,
        title: r.title,
        description: r.description ?? undefined,
        orderIndex: r.order_index,
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      lessons: lessons.map((r) => ({
        id: r.id,
        moduleId: r.module_id,
        title: r.title,
        contentType: r.content_type,
        contentBody: r.content_body,
        durationMinutes: r.duration_minutes,
        orderIndex: r.order_index,
        prerequisiteLessonId: r.prerequisite_lesson_id,
        isFreePreview: r.is_free_preview,
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      enrollments: enrollments.map((r) => ({
        id: r.id,
        userId: r.user_id,
        courseId: r.course_id,
        status: r.status,
        // NUMERIC arrives as a string.
        progressPercent: Number(r.progress_percent),
        completedAt: isoOrNull(r.completed_at),
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      progress: progress.map((r) => ({
        id: r.id,
        enrollmentId: r.enrollment_id,
        lessonId: r.lesson_id,
        status: r.status,
        completedAt: iso(r.completed_at),
      })),
      certificates: certificates.map((r) => ({
        id: r.id,
        enrollmentId: r.enrollment_id,
        userId: r.user_id,
        courseId: r.course_id,
        certificateNumber: r.certificate_number,
        verificationProofHash: r.verification_proof_hash,
        evidenceId: r.evidence_id,
        status: r.status,
        revocationReason: r.revocation_reason,
        revokedAt: isoOrNull(r.revoked_at),
        issuedAt: iso(r.issued_at),
      })),
    };
  }

  private async inTransaction(work: (db: Db) => Promise<void>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await work(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async saveCourse(c: Course, skillIds?: string[]): Promise<void> {
    await this.inTransaction(async (db) => {
      await db.query(
        `INSERT INTO public.courses
           (id, instructor_id, title, slug, description, status, level,
            estimated_duration_minutes, passing_score_percent, xp_reward, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status,
           level = EXCLUDED.level, estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
           passing_score_percent = EXCLUDED.passing_score_percent, xp_reward = EXCLUDED.xp_reward,
           updated_at = EXCLUDED.updated_at`,
        [
          c.id,
          c.instructorId,
          c.title,
          c.slug,
          c.description,
          c.status,
          c.level,
          c.estimatedDurationMinutes,
          c.passingScorePercent,
          c.xpReward,
          c.createdAt,
          c.updatedAt,
        ]
      );
      if (skillIds) {
        await db.query('DELETE FROM public.course_skills WHERE course_id = $1', [c.id]);
        for (const skillId of skillIds) {
          await db.query('INSERT INTO public.course_skills (course_id, skill_id) VALUES ($1, $2)', [
            c.id,
            skillId,
          ]);
        }
      }
    });
  }

  async saveModule(m: CourseModule): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.course_modules
         (id, course_id, title, description, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [m.id, m.courseId, m.title, m.description ?? null, m.orderIndex, m.createdAt, m.updatedAt]
    );
  }

  async saveLesson(l: Lesson): Promise<void> {
    await this.pool.query(
      `INSERT INTO public.lessons
         (id, module_id, title, content_type, content_body, duration_minutes, order_index,
          prerequisite_lesson_id, is_free_preview, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        l.id,
        l.moduleId,
        l.title,
        l.contentType,
        l.contentBody,
        l.durationMinutes,
        l.orderIndex,
        l.prerequisiteLessonId ?? null,
        l.isFreePreview,
        l.createdAt,
        l.updatedAt,
      ]
    );
  }

  async saveEnrollment(e: CourseEnrollment): Promise<void> {
    await this.pool.query(ENROLLMENT_UPSERT, enrollmentParams(e));
  }

  async recordLessonCompletion(
    p: LessonProgress,
    e: CourseEnrollment,
    certificate?: CourseCertificate
  ): Promise<void> {
    await this.inTransaction(async (db) => {
      await db.query(
        `INSERT INTO public.lesson_progress (id, enrollment_id, lesson_id, status, completed_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.enrollmentId, p.lessonId, p.status, p.completedAt]
      );
      await db.query(ENROLLMENT_UPSERT, enrollmentParams(e));
      if (certificate) await db.query(CERTIFICATE_UPSERT, certificateParams(certificate));
    });
  }

  async saveCertificate(c: CourseCertificate): Promise<void> {
    await this.pool.query(CERTIFICATE_UPSERT, certificateParams(c));
  }

  async eraseLearner(profileId: string): Promise<void> {
    // Lesson progress cascades; the certificate's enrolment link is set to
    // NULL (00062) so its public verification survives.
    await this.pool.query('DELETE FROM public.course_enrollments WHERE user_id = $1', [profileId]);
  }
}

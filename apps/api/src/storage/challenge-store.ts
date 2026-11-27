import type pg from 'pg';
import type { AssessmentSession, Challenge } from '@talentsphere/domain';

/** One stored attempt at a challenge; the evidence it creates cites its id. */
export interface ChallengeSubmissionRecord {
  id: string;
  sessionId: string | null;
  challengeId: string;
  candidateId: string;
  language: string;
  code: string;
  status: 'submitted' | 'passed' | 'failed' | 'compilation_error' | 'runtime_error' | 'timed_out';
  score: number;
  passedCases: number;
  totalCases: number;
  createdAt: string;
}

/**
 * Coding challenges, assessment sessions and submissions (F-08, migrations
 * 00004 and 00063; plan TS-03, ADR-026). The API keeps challenges and
 * sessions in Maps as a read model (the arena, search, reputation and the AI
 * assistance block read them synchronously); this store is the write-through
 * source of truth the Maps are rebuilt from at boot. Writes go here first.
 * Submissions are written only: no route reads them back yet.
 */
export interface ChallengeStore {
  loadAll(): Promise<{ challenges: Challenge[]; sessions: AssessmentSession[] }>;
  saveChallenge(challenge: Challenge): Promise<void>;
  saveSession(session: AssessmentSession): Promise<void>;
  /** One transaction: the submission and, when it closes one, its session. */
  recordSubmission(
    submission: ChallengeSubmissionRecord,
    closedSession?: AssessmentSession
  ): Promise<void>;
  /** Erasure: the candidate's sessions and submissions (their code). */
  eraseCandidate(profileId: string): Promise<void>;
}

/** Memory mode keeps nothing across restarts; the Maps in server.ts are the data. */
export class MemoryChallengeStore implements ChallengeStore {
  async loadAll() {
    return { challenges: [], sessions: [] };
  }
  async saveChallenge(): Promise<void> {}
  async saveSession(): Promise<void> {}
  async recordSubmission(): Promise<void> {}
  async eraseCandidate(): Promise<void> {}
}

type Db = Pick<pg.PoolClient, 'query'>;
type Row = Record<string, any>;

const iso = (d: Date | string) => new Date(d).toISOString();

const SESSION_UPSERT = `INSERT INTO public.assessment_sessions
     (id, candidate_id, challenge_id, policy_mode, start_time, end_time, time_limit_seconds,
      submitted_at, status)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   ON CONFLICT (id) DO UPDATE SET
     end_time = EXCLUDED.end_time, submitted_at = EXCLUDED.submitted_at, status = EXCLUDED.status`;

const sessionParams = (s: AssessmentSession) => [
  s.id,
  s.candidateId,
  s.assessmentId,
  s.policyMode,
  s.startTime,
  s.endTime ?? null,
  s.timeLimitSeconds,
  s.submittedAt ?? null,
  s.status,
];

export class PgChallengeStore implements ChallengeStore {
  constructor(private readonly pool: pg.Pool) {}

  async loadAll() {
    const q = (sql: string) => this.pool.query<Row>(sql).then((r) => r.rows);
    const [challenges, skills, sessions] = await Promise.all([
      q('SELECT * FROM public.challenges ORDER BY created_at, id'),
      q('SELECT challenge_id, skill_id FROM public.challenge_skills ORDER BY created_at, id'),
      q('SELECT * FROM public.assessment_sessions ORDER BY start_time, id'),
    ]);
    const skillsBy = new Map<string, string[]>();
    for (const r of skills) {
      skillsBy.set(r.challenge_id, [...(skillsBy.get(r.challenge_id) ?? []), r.skill_id]);
    }
    return {
      challenges: challenges.map((r): Challenge => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        difficulty: r.difficulty,
        category: r.category,
        skillIds: skillsBy.get(r.id) ?? [],
        testCases: r.test_cases,
        timeLimitMs: r.time_limit_ms,
        memoryLimitMb: r.memory_limit_mb,
        policyMode: r.policy_mode,
        createdAt: iso(r.created_at),
        updatedAt: iso(r.updated_at),
      })),
      sessions: sessions.map((r): AssessmentSession => ({
        id: r.id,
        candidateId: r.candidate_id,
        assessmentId: r.challenge_id,
        policyMode: r.policy_mode,
        startTime: iso(r.start_time),
        endTime: r.end_time ? iso(r.end_time) : undefined,
        timeLimitSeconds: r.time_limit_seconds,
        submittedAt: r.submitted_at ? iso(r.submitted_at) : undefined,
        status: r.status,
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

  async saveChallenge(c: Challenge): Promise<void> {
    await this.inTransaction(async (db) => {
      await db.query(
        `INSERT INTO public.challenges
           (id, slug, title, description, difficulty, category, time_limit_ms, memory_limit_mb,
            policy_mode, test_cases, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)`,
        [
          c.id,
          c.slug,
          c.title,
          c.description,
          c.difficulty,
          c.category,
          c.timeLimitMs,
          c.memoryLimitMb,
          c.policyMode,
          JSON.stringify(c.testCases),
          c.createdAt,
          c.updatedAt,
        ]
      );
      for (const skillId of c.skillIds) {
        await db.query(
          'INSERT INTO public.challenge_skills (challenge_id, skill_id) VALUES ($1, $2)',
          [c.id, skillId]
        );
      }
    });
  }

  async saveSession(s: AssessmentSession): Promise<void> {
    await this.pool.query(SESSION_UPSERT, sessionParams(s));
  }

  async recordSubmission(
    s: ChallengeSubmissionRecord,
    closedSession?: AssessmentSession
  ): Promise<void> {
    await this.inTransaction(async (db) => {
      await db.query(
        `INSERT INTO public.challenge_submissions
           (id, session_id, challenge_id, candidate_id, language, code, status, score,
            passed_cases, total_cases, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          s.id,
          s.sessionId,
          s.challengeId,
          s.candidateId,
          s.language,
          s.code,
          s.status,
          s.score,
          s.passedCases,
          s.totalCases,
          s.createdAt,
        ]
      );
      if (closedSession) await db.query(SESSION_UPSERT, sessionParams(closedSession));
    });
  }

  async eraseCandidate(profileId: string): Promise<void> {
    await this.inTransaction(async (db) => {
      await db.query('DELETE FROM public.challenge_submissions WHERE candidate_id = $1', [
        profileId,
      ]);
      await db.query('DELETE FROM public.assessment_sessions WHERE candidate_id = $1', [profileId]);
    });
  }
}

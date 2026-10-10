import type pg from 'pg';
import {
  DomainError,
  type EmploymentReference,
  type Evidence,
  type Job,
  type JobApplication,
  type Notification,
  type NotificationPreferences,
  type Profile,
  type Role,
  type Skill,
  type VerifiedWorkHistory,
} from '@talentsphere/domain';

/**
 * Core-loop persistence (ADR-015).
 *
 * The career loop the product exists for — identity, organizations, jobs,
 * applications, evidence and verified work history — is persisted to the
 * relational schema in supabase/migrations. The API keeps its in-process Maps
 * as a read model: they are hydrated from these tables at boot and updated
 * only AFTER a write here has committed. A failed write therefore leaves the
 * read model untouched and fails the request; nothing is acknowledged that is
 * not durable.
 *
 * Constraint recorded in ADR-015: the read model makes the API a single
 * writer. Running two API replicas against one database would let their
 * read models diverge. Moving reads to SQL removes that constraint and is the
 * documented exit path once a second replica is needed.
 */

export interface StoredUser {
  id: string;
  email: string;
  roles: Role[];
  passwordHash: string;
  createdAt: string;
  status?: string;
}

export interface StoredOrganization {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  createdAt: string;
}

export interface StoredOrgMembership {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  createdAt: string;
}

/**
 * A reference as stored: the referee's one-time token is a bearer credential,
 * so only its SHA-256 is kept and it never appears in an API response.
 */
export type StoredReference = Omit<EmploymentReference, 'token'> & {
  tokenHash?: string;
  clientRequestId?: string;
};

export type StoredWorkHistory = VerifiedWorkHistory & { clientRequestId?: string };

/** One open corporate-email ownership challenge per work-history record. */
export interface EmailChallenge {
  workHistoryId: string;
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: string;
  createdAt: string;
}

/**
 * `base` (optimistic concurrency): the read-model value an update was derived
 * from. persist() refuses the write if that value has changed, or another
 * write to the same record is in flight, and Postgres re-checks the decisive
 * columns inside the transaction, so a check-then-act handler can never
 * silently overwrite a concurrent change (two state transitions racing, two
 * wrong email codes counted as one). Creates omit it.
 */
export type CoreOp =
  | { kind: 'user'; value: StoredUser }
  | { kind: 'profile'; value: Profile }
  | { kind: 'organization'; value: StoredOrganization }
  | { kind: 'membership'; value: StoredOrgMembership }
  | { kind: 'skill'; value: Skill }
  | { kind: 'job'; value: Job; base?: Job }
  | { kind: 'application'; value: JobApplication; base?: JobApplication }
  | { kind: 'evidence'; value: Evidence; skillIds?: string[]; base?: Evidence }
  | { kind: 'workHistory'; value: StoredWorkHistory; base?: StoredWorkHistory }
  | { kind: 'reference'; value: StoredReference; base?: StoredReference }
  | { kind: 'emailChallenge'; value: EmailChallenge; base?: EmailChallenge }
  | { kind: 'emailChallengeDelete'; workHistoryId: string; base?: EmailChallenge }
  /** Insert a notification, or (with base) record that it was read. */
  | { kind: 'notification'; value: Notification; base?: Notification }
  | { kind: 'notificationPreferences'; value: NotificationPreferences }
  /** Erasure: every notification addressed to this profile. */
  | { kind: 'notificationsDeleteForRecipient'; recipientId: string }
  /** Cascades to its references and email challenge (erasure). */
  | { kind: 'workHistoryDelete'; id: string }
  /** Cascades to evidence_skills and application_evidence (erasure). */
  | { kind: 'evidenceDelete'; id: string };

export interface CoreSnapshot {
  users: StoredUser[];
  profiles: Profile[];
  organizations: StoredOrganization[];
  memberships: StoredOrgMembership[];
  skills: Skill[];
  jobs: Job[];
  applications: JobApplication[];
  evidence: Array<{ value: Evidence; skillIds: string[] }>;
  workHistories: StoredWorkHistory[];
  references: StoredReference[];
  emailChallenges: EmailChallenge[];
  notifications: Notification[];
  notificationPreferences: NotificationPreferences[];
}

export interface CoreStore {
  /** True only when writes reach a database. */
  readonly durable: boolean;
  /** Reads every core row (boot hydration). */
  load(): Promise<CoreSnapshot>;
  /** Applies all ops in ONE transaction: all commit or none do. */
  commit(ops: CoreOp[]): Promise<void>;
}

export const emptySnapshot = (): CoreSnapshot => ({
  users: [],
  profiles: [],
  organizations: [],
  memberships: [],
  skills: [],
  jobs: [],
  applications: [],
  evidence: [],
  workHistories: [],
  references: [],
  emailChallenges: [],
  notifications: [],
  notificationPreferences: [],
});

/** STORAGE=memory: the Maps are the store. Explicitly not durable. */
export class MemoryCoreStore implements CoreStore {
  readonly durable = false;
  async load(): Promise<CoreSnapshot> {
    return emptySnapshot();
  }
  async commit(): Promise<void> {
    // Nothing to write: memory mode keeps state only in the read model.
  }
}

type Queryable = Pick<pg.PoolClient, 'query'>;

const iso = (v: unknown): string | undefined =>
  v === null || v === undefined ? undefined : v instanceof Date ? v.toISOString() : String(v);
const isoRequired = (v: unknown): string => iso(v) ?? new Date(0).toISOString();
const opt = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);
const nullable = <T>(v: T | undefined): T | null => (v === undefined ? null : v);

/** The error every lost optimistic-concurrency check surfaces as (409). */
export function concurrentModification(): DomainError {
  return new DomainError(
    'CONFLICT',
    'This record was changed by another request at the same time. Reload it and try again.',
    { reason: 'concurrent_modification' }
  );
}

/** rowCount 0 on a guarded write means the base row no longer matched. */
function assertGuardHeld(guarded: boolean, result: { rowCount: number | null }): void {
  if (guarded && result.rowCount !== 1) throw concurrentModification();
}

/**
 * Maps Postgres integrity errors to the API's error vocabulary, so a race
 * that slips past the read-model check (two concurrent sign-ups with the same
 * email) still surfaces as a 409, not a 500.
 */
function translatePgError(err: unknown): never {
  if (err instanceof DomainError) throw err;
  const e = err as { code?: string; constraint?: string; detail?: string };
  if (e?.code === '23505') {
    throw new DomainError('CONFLICT', 'This record conflicts with one that already exists.', {
      constraint: e.constraint,
    });
  }
  if (e?.code === '23503') {
    throw new DomainError(
      'VALIDATION_FAILED',
      'This record refers to something that does not exist.',
      {
        constraint: e.constraint,
      }
    );
  }
  if (e?.code === '23514') {
    throw new DomainError('VALIDATION_FAILED', 'This record violates a data rule.', {
      constraint: e.constraint,
    });
  }
  // Class 22 (data exception): a value the database cannot store — an
  // impossible date, a number out of range, an over-long string. Contract
  // validation should reject these first; this keeps any gap a 422, not a 500.
  if (typeof e?.code === 'string' && e.code.startsWith('22')) {
    throw new DomainError('VALIDATION_FAILED', 'A value in this request cannot be stored.', {
      sqlState: e.code,
    });
  }
  throw err;
}

async function writeOp(db: Queryable, op: CoreOp): Promise<void> {
  switch (op.kind) {
    case 'user': {
      const u = op.value;
      await db.query(
        `INSERT INTO public.users (id, email, password_hash, roles, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email, password_hash = EXCLUDED.password_hash,
           roles = EXCLUDED.roles, status = EXCLUDED.status, updated_at = now()`,
        [u.id, u.email, u.passwordHash, u.roles, u.status ?? 'active', u.createdAt]
      );
      return;
    }
    case 'profile': {
      const p = op.value;
      await db.query(
        `INSERT INTO public.profiles
           (id, user_id, full_name, headline, bio, location, avatar_url, privacy, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::profile_privacy, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name, headline = EXCLUDED.headline, bio = EXCLUDED.bio,
           location = EXCLUDED.location, avatar_url = EXCLUDED.avatar_url,
           privacy = EXCLUDED.privacy, updated_at = EXCLUDED.updated_at`,
        [
          p.id,
          p.userId,
          p.fullName,
          nullable(p.headline),
          nullable(p.bio),
          nullable(p.location),
          nullable(p.avatarUrl),
          p.privacy,
          p.createdAt,
          p.updatedAt,
        ]
      );
      return;
    }
    case 'organization': {
      const o = op.value;
      await db.query(
        `INSERT INTO public.organizations (id, name, slug, website, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, slug = EXCLUDED.slug, website = EXCLUDED.website,
           description = EXCLUDED.description, updated_at = now()`,
        [o.id, o.name, o.slug, nullable(o.website), nullable(o.description), o.createdAt]
      );
      return;
    }
    case 'membership': {
      const m = op.value;
      await db.query(
        `INSERT INTO public.org_memberships (id, org_id, user_id, role, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
        [m.id, m.orgId, m.userId, m.role, m.createdAt]
      );
      return;
    }
    case 'skill': {
      const s = op.value;
      await db.query(
        `INSERT INTO public.skills (id, slug, name, category, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug, name = EXCLUDED.name, category = EXCLUDED.category,
           description = EXCLUDED.description, updated_at = EXCLUDED.updated_at`,
        [s.id, s.slug, s.name, s.category, nullable(s.description), s.createdAt, s.updatedAt]
      );
      return;
    }
    case 'job': {
      const j = op.value;
      const result = await db.query(
        `INSERT INTO public.jobs
           (id, org_id, title, description, status, location, work_mode, job_type,
            salary_min_minor, salary_max_minor, salary_currency, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status,
           location = EXCLUDED.location, work_mode = EXCLUDED.work_mode, job_type = EXCLUDED.job_type,
           salary_min_minor = EXCLUDED.salary_min_minor, salary_max_minor = EXCLUDED.salary_max_minor,
           salary_currency = EXCLUDED.salary_currency, updated_at = EXCLUDED.updated_at
         WHERE $14::text IS NULL OR jobs.status::text = $14::text`,
        [
          j.id,
          j.orgId,
          j.title,
          j.description,
          j.status,
          j.location,
          nullable(j.workMode),
          nullable(j.jobType),
          j.salaryRange ? j.salaryRange.minMinor : null,
          j.salaryRange ? j.salaryRange.maxMinor : null,
          j.salaryRange ? j.salaryRange.currency : null,
          j.createdAt,
          j.updatedAt,
          op.base ? op.base.status : null,
        ]
      );
      assertGuardHeld(op.base !== undefined, result);
      await db.query('DELETE FROM public.job_skills WHERE job_id = $1', [j.id]);
      if (j.requiredSkillIds.length > 0) {
        await db.query(
          `INSERT INTO public.job_skills (job_id, skill_id, is_required)
           SELECT $1, unnest($2::uuid[]), true`,
          [j.id, j.requiredSkillIds]
        );
      }
      return;
    }
    case 'application': {
      const a = op.value;
      const result = await db.query(
        `INSERT INTO public.job_applications
           (id, job_id, candidate_id, status, cover_letter, is_referred, referral_id,
            submitted_at, withdrawn_at, rejected_at, rejection_reason, hired_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4::application_status, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, cover_letter = EXCLUDED.cover_letter,
           is_referred = EXCLUDED.is_referred, referral_id = EXCLUDED.referral_id,
           submitted_at = EXCLUDED.submitted_at, withdrawn_at = EXCLUDED.withdrawn_at,
           rejected_at = EXCLUDED.rejected_at, rejection_reason = EXCLUDED.rejection_reason,
           hired_at = EXCLUDED.hired_at, updated_at = EXCLUDED.updated_at
         WHERE $15::text IS NULL OR job_applications.status::text = $15::text`,
        [
          a.id,
          a.jobId,
          a.candidateId,
          a.status,
          nullable(a.coverLetter),
          a.isReferred ?? false,
          nullable(a.referralId),
          nullable(a.submittedAt),
          nullable(a.withdrawnAt),
          nullable(a.rejectedAt),
          nullable(a.rejectionReason),
          nullable(a.hiredAt),
          a.createdAt,
          a.updatedAt,
          op.base ? op.base.status : null,
        ]
      );
      assertGuardHeld(op.base !== undefined, result);
      await db.query('DELETE FROM public.application_evidence WHERE application_id = $1', [a.id]);
      if (a.attachedEvidenceIds.length > 0) {
        await db.query(
          `INSERT INTO public.application_evidence (application_id, evidence_id)
           SELECT $1, unnest($2::uuid[])`,
          [a.id, a.attachedEvidenceIds]
        );
      }
      return;
    }
    case 'evidence': {
      const e = op.value;
      const result = await db.query(
        `INSERT INTO public.evidence
           (id, subject_id, type, title, description, source, provenance, verification_level,
            verified_by, verified_at, status, conflict_state, recency_date, metadata, created_at, updated_at)
         VALUES ($1, $2, $3::evidence_type, $4, $5, $6, $7, $8::verification_level, $9, $10,
                 $11::evidence_status, $12, $13::date, $14::jsonb, $15, $16)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description, source = EXCLUDED.source,
           provenance = EXCLUDED.provenance, verification_level = EXCLUDED.verification_level,
           verified_by = EXCLUDED.verified_by, verified_at = EXCLUDED.verified_at,
           status = EXCLUDED.status, conflict_state = EXCLUDED.conflict_state,
           recency_date = EXCLUDED.recency_date, metadata = EXCLUDED.metadata,
           updated_at = EXCLUDED.updated_at
         WHERE $17::text IS NULL
            OR (evidence.status::text = $17::text AND evidence.verification_level::text = $18::text)`,
        [
          e.id,
          e.subjectId,
          e.type,
          e.title,
          e.description,
          e.source,
          e.provenance,
          e.verificationLevel,
          nullable(e.verifiedBy),
          nullable(e.verifiedAt),
          e.status,
          e.conflictState ?? 'none',
          e.recencyDate,
          JSON.stringify(e.metadata ?? {}),
          e.createdAt,
          e.updatedAt,
          op.base ? op.base.status : null,
          op.base ? op.base.verificationLevel : null,
        ]
      );
      assertGuardHeld(op.base !== undefined, result);
      if (op.skillIds !== undefined) {
        await db.query('DELETE FROM public.evidence_skills WHERE evidence_id = $1', [e.id]);
        if (op.skillIds.length > 0) {
          await db.query(
            `INSERT INTO public.evidence_skills (evidence_id, skill_id)
             SELECT $1, unnest($2::uuid[])`,
            [e.id, op.skillIds]
          );
        }
      }
      return;
    }
    case 'workHistory': {
      const h = op.value;
      const result = await db.query(
        `INSERT INTO public.verified_work_histories
           (id, candidate_id, company_name, company_id, title, employment_type, start_date, end_date,
            is_current, description, corporate_email, email_verified_at, verification_status,
            verification_score, badge_tier, skills, client_request_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10, $11, $12, $13, $14, $15,
                 $16::jsonb, $17, $18, $19)
         ON CONFLICT (id) DO UPDATE SET
           company_name = EXCLUDED.company_name, company_id = EXCLUDED.company_id,
           title = EXCLUDED.title, employment_type = EXCLUDED.employment_type,
           start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
           is_current = EXCLUDED.is_current, description = EXCLUDED.description,
           corporate_email = EXCLUDED.corporate_email, email_verified_at = EXCLUDED.email_verified_at,
           verification_status = EXCLUDED.verification_status,
           verification_score = EXCLUDED.verification_score, badge_tier = EXCLUDED.badge_tier,
           skills = EXCLUDED.skills, updated_at = EXCLUDED.updated_at
         WHERE $20::boolean IS NOT TRUE
            OR (verified_work_histories.verification_score = $21
                AND verified_work_histories.email_verified_at IS NOT DISTINCT FROM $22::timestamptz)`,
        [
          h.id,
          h.candidateId,
          h.companyName,
          nullable(h.companyId),
          h.title,
          h.employmentType,
          h.startDate,
          nullable(h.endDate),
          h.isCurrent,
          nullable(h.description),
          nullable(h.corporateEmail),
          nullable(h.emailVerifiedAt),
          h.verificationStatus,
          h.verificationScore,
          h.badgeTier,
          JSON.stringify(h.skills ?? []),
          nullable(h.clientRequestId),
          h.createdAt,
          h.updatedAt,
          op.base !== undefined,
          op.base ? op.base.verificationScore : null,
          op.base ? nullable(op.base.emailVerifiedAt) : null,
        ]
      );
      assertGuardHeld(op.base !== undefined, result);
      return;
    }
    case 'reference': {
      const r = op.value;
      const result = await db.query(
        `INSERT INTO public.employment_references
           (id, work_history_id, candidate_id, referee_id, referee_name, referee_email, relationship,
            status, confirm_dates, confirm_title, ratings, endorsed_skills, summary_notes, token_hash,
            client_request_id, requested_at, submitted_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14, $15,
                 $16, $17, $18, $19)
         ON CONFLICT (id) DO UPDATE SET
           referee_id = EXCLUDED.referee_id, status = EXCLUDED.status,
           confirm_dates = EXCLUDED.confirm_dates, confirm_title = EXCLUDED.confirm_title,
           ratings = EXCLUDED.ratings, endorsed_skills = EXCLUDED.endorsed_skills,
           summary_notes = EXCLUDED.summary_notes, token_hash = EXCLUDED.token_hash,
           submitted_at = EXCLUDED.submitted_at, updated_at = EXCLUDED.updated_at
         WHERE $20::text IS NULL OR employment_references.status::text = $20::text`,
        [
          r.id,
          r.workHistoryId,
          r.candidateId,
          nullable(r.refereeId),
          r.refereeName,
          r.refereeEmail,
          r.relationship,
          r.status,
          nullable(r.confirmDates),
          nullable(r.confirmTitle),
          JSON.stringify(r.ratings ?? {}),
          JSON.stringify(r.endorsedSkills ?? []),
          nullable(r.summaryNotes),
          nullable(r.tokenHash),
          nullable(r.clientRequestId),
          r.requestedAt,
          nullable(r.submittedAt),
          r.createdAt,
          r.updatedAt,
          op.base ? op.base.status : null,
        ]
      );
      assertGuardHeld(op.base !== undefined, result);
      return;
    }
    case 'emailChallenge': {
      const c = op.value;
      if (op.base) {
        // Counting a wrong guess: a plain UPDATE that only matches the exact
        // challenge state it was derived from, never an upsert that could
        // resurrect a consumed or replaced challenge.
        const result = await db.query(
          `UPDATE public.work_history_email_challenges
           SET attempts = $2
           WHERE work_history_id = $1 AND code_hash = $3 AND attempts = $4`,
          [c.workHistoryId, c.attempts, op.base.codeHash, op.base.attempts]
        );
        assertGuardHeld(true, result);
        return;
      }
      await db.query(
        `INSERT INTO public.work_history_email_challenges
           (work_history_id, email, code_hash, attempts, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (work_history_id) DO UPDATE SET
           email = EXCLUDED.email, code_hash = EXCLUDED.code_hash, attempts = EXCLUDED.attempts,
           expires_at = EXCLUDED.expires_at, created_at = EXCLUDED.created_at`,
        [c.workHistoryId, c.email, c.codeHash, c.attempts, c.expiresAt, c.createdAt]
      );
      return;
    }
    case 'emailChallengeDelete': {
      if (op.base) {
        // Consuming a challenge: only the exact state that was checked.
        const result = await db.query(
          `DELETE FROM public.work_history_email_challenges
           WHERE work_history_id = $1 AND code_hash = $2 AND attempts = $3`,
          [op.workHistoryId, op.base.codeHash, op.base.attempts]
        );
        assertGuardHeld(true, result);
        return;
      }
      await db.query(
        'DELETE FROM public.work_history_email_challenges WHERE work_history_id = $1',
        [op.workHistoryId]
      );
      return;
    }
    case 'notification': {
      const n = op.value;
      if (op.base) {
        // Marking read: a plain UPDATE that only matches the state it was
        // derived from — never an upsert that could resurrect an erased row.
        const result = await db.query(
          `UPDATE public.notifications SET is_read = $2, read_at = $3
           WHERE id = $1 AND is_read = $4`,
          [n.id, n.isRead, nullable(n.readAt ?? undefined), op.base.isRead]
        );
        assertGuardHeld(true, result);
        return;
      }
      await db.query(
        `INSERT INTO public.notifications
           (id, recipient_id, type, title, body, reference_type, reference_id, is_read, read_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          n.id,
          n.recipientId,
          n.type,
          n.title,
          n.body,
          nullable(n.referenceType ?? undefined),
          nullable(n.referenceId ?? undefined),
          n.isRead,
          nullable(n.readAt ?? undefined),
          n.createdAt,
        ]
      );
      return;
    }
    case 'notificationPreferences': {
      const p = op.value;
      await db.query(
        `INSERT INTO public.notification_preferences
           (id, user_id, allow_messages, allow_mentions, allow_applications, allow_course_updates,
            email_digest_frequency, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (user_id) DO UPDATE SET
           allow_messages = EXCLUDED.allow_messages, allow_mentions = EXCLUDED.allow_mentions,
           allow_applications = EXCLUDED.allow_applications,
           allow_course_updates = EXCLUDED.allow_course_updates,
           email_digest_frequency = EXCLUDED.email_digest_frequency,
           updated_at = EXCLUDED.updated_at`,
        [
          p.id,
          p.userId,
          p.allowMessages,
          p.allowMentions,
          p.allowApplications,
          p.allowCourseUpdates,
          p.emailDigestFrequency,
          p.createdAt,
          p.updatedAt,
        ]
      );
      return;
    }
    case 'notificationsDeleteForRecipient': {
      await db.query('DELETE FROM public.notifications WHERE recipient_id = $1', [op.recipientId]);
      return;
    }
    case 'workHistoryDelete': {
      await db.query('DELETE FROM public.verified_work_histories WHERE id = $1', [op.id]);
      return;
    }
    case 'evidenceDelete': {
      await db.query('DELETE FROM public.evidence WHERE id = $1', [op.id]);
      return;
    }
  }
}

/**
 * Write order inside one transaction: parents before children, so foreign
 * keys hold no matter what order a handler listed its ops in.
 */
const WRITE_ORDER: Record<CoreOp['kind'], number> = {
  user: 0,
  profile: 1,
  skill: 2,
  organization: 3,
  membership: 4,
  job: 5,
  evidence: 6,
  application: 7,
  workHistory: 8,
  reference: 9,
  emailChallenge: 10,
  emailChallengeDelete: 10,
  notification: 10,
  notificationPreferences: 10,
  // Deletes run last so an upsert in the same batch cannot re-reference them.
  workHistoryDelete: 11,
  evidenceDelete: 11,
  notificationsDeleteForRecipient: 11,
};

export class PgCoreStore implements CoreStore {
  readonly durable = true;

  constructor(private readonly pool: pg.Pool) {}

  async commit(ops: CoreOp[]): Promise<void> {
    if (ops.length === 0) return;
    const ordered = [...ops].sort((a, b) => WRITE_ORDER[a.kind] - WRITE_ORDER[b.kind]);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const op of ordered) {
        await writeOp(client, op);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      translatePgError(err);
    } finally {
      client.release();
    }
  }

  async load(): Promise<CoreSnapshot> {
    const q = (sql: string) => this.pool.query(sql).then((r) => r.rows as Record<string, any>[]);
    const [
      users,
      profiles,
      organizations,
      memberships,
      skills,
      jobs,
      jobSkills,
      applications,
      applicationEvidence,
      evidence,
      evidenceSkills,
      workHistories,
      references,
      emailChallenges,
      notifications,
      notificationPreferences,
    ] = await Promise.all([
      q('SELECT * FROM public.users ORDER BY created_at, id'),
      q('SELECT * FROM public.profiles ORDER BY created_at, id'),
      q('SELECT * FROM public.organizations ORDER BY created_at, id'),
      q('SELECT * FROM public.org_memberships ORDER BY created_at, id'),
      q('SELECT * FROM public.skills ORDER BY created_at, id'),
      q('SELECT * FROM public.jobs ORDER BY created_at, id'),
      q('SELECT job_id, skill_id FROM public.job_skills ORDER BY created_at'),
      q('SELECT * FROM public.job_applications ORDER BY created_at, id'),
      q('SELECT application_id, evidence_id FROM public.application_evidence ORDER BY created_at'),
      q(
        `SELECT *, to_char(recency_date, 'YYYY-MM-DD') AS recency_date_text
           FROM public.evidence ORDER BY created_at, id`
      ),
      q('SELECT evidence_id, skill_id FROM public.evidence_skills ORDER BY created_at'),
      q(
        `SELECT *, to_char(start_date, 'YYYY-MM-DD') AS start_date_text,
                to_char(end_date, 'YYYY-MM-DD') AS end_date_text
           FROM public.verified_work_histories ORDER BY created_at, id`
      ),
      q('SELECT * FROM public.employment_references ORDER BY created_at, id'),
      q('SELECT * FROM public.work_history_email_challenges'),
      q('SELECT * FROM public.notifications ORDER BY created_at, id'),
      q('SELECT * FROM public.notification_preferences ORDER BY created_at, id'),
    ]);

    const group = (rows: Record<string, any>[], key: string, value: string) => {
      const out = new Map<string, string[]>();
      for (const row of rows) {
        const list = out.get(row[key]) ?? [];
        list.push(row[value]);
        out.set(row[key], list);
      }
      return out;
    };
    const skillsByJob = group(jobSkills, 'job_id', 'skill_id');
    const evidenceByApplication = group(applicationEvidence, 'application_id', 'evidence_id');
    const skillsByEvidence = group(evidenceSkills, 'evidence_id', 'skill_id');

    return {
      users: users.map((r) => ({
        id: r.id,
        email: r.email,
        roles: r.roles as Role[],
        passwordHash: r.password_hash,
        status: r.status,
        createdAt: isoRequired(r.created_at),
      })),
      profiles: profiles.map((r) => ({
        id: r.id,
        userId: r.user_id,
        fullName: r.full_name,
        headline: opt(r.headline),
        bio: opt(r.bio),
        location: opt(r.location),
        avatarUrl: opt(r.avatar_url),
        privacy: r.privacy,
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      organizations: organizations.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        website: opt(r.website),
        description: opt(r.description),
        createdAt: isoRequired(r.created_at),
      })),
      memberships: memberships.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        userId: r.user_id,
        role: r.role,
        createdAt: isoRequired(r.created_at),
      })),
      skills: skills.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        category: r.category,
        description: opt(r.description),
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      jobs: jobs.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        title: r.title,
        description: r.description,
        location: r.location ?? '',
        workMode: opt(r.work_mode),
        jobType: opt(r.job_type),
        status: r.status,
        requiredSkillIds: skillsByJob.get(r.id) ?? [],
        salaryRange:
          r.salary_min_minor !== null && r.salary_max_minor !== null
            ? {
                minMinor: Number(r.salary_min_minor),
                maxMinor: Number(r.salary_max_minor),
                currency: String(r.salary_currency).trim(),
              }
            : undefined,
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      applications: applications.map((r) => ({
        id: r.id,
        jobId: r.job_id,
        candidateId: r.candidate_id,
        status: r.status,
        coverLetter: opt(r.cover_letter),
        attachedEvidenceIds: evidenceByApplication.get(r.id) ?? [],
        isReferred: r.is_referred || undefined,
        referralId: opt(r.referral_id),
        submittedAt: iso(r.submitted_at),
        withdrawnAt: iso(r.withdrawn_at),
        rejectedAt: iso(r.rejected_at),
        rejectionReason: opt(r.rejection_reason),
        hiredAt: iso(r.hired_at),
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      evidence: evidence.map((r) => ({
        value: {
          id: r.id,
          subjectId: r.subject_id,
          type: r.type,
          title: r.title,
          description: r.description ?? '',
          source: r.source ?? '',
          provenance: r.provenance ?? '',
          verificationLevel: r.verification_level,
          verifiedBy: opt(r.verified_by),
          verifiedAt: iso(r.verified_at),
          status: r.status,
          conflictState: r.conflict_state,
          recencyDate: r.recency_date_text,
          metadata: r.metadata ?? {},
          createdAt: isoRequired(r.created_at),
          updatedAt: isoRequired(r.updated_at),
        },
        skillIds: skillsByEvidence.get(r.id) ?? [],
      })),
      workHistories: workHistories.map((r) => ({
        id: r.id,
        candidateId: r.candidate_id,
        companyName: r.company_name,
        companyId: opt(r.company_id),
        title: r.title,
        employmentType: r.employment_type,
        startDate: r.start_date_text,
        endDate: opt(r.end_date_text),
        isCurrent: r.is_current,
        description: opt(r.description),
        corporateEmail: opt(r.corporate_email),
        emailVerifiedAt: iso(r.email_verified_at),
        verificationStatus: r.verification_status,
        verificationScore: Number(r.verification_score),
        badgeTier: r.badge_tier,
        skills: r.skills ?? [],
        clientRequestId: opt(r.client_request_id),
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      references: references.map((r) => ({
        id: r.id,
        workHistoryId: r.work_history_id,
        candidateId: r.candidate_id,
        refereeId: opt(r.referee_id),
        refereeName: r.referee_name,
        refereeEmail: r.referee_email,
        relationship: r.relationship,
        status: r.status,
        confirmDates: opt(r.confirm_dates),
        confirmTitle: opt(r.confirm_title),
        ratings: r.ratings && Object.keys(r.ratings).length > 0 ? r.ratings : undefined,
        endorsedSkills: r.endorsed_skills ?? [],
        summaryNotes: opt(r.summary_notes),
        tokenHash: opt(r.token_hash)?.trim(),
        clientRequestId: opt(r.client_request_id),
        requestedAt: isoRequired(r.requested_at),
        submittedAt: iso(r.submitted_at),
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
      emailChallenges: emailChallenges.map((r) => ({
        workHistoryId: r.work_history_id,
        email: r.email,
        codeHash: String(r.code_hash).trim(),
        attempts: Number(r.attempts),
        expiresAt: isoRequired(r.expires_at),
        createdAt: isoRequired(r.created_at),
      })),
      notifications: notifications.map((r) => ({
        id: r.id,
        recipientId: r.recipient_id,
        type: r.type,
        title: r.title,
        body: r.body,
        referenceType: r.reference_type ?? null,
        referenceId: r.reference_id ?? null,
        isRead: r.is_read,
        readAt: iso(r.read_at) ?? null,
        createdAt: isoRequired(r.created_at),
      })),
      notificationPreferences: notificationPreferences.map((r) => ({
        id: r.id,
        userId: r.user_id,
        allowMessages: r.allow_messages,
        allowMentions: r.allow_mentions,
        allowApplications: r.allow_applications,
        allowCourseUpdates: r.allow_course_updates,
        emailDigestFrequency: r.email_digest_frequency,
        createdAt: isoRequired(r.created_at),
        updatedAt: isoRequired(r.updated_at),
      })),
    };
  }
}

/**
 * Regression suite for authorization defects found in the 2026-10-10 audit
 * (docs/reports/IMPROVEMENT_PROGRAM_2026-10-10.md). Each test reproduces the
 * original exploit and asserts it is now refused.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { DURABLE_ROUTES } from '../../apps/api/src/durability.js';

type Json = Record<string, any>;

const boot = (overrides: Record<string, string> = {}) =>
  buildApp({
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    RATE_LIMIT_MAX_REQUESTS: '100000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: '1000',
    ...overrides,
  } as never);

async function call(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PATCH',
  url: string,
  token?: string,
  payload?: unknown
): Promise<{ status: number; body: Json; headers: Record<string, unknown> }> {
  const res = await app.inject({
    method,
    url,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    payload: payload as never,
  });
  return {
    status: res.statusCode,
    body: res.body ? JSON.parse(res.body) : {},
    headers: res.headers as Record<string, unknown>,
  };
}

async function register(app: FastifyInstance, email: string, role = 'candidate') {
  const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
    email,
    password: 'a-long-enough-passphrase',
    fullName: email.split('@')[0],
    role,
  });
  expect(res.status).toBe(201);
  return res.body as { token: string; user: { id: string }; profile: { id: string } };
}

async function orgWithJob(app: FastifyInstance, token: string, slug: string) {
  const org = await call(app, 'POST', '/api/v1/organizations', token, { name: slug, slug });
  expect(org.status).toBe(201);
  const job = await call(app, 'POST', '/api/v1/jobs', token, {
    orgId: org.body.organization.id,
    title: 'Backend Engineer',
    description: 'Build and run the API platform.',
    location: 'Remote',
  });
  expect(job.status).toBe(201);
  return { orgId: org.body.organization.id as string, jobId: job.body.job.id as string };
}

describe('SEC: tenant isolation on job postings (BR-12)', () => {
  let app: FastifyInstance;
  let alice: Json;
  let mallory: Json;
  let aliceJob: Json;

  beforeAll(async () => {
    app = await boot();
    alice = await register(app, 'alice@acme.example', 'recruiter');
    mallory = await register(app, 'mallory@rival.example', 'recruiter');
    aliceJob = await orgWithJob(app, alice.token, 'acme');
    await orgWithJob(app, mallory.token, 'rival');
  });
  afterAll(() => app.close());

  it("refuses a recruiter changing another company's job status", async () => {
    // Exploit: the handler used to pass the JOB's orgId as the actor's, so
    // the domain's "same organization" check always passed.
    const res = await call(app, 'PATCH', `/api/v1/jobs/${aliceJob.jobId}/status`, mallory.token, {
      status: 'archived',
    });
    expect(res.status).toBe(403);
    const still = await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, alice.token);
    expect(still.body.job.status).toBe('draft');
  });

  it('hides unpublished postings from everyone outside the hiring organization', async () => {
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`)).status).toBe(404);
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, mallory.token)).status).toBe(
      404
    );
    expect((await call(app, 'GET', `/api/v1/jobs/${aliceJob.jobId}`, alice.token)).status).toBe(
      200
    );
  });

  it("refuses listing another organization's jobs", async () => {
    const res = await call(
      app,
      'GET',
      `/api/v1/organizations/${aliceJob.orgId}/jobs`,
      mallory.token
    );
    expect(res.status).toBe(403);
    const own = await call(app, 'GET', `/api/v1/organizations/${aliceJob.orgId}/jobs`, alice.token);
    expect(own.status).toBe(200);
    expect(own.body.jobs).toHaveLength(1);
  });
});

describe('SEC: organization membership grants', () => {
  let app: FastifyInstance;
  let owner: Json;
  let colleague: Json;
  let orgId: string;

  beforeAll(async () => {
    app = await boot();
    owner = await register(app, 'owner@acme.example', 'recruiter');
    colleague = await register(app, 'colleague@acme.example', 'recruiter');
    orgId = (await orgWithJob(app, owner.token, 'acme-members')).orgId;
  });
  afterAll(() => app.close());

  it('does not let ownership be granted through the member endpoint', async () => {
    const res = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
      role: 'owner',
    });
    expect(res.status).toBe(400);
  });

  it('refuses unknown accounts and duplicate memberships', async () => {
    const unknown = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: '00000000-0000-4000-a000-0000000000ff',
    });
    expect(unknown.status).toBe(404);

    const first = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
      role: 'recruiter',
    });
    expect(first.status).toBe(201);
    const again = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, owner.token, {
      userId: colleague.user.id,
    });
    expect(again.status).toBe(409);
  });

  it('only owners and admins may add members', async () => {
    const outsider = await register(app, 'outsider@acme.example', 'recruiter');
    const res = await call(app, 'POST', `/api/v1/organizations/${orgId}/members`, colleague.token, {
      userId: outsider.user.id,
    });
    expect(res.status).toBe(403);
  });
});

describe('SEC: account state is enforced on every request, not at token expiry', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    app = await boot();
    adminId = '00000000-0000-4000-a000-00000000ad99';
    adminToken = createSessionToken(adminId, 'root@talentsphere.internal', ['platform_admin']);
  });
  afterAll(() => app.close());

  it('confines a suspended account to its appeal and data-rights routes', async () => {
    const user = await register(app, 'suspended@example.com');
    const suspend = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${user.user.id}/status`,
      adminToken,
      {
        status: 'suspended',
        reason: 'Under investigation for spam',
      }
    );
    expect(suspend.status).toBe(200);

    // The token issued before the suspension no longer opens normal routes...
    const blocked = await call(app, 'POST', '/api/v1/evidence', user.token, {
      type: 'project',
      title: 'Anything',
      description: '',
      source: 'x',
      provenance: 'x',
      recencyDate: '2026-01-01',
    });
    expect(blocked.status).toBe(403);
    // ...but the governed-review path stays open (SSOT: restrictions require appeal).
    expect((await call(app, 'GET', '/api/v1/moderation/reports/my', user.token)).status).toBe(200);
    expect((await call(app, 'GET', '/api/v1/profile/me', user.token)).status).toBe(200);

    const login = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'suspended@example.com',
      password: 'a-long-enough-passphrase',
    });
    expect(login.status).toBe(200);
    expect(login.body.user.status).toBe('suspended');
  });

  it('applies a role change to existing sessions immediately', async () => {
    const recruiter = await register(app, 'demoted@example.com', 'recruiter');
    const org = await call(app, 'POST', '/api/v1/organizations', recruiter.token, {
      name: 'Demo',
      slug: 'demoted-org',
    });
    const demote = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${recruiter.user.id}/roles`,
      adminToken,
      {
        roles: ['candidate'],
      }
    );
    expect(demote.status).toBe(200);

    const post = await call(app, 'POST', '/api/v1/jobs', recruiter.token, {
      orgId: org.body.organization.id,
      title: 'Should not post',
      description: 'The poster lost the recruiter role.',
      location: 'Remote',
    });
    expect(post.status).toBe(403);
  });

  it('rejects roles the domain does not define', async () => {
    const user = await register(app, 'roles@example.com');
    const res = await call(app, 'PATCH', `/api/v1/admin/users/${user.user.id}/roles`, adminToken, {
      roles: ['superuser'],
    });
    expect(res.status).toBe(400);
  });
});

describe('SEC: credential endpoints have their own rate limit', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await boot({ AUTH_RATE_LIMIT_MAX_REQUESTS: '3' });
    await register(app, 'target@example.com');
  });
  afterAll(() => app.close());

  it('throttles repeated guesses against one account', async () => {
    const guess = () =>
      call(app, 'POST', '/api/v1/auth/login', undefined, {
        email: 'target@example.com',
        password: 'wrong-guess',
      });
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await guess()).status);
    expect(statuses).toEqual([401, 401, 401, 429]);

    // A different account from the same client is not locked out with it.
    const other = await call(app, 'POST', '/api/v1/auth/login', undefined, {
      email: 'someone-else@example.com',
      password: 'whatever',
    });
    expect(other.status).toBe(401);
  });
});

describe('SEC: evidence writes are all-or-nothing', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot();
  });
  afterAll(() => app.close());

  it('stores nothing when a referenced skill does not exist', async () => {
    const user = await register(app, 'atomic@example.com');
    const res = await call(app, 'POST', '/api/v1/evidence', user.token, {
      type: 'project',
      title: 'Half-written evidence',
      description: '',
      source: 'x',
      provenance: 'x',
      recencyDate: '2026-01-01',
      skillIds: ['00000000-0000-4000-a000-0000000000aa'],
    });
    expect(res.status).toBe(404);
    const mine = await call(app, 'GET', '/api/v1/evidence/mine', user.token);
    expect(mine.body.evidence).toHaveLength(0);
  });
});

describe('Durability is stated, not implied (ADR-015)', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot();
    await app.ready();
  });
  afterAll(() => app.close());

  it('every route in the durable registry exists', () => {
    for (const key of DURABLE_ROUTES) {
      const [method, url] = key.split(' ');
      expect(app.hasRoute({ method: method as never, url }), key).toBe(true);
    }
  });

  it('marks every API response ephemeral when the server runs without a database', async () => {
    const res = await call(app, 'GET', '/api/v1/jobs');
    expect(res.headers['x-talentsphere-durability']).toBe('ephemeral');
  });
});

describe('SEC: interview assessments are scoped to the hiring team (BR-12, BR-173, BR-176)', () => {
  let app: FastifyInstance;
  let victim: Json; // recruiter at acme
  let attacker: Json; // recruiter at rival
  let candidate: Json;
  let acme: Json;
  let rival: Json;
  let applicationId: string;
  let questionId: string;
  let assessmentId: string;

  const scorecard = {
    technicalCorrectness: 5,
    communication: 5,
    problemSolving: 5,
    codeQuality: 5,
    recommendation: 'strong_yes',
    strengths: 'Clear, careful reasoning.',
    areasForImprovement: 'None noted.',
  };

  beforeAll(async () => {
    app = await boot();
    victim = await register(app, 'victim@acme.example', 'recruiter');
    attacker = await register(app, 'attacker@rival.example', 'recruiter');
    candidate = await register(app, 'cand@example.org');
    acme = await orgWithJob(app, victim.token, 'acme-int');
    rival = await orgWithJob(app, attacker.token, 'rival-int');
    await call(app, 'PATCH', `/api/v1/jobs/${acme.jobId}/status`, victim.token, {
      status: 'published',
    });
    const applied = await call(
      app,
      'POST',
      `/api/v1/jobs/${acme.jobId}/apply`,
      candidate.token,
      {}
    );
    applicationId = applied.body.application.id;
    for (const targetState of ['in_review', 'shortlisted']) {
      await call(app, 'POST', `/api/v1/applications/${applicationId}/transition`, victim.token, {
        applicationId,
        targetState,
      });
    }
    const q = await call(app, 'POST', '/api/v1/interviews/questions', victim.token, {
      orgId: acme.orgId,
      title: 'Design a rate limiter',
      statement: 'Token bucket, per key.',
      category: 'code',
      difficulty: 'medium',
      durationMinutes: 30,
      expectedCompetencies: ['Systems'],
      testCases: [
        { input: 'allow(1)', expectedOutput: 'true', isHidden: false },
        { input: 'SECRET-HIDDEN-INPUT', expectedOutput: 'SECRET-HIDDEN-OUTPUT', isHidden: true },
      ],
    });
    expect(q.status).toBe(201);
    questionId = q.body.question.id;
    const scheduled = await call(app, 'POST', '/api/v1/interviews/assessments', victim.token, {
      orgId: acme.orgId,
      applicationId,
      candidateProfileId: candidate.profile.id,
      interviewerUserId: victim.user.id,
      title: 'Technical round',
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 45,
      questionIds: [questionId],
    });
    expect(scheduled.status).toBe(201);
    assessmentId = scheduled.body.assessment.id;
  });
  afterAll(() => app.close());

  it("refuses linking another company's application to an assessment", async () => {
    // The original exploit: rival schedules its own assessment pointing at
    // acme's application, then scores it to move acme's pipeline.
    const res = await call(app, 'POST', '/api/v1/interviews/assessments', attacker.token, {
      orgId: rival.orgId,
      applicationId,
      candidateProfileId: candidate.profile.id,
      interviewerUserId: attacker.user.id,
      title: 'Hijack',
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 30,
      questionIds: [],
    });
    expect(res.status).toBe(422);
    const app_ = await call(app, 'GET', `/api/v1/applications/${applicationId}`, victim.token);
    expect(app_.body.application.status).toBe('shortlisted');
  });

  it('refuses an interviewer from outside the hiring organization', async () => {
    const res = await call(app, 'POST', '/api/v1/interviews/assessments', victim.token, {
      orgId: acme.orgId,
      candidateProfileId: candidate.profile.id,
      interviewerUserId: attacker.user.id,
      title: 'Outsider on the panel',
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 30,
      questionIds: [],
    });
    expect(res.status).toBe(422);
  });

  it('refuses an outsider joining, consenting, running code, ending, scoring or reviewing', async () => {
    const base = `/api/v1/interviews/assessments/${assessmentId}`;
    const attempts = [
      await call(app, 'GET', base, attacker.token),
      await call(app, 'POST', `${base}/join`, attacker.token),
      await call(app, 'POST', `${base}/consent`, attacker.token, { consent: true }),
      await call(app, 'POST', `${base}/code`, attacker.token, {
        code: 'x',
        language: 'javascript',
        questionId,
      }),
      await call(app, 'POST', `${base}/scorecard`, attacker.token, scorecard),
      await call(app, 'POST', `${base}/ai-feedback`, attacker.token),
      await call(app, 'POST', `${base}/review`, attacker.token),
      await call(app, 'POST', `${base}/end`, attacker.token, { resolution: 'cancelled' }),
    ];
    expect(attempts.map((a) => a.status)).toEqual([403, 403, 403, 403, 403, 403, 403, 403]);
    const after = await call(app, 'GET', base, victim.token);
    expect(after.body.assessment.status).toBe('scheduled');
  });

  it('never shows the candidate hidden test inputs or expected outputs', async () => {
    const res = await call(
      app,
      'POST',
      `/api/v1/interviews/assessments/${assessmentId}/code`,
      candidate.token,
      {
        code: 'function limit() { return true; }',
        language: 'javascript',
        questionId,
      }
    );
    expect(res.status).toBe(200);
    expect(res.body.result.total).toBe(2);
    expect(JSON.stringify(res.body)).not.toContain('SECRET-HIDDEN');
  });

  it("refuses running another company's private question inside this assessment", async () => {
    const theirs = await call(app, 'POST', '/api/v1/interviews/questions', attacker.token, {
      orgId: rival.orgId,
      title: 'Rival private question',
      statement: 'Private.',
      category: 'code',
      difficulty: 'easy',
      durationMinutes: 10,
      expectedCompetencies: ['x'],
      testCases: [{ input: 'RIVAL-PRIVATE', expectedOutput: 'RIVAL-ANSWER', isHidden: true }],
    });
    expect(theirs.status).toBe(201);
    const res = await call(
      app,
      'POST',
      `/api/v1/interviews/assessments/${assessmentId}/code`,
      victim.token,
      {
        code: 'x',
        language: 'javascript',
        questionId: theirs.body.question.id,
      }
    );
    expect(res.status).toBe(404);
  });

  it('a scorecard never resurrects a rejected application (ATS state machine)', async () => {
    const other = await register(app, 'rejected-cand@example.org');
    const applied = await call(app, 'POST', `/api/v1/jobs/${acme.jobId}/apply`, other.token, {});
    const rejectedId = applied.body.application.id;
    const rejected = await call(
      app,
      'POST',
      `/api/v1/applications/${rejectedId}/transition`,
      victim.token,
      { applicationId: rejectedId, targetState: 'rejected', reason: 'Not a fit' }
    );
    expect(rejected.status).toBe(200);
    const scheduled = await call(app, 'POST', '/api/v1/interviews/assessments', victim.token, {
      orgId: acme.orgId,
      applicationId: rejectedId,
      candidateProfileId: other.profile.id,
      interviewerUserId: victim.user.id,
      title: 'Late round',
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 30,
      questionIds: [],
    });
    expect(scheduled.status).toBe(201);
    const base = `/api/v1/interviews/assessments/${scheduled.body.assessment.id}`;
    await call(app, 'POST', `${base}/join`, other.token);
    await call(app, 'POST', `${base}/end`, victim.token, { resolution: 'completed' });
    const scored = await call(app, 'POST', `${base}/scorecard`, victim.token, scorecard);
    expect(scored.status).toBe(201);
    const after = await call(app, 'GET', `/api/v1/applications/${rejectedId}`, victim.token);
    expect(after.body.application.status).toBe('rejected');
  });

  it('lets the hiring team score, which moves its own application to interviewing', async () => {
    const base = `/api/v1/interviews/assessments/${assessmentId}`;
    expect((await call(app, 'POST', `${base}/join`, candidate.token)).status).toBe(200);
    expect(
      (await call(app, 'POST', `${base}/end`, victim.token, { resolution: 'completed' })).status
    ).toBe(200);
    const res = await call(
      app,
      'POST',
      `/api/v1/interviews/assessments/${assessmentId}/scorecard`,
      victim.token,
      scorecard
    );
    expect(res.status).toBe(201);
    const app_ = await call(app, 'GET', `/api/v1/applications/${applicationId}`, victim.token);
    expect(app_.body.application.status).toBe('interviewing');
  });
});

describe('SEC: a check-then-act write cannot be raced (optimistic concurrency)', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot();
  });
  afterAll(() => app.close());

  it('counts every evaluated wrong email code, however many arrive at once', async () => {
    const cand = await register(app, 'racer@example.org');
    const wh = await call(app, 'POST', '/api/v1/candidates/work-history', cand.token, {
      companyName: 'Acme Corp',
      title: 'Engineer',
      startDate: '2020-01-01',
      isCurrent: true,
    });
    const id = wh.body.workHistory.id;
    const url = `/api/v1/candidates/work-history/${id}/verify-email`;
    await call(app, 'POST', url, cand.token, { corporateEmail: 'me@acme-corp.io' });
    const jobs = await call(app, 'GET', '/api/v1/internal/worker-jobs');
    const code: string = jobs.body.jobs.find(
      (j: Json) => j.type === 'work_history.email_verification_requested'
    ).payload.code;
    const wrong = (n: number) => String((Number(code) + n) % 1_000_000).padStart(6, '0');

    const burst = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        call(app, 'POST', url, cand.token, {
          corporateEmail: 'me@acme-corp.io',
          verificationCode: wrong(i + 1),
        })
      )
    );
    const evaluated = burst.filter((r) => r.status === 422).length;
    // Each response is "wrong" (422, counted), "busy" (409, not evaluated) or
    // "locked" (429). No more than the limit can ever be evaluated.
    expect(evaluated).toBeLessThanOrEqual(5);
    expect(burst.every((r) => [409, 422, 429].includes(r.status))).toBe(true);

    // Exhaust the remaining attempts one at a time; the right code is then refused.
    for (let i = evaluated; i < 5; i++) {
      const r = await call(app, 'POST', url, cand.token, {
        corporateEmail: 'me@acme-corp.io',
        verificationCode: wrong(100 + i),
      });
      expect(r.status).toBe(422);
    }
    const locked = await call(app, 'POST', url, cand.token, {
      corporateEmail: 'me@acme-corp.io',
      verificationCode: code,
    });
    expect(locked.status).toBe(429);
  });

  it('acknowledges only one of two conflicting application transitions', async () => {
    const rec = await register(app, 'race-rec@acme.example', 'recruiter');
    const cand = await register(app, 'race-cand@example.org');
    const { jobId } = await orgWithJob(app, rec.token, 'race-org');
    await call(app, 'PATCH', `/api/v1/jobs/${jobId}/status`, rec.token, { status: 'published' });
    const applied = await call(app, 'POST', `/api/v1/jobs/${jobId}/apply`, cand.token, {});
    const id = applied.body.application.id;
    for (const s of ['in_review', 'shortlisted', 'interviewing', 'offered']) {
      await call(app, 'POST', `/api/v1/applications/${id}/transition`, rec.token, {
        applicationId: id,
        targetState: s,
      });
    }
    const [hire, withdraw] = await Promise.all([
      call(app, 'POST', `/api/v1/applications/${id}/transition`, rec.token, {
        applicationId: id,
        targetState: 'hired',
      }),
      call(app, 'POST', `/api/v1/applications/${id}/transition`, cand.token, {
        applicationId: id,
        targetState: 'withdrawn',
      }),
    ]);
    const winners = [hire, withdraw].filter((r) => r.status === 200);
    expect(winners).toHaveLength(1);
    const final = await call(app, 'GET', `/api/v1/applications/${id}`, rec.token);
    expect(final.body.application.status).toBe(winners[0].body.application.status);
  });
});

describe('Input the database cannot store is rejected as invalid (400), never a 500', () => {
  let app: FastifyInstance;
  let cand: Json;
  let rec: Json;
  let orgId: string;
  beforeAll(async () => {
    app = await boot();
    cand = await register(app, 'dates@example.org');
    rec = await register(app, 'salary@acme.example', 'recruiter');
    orgId = (await orgWithJob(app, rec.token, 'salary-org')).orgId;
  });
  afterAll(() => app.close());

  it('rejects impossible calendar dates', async () => {
    const wh = await call(app, 'POST', '/api/v1/candidates/work-history', cand.token, {
      companyName: 'Acme',
      title: 'Eng',
      startDate: '2023-02-30',
      isCurrent: true,
    });
    expect(wh.status).toBe(400);
    const ev = await call(app, 'POST', '/api/v1/evidence', cand.token, {
      type: 'project',
      title: 'Thing',
      description: 'd',
      source: 's',
      provenance: 'p',
      recencyDate: 'not-a-date',
    });
    expect(ev.status).toBe(400);
  });

  it('rejects an email longer than RFC 5321 allows', async () => {
    const res = await call(app, 'POST', '/api/v1/auth/register', undefined, {
      email: `${'a'.repeat(250)}@example.com`,
      password: 'a-long-enough-passphrase',
      fullName: 'Long Email',
    });
    expect(res.status).toBe(400);
  });

  it('rejects an absurd salary and de-duplicates repeated skill ids', async () => {
    const huge = await call(app, 'POST', '/api/v1/jobs', rec.token, {
      orgId,
      title: 'Job A',
      description: 'A long description',
      location: 'Remote',
      salaryMinMinor: 1e20,
      salaryMaxMinor: 1e20,
    });
    expect(huge.status).toBe(400);
    const skill = '10000000-0000-4000-a000-000000000001';
    const dup = await call(app, 'POST', '/api/v1/jobs', rec.token, {
      orgId,
      title: 'Job B',
      description: 'A long description',
      location: 'Remote',
      requiredSkillIds: [skill, skill],
    });
    expect(dup.status).toBe(201);
    expect(dup.body.job.requiredSkillIds).toEqual([skill]);
  });
});

describe('SEC: changing a password ends every other session', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await boot({ AUTH_RATE_LIMIT_MAX_REQUESTS: '3' });
  });
  afterAll(() => app.close());

  const login = async (email: string, password: string) =>
    call(app, 'POST', '/api/v1/auth/login', undefined, { email, password });

  it('refuses a wrong current password and changes nothing', async () => {
    const acct = await register(app, 'wrong-current@example.org');
    const res = await call(app, 'POST', '/api/v1/auth/password', acct.token, {
      currentPassword: 'not-my-password',
      newPassword: 'a-brand-new-passphrase',
    });
    expect(res.status).toBe(422);
    expect((await login('wrong-current@example.org', 'a-long-enough-passphrase')).status).toBe(200);
    expect((await call(app, 'GET', '/api/v1/auth/session', acct.token)).status).toBe(200);
  });

  it('refuses reusing the same password', async () => {
    const acct = await register(app, 'same@example.org');
    const res = await call(app, 'POST', '/api/v1/auth/password', acct.token, {
      currentPassword: 'a-long-enough-passphrase',
      newPassword: 'a-long-enough-passphrase',
    });
    expect(res.status).toBe(422);
  });

  it('ends the old sessions at once, keeps this device signed in, and swaps the credential', async () => {
    const acct = await register(app, 'rotate@example.org');
    // A second device (or a stolen token), issued in the same second.
    const other = (await login('rotate@example.org', 'a-long-enough-passphrase')).body.token;

    const changed = await call(app, 'POST', '/api/v1/auth/password', acct.token, {
      currentPassword: 'a-long-enough-passphrase',
      newPassword: 'a-brand-new-passphrase',
    });
    expect(changed.status).toBe(200);

    for (const stale of [acct.token, other]) {
      const res = await call(app, 'GET', '/api/v1/auth/session', stale);
      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('password was changed');
    }
    expect((await call(app, 'GET', '/api/v1/auth/session', changed.body.token)).status).toBe(200);

    expect((await login('rotate@example.org', 'a-long-enough-passphrase')).status).toBe(401);
    const fresh = await login('rotate@example.org', 'a-brand-new-passphrase');
    expect(fresh.status).toBe(200);
    // Signing in right after the change works immediately.
    expect((await call(app, 'GET', '/api/v1/auth/session', fresh.body.token)).status).toBe(200);
  });

  it('lets a suspended account change its password (its credentials may be what is compromised)', async () => {
    const acct = await register(app, 'suspended-pw@example.org');
    const admin = createSessionToken(
      '00000000-0000-4000-a000-00000000ad98',
      'ops@talentsphere.example',
      ['platform_admin']
    );
    const suspended = await call(
      app,
      'PATCH',
      `/api/v1/admin/users/${acct.user.id}/status`,
      admin,
      {
        status: 'suspended',
        reason: 'Under review',
      }
    );
    expect(suspended.status).toBe(200);
    const res = await call(app, 'POST', '/api/v1/auth/password', acct.token, {
      currentPassword: 'a-long-enough-passphrase',
      newPassword: 'a-brand-new-passphrase',
    });
    expect(res.status).toBe(200);
  });

  it('throttles guessing the current password, per account', async () => {
    const acct = await register(app, 'guess@example.org');
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      statuses.push(
        (
          await call(app, 'POST', '/api/v1/auth/password', acct.token, {
            currentPassword: `guess-${i}`,
            newPassword: 'a-brand-new-passphrase',
          })
        ).status
      );
    }
    expect(statuses.slice(0, 3)).toEqual([422, 422, 422]);
    expect(statuses.slice(3)).toEqual([429, 429]);
  });
});

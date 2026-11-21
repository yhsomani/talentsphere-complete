/**
 * Account erasure removes the person's own records from the in-memory
 * modules everywhere they are indexed, not only from the by-user index
 * (C-05, A05-004, A08-007, M-3). Before the fix, salary reports and alumni
 * affiliations stayed served by their other indexes, and the deletes of
 * received endorsements, referral requests, career transitions and learning
 * outcomes used the wrong key and removed nothing.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

type Json = Record<string, any>;
const PASSWORD = 'Password123!Secure';

describe('Erasure removes the person from in-memory modules (C-05)', () => {
  let app: FastifyInstance;
  let seq = 0;
  const adminToken = createSessionToken(
    '00000000-0000-4000-a000-0000000000e5',
    'admin.erasure@talentsphere.internal',
    ['platform_admin']
  );

  const call = async (
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    token?: string,
    payload?: unknown
  ): Promise<{ status: number; body: Json }> => {
    const res = await app.inject({
      method,
      url,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      ...(payload === undefined ? {} : { payload: payload as Json }),
    });
    return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : {} };
  };

  const register = async (label: string, role = 'candidate', domain = 'example.com') => {
    seq += 1;
    const res = await call('POST', '/api/v1/auth/register', undefined, {
      email: `${label}.${seq}@${domain}`,
      password: PASSWORD,
      fullName: `${label} ${seq}`,
      role,
    });
    expect(res.status).toBe(201);
    return {
      token: res.body.token as string,
      userId: res.body.user.id as string,
      profileId: res.body.profile.id as string,
    };
  };

  const erase = async (token: string) => {
    const res = await call('POST', '/api/v1/settings/erasure/execute', token, {
      currentPassword: PASSWORD,
    });
    expect(res.status).toBe(200);
  };

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: '100000',
      AUTH_RATE_LIMIT_MAX_REQUESTS: '100000',
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('drops the erased person’s salary report from benchmarks', async () => {
    const benchmark = async () =>
      (await call('GET', '/api/v1/salaries/benchmarks?role=erasure_test_engineer&level=principal'))
        .body.actualCount as number;
    const report = (token: string) =>
      call('POST', '/api/v1/salaries/reports', token, {
        jobTitle: 'Principal Erasure Engineer',
        standardizedRole: 'erasure_test_engineer',
        seniorityLevel: 'principal',
        location: 'Remote',
        baseSalaryMinor: 20000000,
        yearsOfExperience: 12,
        companyName: 'Erasure Labs',
        verificationType: 'self_reported',
      });
    const u = await register('salary-u');
    const v = await register('salary-v');
    expect((await report(u.token)).status).toBe(201);
    expect((await report(v.token)).status).toBe(201);
    expect(await benchmark()).toBe(2);

    await erase(u.token);
    expect(await benchmark()).toBe(1);
  });

  it('removes the erased person’s alumni affiliation from the directory and from verification', async () => {
    const owner = await register('alumni-owner', 'candidate', 'erasure-uni.edu');
    const org = await call('POST', '/api/v1/organizations', owner.token, {
      name: 'Erasure University',
      slug: `erasure-university-${seq}`,
      website: 'https://erasure-uni.edu',
    });
    expect(org.status).toBe(201);
    const institutionId = org.body.organization.id as string;
    const u = await register('alumni-u', 'candidate', 'elsewhere.example');
    const created = await call('POST', '/api/v1/alumni/affiliations', u.token, {
      institutionId,
      degreeType: 'bachelors',
      fieldOfStudy: 'History',
      graduationYear: 2020,
    });
    expect(created.status).toBe(201);
    const affiliationId = created.body.affiliation.id as string;
    const seat = { verificationMethod: 'institutional_seat', seatCode: 'ERASURE-SEAT-2020' };
    expect(
      (await call('POST', `/api/v1/alumni/affiliations/${affiliationId}/verify`, adminToken, seat))
        .status
    ).toBe(200);

    const directory = async () =>
      (await call('GET', `/api/v1/alumni/institutions/${institutionId}/directory`, adminToken)).body
        .directory as Array<{ id: string; userId: string }>;
    expect((await directory()).some((a) => a.userId === u.userId)).toBe(true);

    await erase(u.token);
    expect((await directory()).some((a) => a.userId === u.userId)).toBe(false);
    const verify = await call(
      'POST',
      `/api/v1/alumni/affiliations/${affiliationId}/verify`,
      adminToken,
      seat
    );
    expect(verify.status).toBe(404);
  });

  it('removes endorsements the erased person received, including from the endorser’s history', async () => {
    const u = await register('endorse-u');
    const v = await register('endorse-v');
    const skills = await call('GET', '/api/v1/skills');
    const skillId = skills.body.skills[0].id as string;
    const given = await call('POST', '/api/v1/skills/endorsements', v.token, {
      recipientId: u.userId,
      skillId,
    });
    expect(given.status).toBe(201);
    const endorsementId = given.body.endorsement.id as string;

    await erase(u.token);
    const received = await call('GET', `/api/v1/skills/endorsements/recipients/${u.userId}`);
    if (received.status === 200) expect(received.body.endorsements).toHaveLength(0);
    else expect(received.status).toBe(404);
    const history = await call('GET', '/api/v1/skills/endorsements/my/given', v.token);
    expect(history.status).toBe(200);
    expect(
      (history.body.endorsements as Array<{ id: string }>).some((e) => e.id === endorsementId)
    ).toBe(false);
  });

  it('removes the erased person’s referral requests from the referrer’s inbox', async () => {
    const recruiter = await register('ref-recruiter', 'recruiter', 'erasure-corp.io');
    const referrer = await register('ref-referrer', 'candidate', 'erasure-corp.io');
    const u = await register('ref-u');
    const org = await call('POST', '/api/v1/organizations', recruiter.token, {
      name: 'Erasure Corp',
      slug: `erasure-corp-${seq}`,
      website: 'https://erasure-corp.io',
    });
    expect(org.status).toBe(201);
    const orgId = org.body.organization.id as string;
    expect(
      (
        await call('POST', `/api/v1/organizations/${orgId}/members`, recruiter.token, {
          userId: referrer.userId,
          role: 'member',
        })
      ).status
    ).toBe(201);
    const job = await call('POST', '/api/v1/jobs', recruiter.token, {
      orgId,
      title: 'Erasure Engineer',
      description: 'Removing personal data properly',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    });
    expect(job.status).toBe(201);
    const jobId = job.body.job.id as string;
    expect(
      (
        await call('PATCH', `/api/v1/jobs/${jobId}/status`, recruiter.token, {
          status: 'published',
        })
      ).status
    ).toBe(200);
    expect((await call('POST', `/api/v1/jobs/${jobId}/apply`, u.token, {})).status).toBe(201);
    const asked = await call('POST', '/api/v1/referrals/requests', u.token, {
      referrerId: referrer.userId,
      jobId,
      pitch: 'Please refer me before I erase my account.',
    });
    expect(asked.status).toBe(201);
    const requestId = asked.body.request.id as string;
    const incoming = async () =>
      (await call('GET', '/api/v1/referrals/requests/incoming', referrer.token)).body
        .requests as Array<{ id: string }>;
    expect((await incoming()).some((r) => r.id === requestId)).toBe(true);

    await erase(u.token);
    expect((await incoming()).some((r) => r.id === requestId)).toBe(false);
  });

  it('removes the connection from the other person’s list', async () => {
    const u = await register('conn-u');
    const v = await register('conn-v');
    const requested = await call('POST', '/api/v1/connections/request', u.token, {
      recipientId: v.userId,
    });
    expect(requested.status).toBe(201);
    const connectionId = requested.body.connection.id as string;
    expect(
      (
        await call('POST', `/api/v1/connections/${connectionId}/respond`, v.token, {
          action: 'accept',
        })
      ).status
    ).toBe(200);
    const vConnections = async () =>
      (await call('GET', '/api/v1/connections?status=all', v.token)).body.connections as Array<{
        id: string;
      }>;
    expect((await vConnections()).some((c) => c.id === connectionId)).toBe(true);

    await erase(u.token);
    expect((await vConnections()).some((c) => c.id === connectionId)).toBe(false);
  });

  it('drops the erased person’s career transition from progression benchmarks', async () => {
    const people = [];
    for (let i = 0; i < 20; i++) {
      const p = await register('career');
      const res = await call('POST', '/api/v1/career/transitions', p.token, {
        fromRole: 'Erasure Analyst',
        toRole: 'Senior Erasure Analyst',
        salaryDelta: 10000 + i * 100,
        timeInRoleMonths: 24,
        consentFlag: true,
      });
      expect(res.status).toBe(201);
      people.push(p);
    }
    const published = async () =>
      (
        (
          await call(
            'GET',
            '/api/v1/career/benchmarks?fromRole=Erasure%20Analyst&toRole=Senior%20Erasure%20Analyst&minSamples=20'
          )
        ).body.benchmarks as unknown[]
      ).length;
    expect(await published()).toBe(1);

    await erase(people[0].token);
    // 19 people left: below the publication threshold.
    expect(await published()).toBe(0);
  });
});

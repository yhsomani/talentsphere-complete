import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

// Skill profile from the skill-signal ledger (TS-07): evidence writes emit
// signals in the same write, verification raises the rung, revoking removes
// the evidence's effect, and the profile names what it rests on.
const SQL = '10000000-0000-4000-a000-000000000003';
const TS = '10000000-0000-4000-a000-000000000001';

describe('Skill profile (TS-07)', () => {
  let app: FastifyInstance;
  let token: string;
  const admin = createSessionToken(
    'a0000000-0000-4000-a000-000000000091',
    'admin@talentsphere.io',
    ['platform_admin']
  );

  const profile = async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/skills/profile/me',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    return JSON.parse(res.body).skills as Array<{
      skillId: string;
      slug: string;
      strongestRung: string;
      signalCount: number;
      sources: Array<{ sourceRef: string; title: string; rung: string }>;
    }>;
  };
  const addEvidence = async (title: string, skillIds: string[]) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: 'project',
        title,
        description: 'Built and shipped.',
        source: 'https://example.com/repo',
        provenance: 'github_repository',
        recencyDate: '2026-05-15',
        skillIds,
      },
    });
    expect(res.statusCode).toBe(201);
    return JSON.parse(res.body).evidence.id as string;
  };

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: '0' });
    await app.ready();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'skill.profile@example.com',
        password: 'Password123!Secure',
        fullName: 'Skill Profile',
        role: 'candidate',
      },
    });
    token = JSON.parse(res.body).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts empty and gains a claimed skill from new evidence', async () => {
    expect(await profile()).toEqual([]);
    const id = await addEvidence('Reporting warehouse', [SQL]);
    const [sql] = await profile();
    expect(sql).toMatchObject({
      skillId: SQL,
      slug: expect.any(String),
      strongestRung: 'unverified',
      signalCount: 1,
    });
    expect(sql.sources).toEqual([
      { sourceModule: 'evidence', sourceRef: id, rung: 'unverified', title: 'Reporting warehouse' },
    ]);
  });

  it('raises the rung when evidence is verified, and drops it when evidence is revoked', async () => {
    const id = await addEvidence('Audited billing queries', [SQL, TS]);
    const verified = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${id}/verify`,
      headers: { authorization: `Bearer ${admin}` },
      payload: { verificationLevel: 'authority_verified' },
    });
    expect(verified.statusCode).toBe(200);
    let skills = await profile();
    const sql = skills.find((s) => s.skillId === SQL)!;
    expect(sql.strongestRung).toBe('authority_verified');
    expect(sql.signalCount).toBe(2);
    expect(sql.sources[0]).toMatchObject({ sourceRef: id, rung: 'authority_verified' });

    const revoked = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${id}/revoke`,
      headers: { authorization: `Bearer ${token}` },
      payload: { reason: 'Posted to the wrong account.' },
    });
    expect(revoked.statusCode).toBe(200);
    skills = await profile();
    expect(skills.map((s) => [s.skillId, s.strongestRung, s.signalCount])).toEqual([
      [SQL, 'unverified', 1],
    ]);
  });

  it('needs a session', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/skills/profile/me' });
    expect(res.statusCode).toBe(401);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Integration: Skill Decay & Freshness Tracking (F-123, BR-225..BR-232)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let recruiterToken: string;
  let orgId: string;
  let jobId: string;
  let validSkillId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:54322/postgres',
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters-long',
    });
    await app.ready();

    // 1. Register Candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `cand.decay.${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Robin SkillsLearner',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.payload);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 2. Register Recruiter & Create Org
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: `rec.decay.${Date.now()}@nexussystems.io`,
        password: 'Password123!',
        fullName: 'Alexis Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    recruiterToken = JSON.parse(recRes.payload).token;

    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Nexus Systems Cloud',
        slug: `nexus-systems-${Date.now()}`,
        website: 'https://nexussystems.io',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = JSON.parse(orgRes.payload).organization.id;

    // 3. Get canonical skill
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/skills',
    });
    expect(skillsRes.statusCode).toBe(200);
    validSkillId = JSON.parse(skillsRes.payload).skills[0].id;

    // 4. Post and publish job
    const jobRes = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        orgId,
        title: 'Cloud Infrastructure Architect',
        description: 'Design distributed architectures.',
        location: 'Remote',
        requiredSkillIds: [validSkillId],
      },
    });
    expect(jobRes.statusCode).toBe(201);
    jobId = JSON.parse(jobRes.payload).job.id;

    await app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${jobId}/status`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: { status: 'published' },
    });
  });

  it('registers a skill for continuous freshness tracking (BR-225)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/freshness',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        skillId: validSkillId,
        category: 'fast_changing',
        verificationSource: 'challenge',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.freshness.skillId).toBe(validSkillId);
    expect(body.freshness.category).toBe('fast_changing');
    expect(body.freshness.freshnessScore).toBe(100);
    expect(body.freshness.freshnessBand).toBe('fresh');
    expect(body.freshness.isDemoted).toBe(false);
  });

  it('allows candidate to view their active skill freshness portfolio (BR-230)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/skills/freshness/my',
      headers: { authorization: `Bearer ${candidateToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.records.length).toBeGreaterThanOrEqual(1);
    expect(body.records.some((r: any) => r.skillId === validSkillId)).toBe(true);
  });

  it('restricts recruiter access to skill freshness unless application context exists (BR-230)', async () => {
    // 1. Recruiter tries to inspect candidate freshness before any application -> 403 Forbidden
    const unappliedRes = await app.inject({
      method: 'GET',
      url: `/api/v1/candidates/${candidateProfileId}/skills/freshness`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(unappliedRes.statusCode).toBe(403);

    // 2. Candidate applies to Nexus Systems job requisition
    const applyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${jobId}/apply`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        coverLetter: 'Applying for the Cloud Infrastructure Architect role.',
      },
    });
    expect(applyRes.statusCode).toBe(201);

    // 3. Now recruiter has application context -> access granted (200 OK)
    const appliedRes = await app.inject({
      method: 'GET',
      url: `/api/v1/candidates/${candidateProfileId}/skills/freshness`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(appliedRes.statusCode).toBe(200);
    const appliedBody = JSON.parse(appliedRes.payload);
    expect(appliedBody.records.some((r: any) => r.skillId === validSkillId)).toBe(true);
  });

  it('re-verifies skill via self-attestation and full challenge pass (BR-228, BR-229)', async () => {
    // 1. Re-verify via self-attestation (0.5x credit BR-229)
    const selfRes = await app.inject({
      method: 'POST',
      url: `/api/v1/skills/${validSkillId}/reverify`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { source: 'self_attestation' },
    });
    expect(selfRes.statusCode).toBe(200);
    const selfBody = JSON.parse(selfRes.payload);
    expect(selfBody.freshness.verificationSource).toBe('self_attestation');

    // 2. Re-verify via challenge (restores full 100 freshness BR-228)
    const challengeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/skills/${validSkillId}/reverify`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { source: 'challenge' },
    });
    expect(challengeRes.statusCode).toBe(200);
    const challengeBody = JSON.parse(challengeRes.payload);
    expect(challengeBody.freshness.freshnessScore).toBe(100);
    expect(challengeBody.freshness.freshnessBand).toBe('fresh');
    expect(challengeBody.freshness.verificationSource).toBe('challenge');
  });

  it('triggers freshness score re-calculation across active portfolios (BR-225)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/freshness/refresh-all',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.message).toContain('BR-225');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Employer Reputation & Brand System Integration (F-149, F-75, F-56, F-144)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateId: string;
  let recruiterToken: string;
  let recruiterId: string;
  let orgId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register Candidate
    const reg1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'cand.emp.rep@example.com',
        password: 'Password123!Secure',
        fullName: 'Jane Candidate',
        role: 'candidate',
      },
    });
    const d1 = JSON.parse(reg1.body);
    candidateId = d1.user.id;
    candidateToken = d1.token;

    // 2. Register Recruiter / Org Owner
    const reg2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter.emp.rep@example.com',
        password: 'Password123!Secure',
        fullName: 'John Recruiter',
        role: 'recruiter',
      },
    });
    const d2 = JSON.parse(reg2.body);
    recruiterId = d2.user.id;
    recruiterToken = d2.token;

    // 3. Create Organization
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Acme Technologies',
        slug: 'acme-technologies-rep',
        website: 'https://acme.tech',
        description: 'Pioneering cloud computing solutions.',
      },
    });
    orgId = JSON.parse(orgRes.body).organization.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('retrieves default baseline employer reputation when no reviews exist', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/organizations/${orgId}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.profile.organizationId).toBe(orgId);
    expect(body.profile.overallScore).toBeGreaterThanOrEqual(50);
    expect(body.profile.reputationBand).toBe('developing');
    expect(body.profile.totalReviewsCount).toBe(0);
    expect(body.profile.factors.hiringScore).toBeDefined();
    expect(body.profile.factors.cultureScore).toBeDefined();
  });

  it('submits verified review and recalculates multi-dimensional reputation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/organizations/${orgId}/reviews`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        employmentStatus: 'candidate',
        hiringRating: 4.8,
        cultureRating: 4.5,
        growthRating: 4.2,
        compensationRating: 4.6,
        leadershipRating: 4.5,
        title: 'Streamlined interview with timely feedback',
        feedback: 'Recruiter responded within 24 hours at every stage.',
        isVerifiedEmployee: false,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.review.organizationId).toBe(orgId);
    expect(body.review.reviewerId).toBe(candidateId);
    expect(body.profile.overallScore).toBeGreaterThan(70);
    expect(body.profile.totalReviewsCount).toBe(1);
    expect(body.profile.reputationBand).toBe('strong_reputation');
  });

  it('prevents duplicate review submission from the same reviewer (BR-F149)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/organizations/${orgId}/reviews`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        employmentStatus: 'candidate',
        hiringRating: 5.0,
        cultureRating: 5.0,
        growthRating: 5.0,
        compensationRating: 5.0,
        leadershipRating: 5.0,
        title: 'Duplicate review attempt',
      },
    });

    expect(res.statusCode).toBe(409);
    const err = JSON.parse(res.body);
    expect(err.error.code).toBe('CONFLICT');
  });

  it('submits operational metrics and elevates reputation band (BR-F149-01)', async () => {
    // Non-member candidate cannot submit operational metrics
    const forbiddenRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/organizations/${orgId}/metrics`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        offerAcceptanceRate: 95,
      },
    });
    expect(forbiddenRes.statusCode).toBe(403);

    // Recruiter / Org Owner submits verified metrics
    const metricsRes = await app.inject({
      method: 'POST',
      url: `/api/v1/reputation/organizations/${orgId}/metrics`,
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        avgTimeToHireDays: 18,
        offerAcceptanceRate: 94,
        offerRescindedRate: 0,
        salaryTransparencyIndex: 96,
        internalPromotionRate: 88,
      },
    });

    expect(metricsRes.statusCode).toBe(200);
    const body = JSON.parse(metricsRes.body);
    expect(body.profile.overallScore).toBeGreaterThanOrEqual(80);
    expect(body.profile.highlights.length).toBeGreaterThanOrEqual(2);
  });

  it('lists public reviews for an organization', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/reputation/organizations/${orgId}/reviews`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.organizationId).toBe(orgId);
    expect(body.reviews).toHaveLength(1);
    expect(body.reviews[0].title).toBe('Streamlined interview with timely feedback');
  });
});

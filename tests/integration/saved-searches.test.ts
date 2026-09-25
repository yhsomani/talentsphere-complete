import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Saved Searches, Job Alerts & Saved Jobs Integration Tests (F-32, F-04, F-25)', () => {
  let app: FastifyInstance;

  let candidateToken: string;
  let candidateUserId: string;

  let otherCandidateToken: string;
  let otherCandidateUserId: string;

  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;

  let savedSearchId: string;
  let publishedJobId: string;
  let alertId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register candidate user
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'saved.search.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Alex Searcher',
        role: 'candidate',
      },
    });
    expect(candRes.statusCode).toBe(201);
    const candBody = JSON.parse(candRes.body);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;

    // 2. Register other candidate user
    const otherRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'other.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Sam Bystander',
        role: 'candidate',
      },
    });
    expect(otherRes.statusCode).toBe(201);
    const otherBody = JSON.parse(otherRes.body);
    otherCandidateToken = otherBody.token;
    otherCandidateUserId = otherBody.user.id;

    // 3. Register recruiter and create organization
    const recRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'recruiter.alerts@example.com',
        password: 'Password123!Secure',
        fullName: 'Taylor Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.statusCode).toBe(201);
    const recBody = JSON.parse(recRes.body);
    recruiterToken = recBody.token;
    recruiterUserId = recBody.user.id;

    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${recruiterToken}` },
      payload: {
        name: 'Nexus Cloud Systems',
        slug: 'nexus-cloud-systems',
        website: 'https://nexuscloud.example.com',
        description: 'Next generation cloud platforms.',
      },
    });
    expect(orgRes.statusCode).toBe(201);
    orgId = JSON.parse(orgRes.body).organization.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Saved Searches CRUD & Isolation (POST, GET, PATCH, DELETE /jobs/saved-searches)', () => {
    it('creates a saved search for candidate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs/saved-searches',
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          title: 'Remote TypeScript Engineers',
          criteria: {
            query: 'TypeScript',
            workMode: 'remote',
            jobType: 'full_time',
          },
          alertFrequency: 'daily',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.savedSearch.id).toBeDefined();
      expect(body.savedSearch.title).toBe('Remote TypeScript Engineers');
      expect(body.savedSearch.isActive).toBe(true);
      savedSearchId = body.savedSearch.id;
    });

    it('lists saved searches for the owner', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs/saved-searches',
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.savedSearches[0].id).toBe(savedSearchId);
    });

    it('denies other candidate from viewing or modifying saved search', async () => {
      const getRes = await app.inject({
        method: 'GET',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
      });
      expect(getRes.statusCode).toBe(403);

      const patchRes = await app.inject({
        method: 'PATCH',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}`,
        headers: { authorization: `Bearer ${otherCandidateToken}` },
        payload: { title: 'Unauthorized Modification' },
      });
      expect(patchRes.statusCode).toBe(403);
    });

    it('updates saved search criteria and alert frequency', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}`,
        headers: { authorization: `Bearer ${candidateToken}` },
        payload: {
          title: 'Lead TypeScript & Cloud Architect',
          alertFrequency: 'instant',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.savedSearch.title).toBe('Lead TypeScript & Cloud Architect');
      expect(body.savedSearch.alertFrequency).toBe('instant');
    });
  });

  describe('Job Alerts Generation on Publish & Run Saved Search', () => {
    it('runs saved search on current inventory and returns empty initially', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}/run`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(0);
    });

    it('dispatches job alert when recruiter posts a matching published job', async () => {
      const postJobRes = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: {
          orgId,
          title: 'Staff TypeScript Systems Architect',
          description: 'High performance backend services in TypeScript and Node.js.',
          location: 'San Francisco, CA',
          workMode: 'remote',
          jobType: 'full_time',
        },
      });
      expect(postJobRes.statusCode).toBe(201);
      const job = JSON.parse(postJobRes.body).job;
      publishedJobId = job.id;

      // Recruiter publishes the job
      const publishRes = await app.inject({
        method: 'PATCH',
        url: `/api/v1/jobs/${publishedJobId}/status`,
        headers: { authorization: `Bearer ${recruiterToken}` },
        payload: { status: 'published' },
      });
      expect(publishRes.statusCode).toBe(200);

      // Candidate checks alerts
      const alertsRes = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs/alerts',
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      expect(alertsRes.statusCode).toBe(200);
      const alertsBody = JSON.parse(alertsRes.body);
      expect(alertsBody.total).toBeGreaterThanOrEqual(1);

      const matchingAlert = alertsBody.alerts.find((a: any) => a.jobId === publishedJobId);
      expect(matchingAlert).toBeDefined();
      expect(matchingAlert.isRead).toBe(false);
      alertId = matchingAlert.id;
    });

    it('marks job alert as read', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/jobs/alerts/${alertId}/read`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.alert.isRead).toBe(true);
    });

    it('running saved search now returns the newly published job', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}/run`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.matchingJobs[0].id).toBe(publishedJobId);
    });
  });

  describe('Saved Jobs / Bookmarks (POST, GET, DELETE /jobs/:id/save)', () => {
    it('bookmarks a job for candidate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${publishedJobId}/save`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.savedJob.jobId).toBe(publishedJobId);
    });

    it('prevents duplicate bookmarks with 409 conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${publishedJobId}/save`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(409);
    });

    it('lists candidate saved jobs with hydrated job details', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs/saved',
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.jobs[0].id).toBe(publishedJobId);
      expect(body.jobs[0].title).toBe('Staff TypeScript Systems Architect');
    });

    it('removes a job bookmark', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/jobs/${publishedJobId}/save`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);

      // Verify list is now empty
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/jobs/saved',
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      expect(JSON.parse(listRes.body).total).toBe(0);
    });
  });

  describe('Saved Search Deletion', () => {
    it('deletes the saved search', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });

      expect(res.statusCode).toBe(200);

      const getRes = await app.inject({
        method: 'GET',
        url: `/api/v1/jobs/saved-searches/${savedSearchId}`,
        headers: { authorization: `Bearer ${candidateToken}` },
      });
      expect(getRes.statusCode).toBe(404);
    });
  });
});

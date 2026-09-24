import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Authentication & Profile Domain Integration (F-01, F-12)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      RATE_LIMIT_MAX_REQUESTS: 1000,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration (F-01)', () => {
    it('registers a candidate user and automatically provisions a profile', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'alice.candidate@talentsphere.test',
          password: 'Password123!',
          fullName: 'Alice Candidate',
          role: 'candidate',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('alice.candidate@talentsphere.test');
      expect(body.profile).toBeDefined();
      expect(body.profile.fullName).toBe('Alice Candidate');
      expect(body.profile.privacy).toBe('public');
    });

    it('rejects duplicate email registration with 409 CONFLICT', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'alice.candidate@talentsphere.test',
          password: 'Password123!',
          fullName: 'Duplicate Alice',
          role: 'candidate',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('CONFLICT');
      expect(body.error.message).toContain('already exists');
    });
  });

  describe('User Login & Session Tokens (F-01)', () => {
    it('authenticates user with correct credentials and returns session token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'alice.candidate@talentsphere.test',
          password: 'Password123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('alice.candidate@talentsphere.test');
    });

    it('rejects login with incorrect password with 401 UNAUTHENTICATED', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'alice.candidate@talentsphere.test',
          password: 'WrongPassword!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('Profile Management & Privacy (F-12)', () => {
    let aliceToken: string;
    let aliceProfileId: string;
    let recruiterToken: string;

    beforeAll(async () => {
      // Login Alice
      const aliceRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'alice.candidate@talentsphere.test',
          password: 'Password123!',
        },
      });
      const aliceData = JSON.parse(aliceRes.body);
      aliceToken = aliceData.token;
      aliceProfileId = aliceData.profile.id;

      // Register Recruiter Bob
      const bobRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'bob.recruiter@talentsphere.test',
          password: 'RecruiterPassword123!',
          fullName: 'Bob Recruiter',
          role: 'recruiter',
        },
      });
      const bobData = JSON.parse(bobRes.body);
      recruiterToken = bobData.token;
    });

    it('rejects /api/v1/profile/me without Authorization header', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/profile/me',
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('UNAUTHENTICATED');
    });

    it('retrieves own profile with valid token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/profile/me',
        headers: {
          Authorization: `Bearer ${aliceToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.profile.fullName).toBe('Alice Candidate');
    });

    it('updates profile fields and privacy', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/profile/me',
        headers: {
          Authorization: `Bearer ${aliceToken}`,
        },
        payload: {
          headline: 'Principal AI & Cloud Architect',
          bio: 'Building verified talent operating systems.',
          location: 'Bengaluru, India',
          privacy: 'recruiters_only',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.profile.headline).toBe('Principal AI & Cloud Architect');
      expect(body.profile.privacy).toBe('recruiters_only');
    });

    it('enforces privacy boundary: anonymous caller cannot view recruiters_only profile', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/profile/${aliceProfileId}`,
      });

      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('FORBIDDEN');
    });

    it('enforces privacy boundary: recruiter CAN view recruiters_only profile', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/profile/${aliceProfileId}`,
        headers: {
          Authorization: `Bearer ${recruiterToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.profile.fullName).toBe('Alice Candidate');
    });
  });
});

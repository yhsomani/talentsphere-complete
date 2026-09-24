import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Fastify Modular API Server Integration (E-09, E-10)', () => {
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

  describe('Health & Observability Endpoints', () => {
    it('GET /health returns 200 with status ok and version', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.version).toBe('0.1.0');
      expect(body.timestamp).toBeDefined();
    });

    it('GET /api/v1/health returns 200 with environment information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.environment).toBe('test');
    });

    it('GET /api/v1/feature-flags returns active flags', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/feature-flags',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.flags.FEATURE_LMS).toBe(true);
      expect(body.flags.FEATURE_AI_MATCHING).toBe(false);
    });
  });

  describe('Security & Error Contract Compliance', () => {
    it('formats 404 for unknown routes into canonical ErrorEnvelope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/non-existent-route',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.request_id).toBeDefined();
      expect(body.error.request_id.startsWith('req_')).toBe(true);
    });

    it('preserves client-supplied x-request-id across the lifecycle', async () => {
      const customReqId = 'req_custom_tracer_999';
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          'x-request-id': customReqId,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).toBe(customReqId);
    });

    it('attaches Helmet security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('Auth Route Contracts', () => {
    it('accepts valid registration input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'candidate@talentsphere.test',
          password: 'StrongPassword123!',
          fullName: 'Alice Test',
          role: 'candidate',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.email).toBe('candidate@talentsphere.test');
      expect(body.profile.fullName).toBe('Alice Test');
    });

    it('rejects invalid registration with 400 and VALIDATION_FAILED code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'invalid-email',
          password: '123', // Too short (< 8 chars)
          fullName: 'A', // Too short (< 2 chars)
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_FAILED');
      expect(body.error.request_id).toBeDefined();
      expect(body.error.details).toBeDefined();
      expect(Array.isArray(body.error.details)).toBe(true);
    });

    it('accepts valid login input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'candidate@talentsphere.test',
          password: 'StrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('candidate@talentsphere.test');
    });
  });
});

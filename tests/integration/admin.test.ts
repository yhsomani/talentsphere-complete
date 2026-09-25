import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Platform Administration & Governance Integration (F-17, F-35, BR-06, BR-28, BR-29, BR-067, BR-068)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let adminToken: string;
  const adminUserId = '00000000-0000-4000-a000-000000000099';

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register candidate user
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'regular.candidate@example.com',
        password: 'Password123!Secure',
        fullName: 'Alex Standard Candidate',
        role: 'candidate',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    candidateToken = body.token;
    candidateUserId = body.user.id;

    // 2. Generate platform_admin token
    adminToken = createSessionToken(adminUserId, 'admin.governance@talentsphere.internal', [
      'platform_admin',
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests to admin routes with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/users',
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects candidate user access to admin routes with 403 (BR-06)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/users',
      headers: {
        authorization: `Bearer ${candidateToken}`,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('BR-06');
  });

  it('allows platform_admin to list registered users', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/users',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(1);

    const target = body.users.find((u: any) => u.id === candidateUserId);
    expect(target).toBeDefined();
    expect(target.email).toBe('regular.candidate@example.com');
    expect(target.passwordHash).toBeUndefined(); // Zero credentials leak
  });

  it('allows platform_admin to update a target user status with audit log and worker job', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${candidateUserId}/status`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        status: 'suspended',
        reason: 'Detected potential violation of community standards.',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.status).toBe('suspended');
    expect(body.auditLog).toBeDefined();
    expect(body.auditLog.eventName).toBe('USER_STATUS_UPDATED');
    expect(body.auditLog.actorId).toBe(adminUserId);

    // Verify worker job dispatch
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobsBody = JSON.parse(jobsRes.body);
    const updateJob = jobsBody.jobs.find((j: any) => j.type === 'admin.user.status_updated');
    expect(updateJob).toBeDefined();
    expect(updateJob.payload.userId).toBe(candidateUserId);
  });

  it('enforces anti-lockout rule: administrator cannot suspend own account (BR-29, BR-068)', async () => {
    // Register a second admin user in repository
    const regAdminRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'secondary.admin@talentsphere.internal',
        password: 'Password123!Secure',
        fullName: 'Secondary Platform Admin',
        role: 'candidate',
      },
    });
    const secondaryAdminUser = JSON.parse(regAdminRes.body).user;

    // Promote to platform_admin
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${secondaryAdminUser.id}/roles`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        roles: ['platform_admin'],
      },
    });

    const secondaryAdminToken = createSessionToken(
      secondaryAdminUser.id,
      secondaryAdminUser.email,
      ['platform_admin']
    );

    // Attempt self-suspension
    const selfSuspendRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${secondaryAdminUser.id}/status`,
      headers: {
        authorization: `Bearer ${secondaryAdminToken}`,
      },
      payload: {
        status: 'suspended',
        reason: 'Attempting self suspension to test lockout guard.',
      },
    });

    expect(selfSuspendRes.statusCode).toBe(422);
    const body = JSON.parse(selfSuspendRes.body);
    expect(body.error.code).toBe('POLICY_VIOLATION');
    expect(body.error.message).toContain('lockout');
  });

  it('allows platform_admin to update user roles', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${candidateUserId}/roles`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        roles: ['candidate', 'moderator'],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.roles).toEqual(['candidate', 'moderator']);
    expect(body.auditLog.eventName).toBe('USER_ROLES_UPDATED');
  });

  it('allows public access to feature flags and admin management (F-35)', async () => {
    // 1. Check public flags
    const pubRes = await app.inject({
      method: 'GET',
      url: '/api/v1/feature-flags',
    });
    expect(pubRes.statusCode).toBe(200);
    const pubBody = JSON.parse(pubRes.body);
    expect(pubBody.flags.FEATURE_AI_MATCHING).toBe(false);

    // 2. Admin inspects flags
    const adminFlagsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/feature-flags',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    expect(adminFlagsRes.statusCode).toBe(200);
    const adminFlagsBody = JSON.parse(adminFlagsRes.body);
    expect(adminFlagsBody.flags.length).toBeGreaterThanOrEqual(5);

    // 3. Admin enables FEATURE_AI_MATCHING
    const toggleRes = await app.inject({
      method: 'PUT',
      url: '/api/v1/admin/feature-flags/FEATURE_AI_MATCHING',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        enabled: true,
        description: 'AI Matching Beta enabled for production trial.',
      },
    });
    expect(toggleRes.statusCode).toBe(200);
    const toggleBody = JSON.parse(toggleRes.body);
    expect(toggleBody.flag.enabled).toBe(true);

    // 4. Verify public endpoint reflects change immediately
    const updatedPubRes = await app.inject({
      method: 'GET',
      url: '/api/v1/feature-flags',
    });
    const updatedPubBody = JSON.parse(updatedPubRes.body);
    expect(updatedPubBody.flags.FEATURE_AI_MATCHING).toBe(true);
  });

  it('allows platform_admin to query audit logs (BR-067)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/audit-logs',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.logs)).toBe(true);
    expect(body.logs.length).toBeGreaterThanOrEqual(3);

    const hasStatusLog = body.logs.some((l: any) => l.eventName === 'USER_STATUS_UPDATED');
    const hasRoleLog = body.logs.some((l: any) => l.eventName === 'USER_ROLES_UPDATED');
    const hasFlagLog = body.logs.some((l: any) => l.eventName === 'FEATURE_FLAG_UPDATED');

    expect(hasStatusLog).toBe(true);
    expect(hasRoleLog).toBe(true);
    expect(hasFlagLog).toBe(true);
  });

  it('retrieves system health diagnostics and toggles maintenance mode (BR-28)', async () => {
    // 1. Initial healthy state
    const healthRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/health-diagnostics',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(healthRes.statusCode).toBe(200);
    const healthBody = JSON.parse(healthRes.body);
    expect(healthBody.diagnostics.status).toBe('healthy');
    expect(healthBody.diagnostics.inMaintenance).toBe(false);
    expect(healthBody.diagnostics.registeredUsersCount).toBeGreaterThanOrEqual(1);

    // 2. Enable maintenance mode
    const enableMaintRes = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/maintenance',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        inMaintenance: true,
        reason: 'Scheduled database indexing maintenance window.',
      },
    });

    expect(enableMaintRes.statusCode).toBe(200);
    expect(JSON.parse(enableMaintRes.body).inMaintenance).toBe(true);

    // 3. System diagnostics now reports maintenance
    const updatedHealthRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/health-diagnostics',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    const updatedHealthBody = JSON.parse(updatedHealthRes.body);
    expect(updatedHealthBody.diagnostics.status).toBe('maintenance');
    expect(updatedHealthBody.diagnostics.inMaintenance).toBe(true);

    // 4. Disable maintenance mode
    const disableMaintRes = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/maintenance',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        inMaintenance: false,
      },
    });

    expect(disableMaintRes.statusCode).toBe(200);
    expect(JSON.parse(disableMaintRes.body).inMaintenance).toBe(false);
  });
});

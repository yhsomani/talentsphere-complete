import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Authentication, Profile & Settings (F-01, F-12, F-15)', () => {
  let candidateToken: string;
  let candidateId: string;
  const candidateEmail = `e2e.candidate.${Date.now()}@example.com`;

  test('registers candidate, prevents duplicates, and logs in with secure tokens (F-01)', async ({ request }) => {
    // 1. Register candidate
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: candidateEmail,
        password: 'Password123!Secure',
        fullName: 'Jordan E2E Candidate',
        role: 'candidate',
      },
    });

    expect(regRes.status()).toBe(201);
    const regData = await regRes.json();
    expect(regData.token).toBeDefined();
    expect(regData.user.email).toBe(candidateEmail.toLowerCase());
    expect(regData.user.roles).toContain('candidate');
    expect(regData.profile.fullName).toBe('Jordan E2E Candidate');

    candidateToken = regData.token;
    candidateId = regData.user.id;

    // 2. Reject duplicate registration with 409 Conflict
    const dupRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: candidateEmail,
        password: 'AnotherPassword123!',
        fullName: 'Duplicate Jordan',
        role: 'candidate',
      },
    });
    expect(dupRes.status()).toBe(409);
    const dupBody = await dupRes.json();
    expect(dupBody.error.code).toBe('CONFLICT');

    // 3. Login with credentials
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: candidateEmail,
        password: 'Password123!Secure',
      },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.token).toBeDefined();
    expect(loginData.user.id).toBe(candidateId);

    // 4. Reject invalid login credentials
    const badLoginRes = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: candidateEmail,
        password: 'WrongPassword!',
      },
    });
    expect(badLoginRes.status()).toBe(401);
  });

  test('manages profile information and enforces privacy levels (F-12)', async ({ request }) => {
    // 1. View own profile
    const getRes = await request.get(`${API_BASE}/profile/me`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.status()).toBe(200);
    const profileData = await getRes.json();
    expect(profileData.profile.fullName).toBe('Jordan E2E Candidate');

    // 2. Update profile headline and privacy mode
    const updateRes = await request.patch(`${API_BASE}/profile/me`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        headline: 'Staff Distributed Systems Engineer',
        location: 'San Francisco, CA',
        privacy: 'public',
      },
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.profile.headline).toBe('Staff Distributed Systems Engineer');
    expect(updated.profile.location).toBe('San Francisco, CA');
  });

  test('configures privacy preferences, requests export, and initiates GDPR erasure (F-15)', async ({ request }) => {
    // 1. Get default settings
    const settingsRes = await request.get(`${API_BASE}/settings`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(settingsRes.status()).toBe(200);
    const settingsBody = await settingsRes.json();
    expect(settingsBody.settings.profileVisibility).toBe('public');

    // 2. Update privacy settings
    const updateSettingsRes = await request.patch(`${API_BASE}/settings`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        profileVisibility: 'connections_only',
        allowRecruiterInquiries: true,
      },
    });
    expect(updateSettingsRes.status()).toBe(200);
    const updatedSettings = await updateSettingsRes.json();
    expect(updatedSettings.settings.profileVisibility).toBe('connections_only');

    // 3. Request data export (GDPR Art 15 & 20)
    const exportRes = await request.post(`${API_BASE}/settings/export`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: { format: 'json' },
    });
    expect(exportRes.status()).toBe(200);
    const exportData = await exportRes.json();
    expect(exportData.exportRequest.status).toBe('completed');
    expect(exportData.exportRequest.downloadUrl).toBeDefined();

    // 4. Request account erasure with 30-day grace period
    const eraseReqRes = await request.post(`${API_BASE}/settings/erasure/request`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        confirm: true,
        reason: 'Testing GDPR erasure lifecycle',
      },
    });
    expect(eraseReqRes.status()).toBe(201);
    const eraseData = await eraseReqRes.json();
    expect(eraseData.erasureRequest.status).toBe('grace_period');
    expect(eraseData.erasureRequest.gracePeriodEndsAt).toBeDefined();

    // 5. Cancel erasure request
    const cancelRes = await request.post(`${API_BASE}/settings/erasure/cancel`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        requestId: eraseData.erasureRequest.id,
      },
    });
    expect(cancelRes.status()).toBe(200);
  });
});

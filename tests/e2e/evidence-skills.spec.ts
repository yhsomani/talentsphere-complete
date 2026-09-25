import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Evidence Graph & Skills Taxonomy (F-96, F-84, BR-150, BR-155)', () => {
  let candidateToken: string;
  let candidateId: string;
  let candidateProfileId: string;
  let verifierToken: string;
  const verifierId = '00000000-0000-4000-a000-000000000077';
  let evidenceId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register candidate
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `evidence.candidate.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Robin Evidence Pro',
        role: 'candidate',
      },
    });
    const regData = await regRes.json();
    candidateToken = regData.token;
    candidateId = regData.user.id;
    candidateProfileId = regData.profile.id;

    // 2. Generate verification staff session token with institution_admin role
    verifierToken = createSessionToken(verifierId, 'verifier.staff@talentsphere.internal', [
      'institution_admin',
    ]);
  });

  test('creates, verifies, disputes, and issues zero-PII cryptographic verification proofs (F-96, BR-150)', async ({
    request,
  }) => {
    // 1. Create Evidence Item
    const createRes = await request.post(`${API_BASE}/evidence`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        type: 'project',
        title: 'High-Throughput Kafka Ingestion Engine',
        description:
          'Engineered zero-loss real-time data ingestion pipeline handling 100k events/sec.',
        source: 'GitHub / talentsphere-ingestion',
        provenance: 'git:commit:a9f82d1c',
        recencyDate: '2026-09-01',
      },
    });

    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.evidence.status).toBe('pending');
    expect(createData.evidence.verificationLevel).toBe('unverified');
    evidenceId = createData.evidence.id;

    // 2. Verification staff verifies evidence
    const verifyRes = await request.post(`${API_BASE}/evidence/${evidenceId}/verify`, {
      headers: { authorization: `Bearer ${verifierToken}` },
      data: {
        verificationLevel: 'institution_verified',
      },
    });

    expect(verifyRes.status()).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.evidence.status).toBe('verified');
    expect(verifyData.evidence.verificationLevel).toBe('institution_verified');
    expect(verifyData.evidence.verifiedBy).toBe(verifierId);

    // 3. Generate zero-PII public SHA-256 verification proof (BR-150, BR-155)
    const proofRes = await request.get(`${API_BASE}/evidence/${evidenceId}/verify-public`);
    expect(proofRes.status()).toBe(200);
    const proofData = await proofRes.json();
    expect(proofData.proof).toBeDefined();
    expect(proofData.proof.proofHash).toBeDefined();
    expect(proofData.proof.proofHash.length).toBe(64); // Valid SHA-256 hash length
    expect(proofData.proof.verificationLevel).toBe('institution_verified');
    expect(proofData.proof.verificationUrl).toBe(`/verify/evidence/${evidenceId}`);

    // 4. Dispute evidence
    const disputeRes = await request.post(`${API_BASE}/evidence/${evidenceId}/dispute`, {
      headers: { authorization: `Bearer ${verifierToken}` },
      data: {
        reason: 'Third party audit discrepancy noted for verification review.',
      },
    });
    expect(disputeRes.status()).toBe(200);
    const disputeData = await disputeRes.json();
    expect(disputeData.evidence.status).toBe('disputed');

    // 5. Revoke evidence
    const revokeRes = await request.post(`${API_BASE}/evidence/${evidenceId}/revoke`, {
      headers: { authorization: `Bearer ${verifierToken}` },
      data: {
        reason: 'Irrevocable conflict confirmed.',
      },
    });
    expect(revokeRes.status()).toBe(200);
    const revokeData = await revokeRes.json();
    expect(revokeData.evidence.status).toBe('revoked');
  });

  test('explores skills taxonomy and graph relationships (F-84)', async ({ request }) => {
    // 1. Get canonical skills list
    const skillsRes = await request.get(`${API_BASE}/skills`);
    expect(skillsRes.status()).toBe(200);
    const skillsData = await skillsRes.json();
    expect(Array.isArray(skillsData.skills)).toBe(true);
    expect(skillsData.skills.length).toBeGreaterThanOrEqual(1);

    const tsSkill = skillsData.skills.find((s: any) => s.slug === 'typescript');
    expect(tsSkill).toBeDefined();

    // 2. Traverse skill graph
    const graphRes = await request.get(`${API_BASE}/skills/${tsSkill.id}/graph`);
    expect(graphRes.status()).toBe(200);
    const graphData = await graphRes.json();
    expect(graphData.graph).toBeDefined();
    expect(graphData.graph.skill.slug).toBe('typescript');
    expect(Array.isArray(graphData.graph.prerequisites)).toBe(true);
    expect(Array.isArray(graphData.graph.subskills)).toBe(true);
    expect(Array.isArray(graphData.graph.correlations)).toBe(true);
  });
});

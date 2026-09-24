import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';
import { createSessionToken } from '../../packages/domain/src/index.js';

describe('Evidence Graph & Skills Taxonomy Integration Suite (F-96, F-84)', () => {
  let app: FastifyInstance;
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;
  let adminToken: string;
  let adminUserId: string;
  let peerToken: string;
  let peerUserId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 4002,
      APP_VERSION: '1.0.0-test',
    });
    await app.ready();

    // 1. Register candidate
    const candRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'candidate-evidence@example.com',
        password: 'Password123!',
        fullName: 'Evidence Builder',
        role: 'candidate',
      },
    });
    const candBody = JSON.parse(candRes.body);
    candidateToken = candBody.token;
    candidateUserId = candBody.user.id;
    candidateProfileId = candBody.profile.id;

    // 2. Register peer
    const peerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'peer-verifier@example.com',
        password: 'Password123!',
        fullName: 'Peer Reviewer',
        role: 'candidate',
      },
    });
    const peerBody = JSON.parse(peerRes.body);
    peerToken = peerBody.token;
    peerUserId = peerBody.user.id;

    // 3. Create platform admin session
    adminUserId = 'a0000000-0000-4000-a000-000000000001';
    adminToken = createSessionToken(adminUserId, 'admin@talentsphere.io', ['platform_admin']);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates evidence linked to canonical skills (F-96, BR-144)', async () => {
    // Canonical TypeScript skill ID seeded in server
    const tsSkillId = '10000000-0000-4000-a000-000000000001';

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'project',
        title: 'High Performance Real-Time Chat Engine',
        description: 'Engineered WebSockets + Redis pub/sub chat engine with sub-50ms latency.',
        source: 'https://github.com/candidate/chat-engine',
        provenance: 'github_repository',
        recencyDate: '2026-05-15',
        skillIds: [tsSkillId],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.evidence).toBeDefined();
    expect(body.evidence.verificationLevel).toBe('unverified');
    expect(body.evidence.status).toBe('pending');
    expect(body.evidence.subjectId).toBe(candidateProfileId);

    // Retrieve evidence and verify skills are attached
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/evidence/${body.evidence.id}`,
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.body);
    expect(getBody.evidence.id).toBe(body.evidence.id);
    expect(getBody.skills).toHaveLength(1);
    expect(getBody.skills[0].slug).toBe('typescript');
  });

  it('rejects evidence submission with non-existent skill ID (BR-144)', async () => {
    const fakeSkillId = '99999999-9999-4999-a999-999999999999';

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'project',
        title: 'Project with Fake Skill',
        description: 'Testing non-existent skill rejection',
        source: 'github',
        provenance: 'direct',
        recencyDate: '2026-06-01',
        skillIds: [fakeSkillId],
      },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('Canonical skill');
  });

  it('enforces anti-gaming: candidate cannot self-verify evidence', async () => {
    // Candidate creates evidence
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'self_declaration',
        title: 'Expert in Distributed Systems',
        description: 'Self-reported capability claim',
        source: 'self_reported',
        provenance: 'direct_submission',
        recencyDate: '2026-06-10',
      },
    });
    const evidence = JSON.parse(createRes.body).evidence;

    // Candidate attempts to verify own evidence
    const verifyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        verificationLevel: 'peer_reviewed',
        notes: 'Self-attestation',
      },
    });

    expect(verifyRes.statusCode).toBe(403);
    const verifyBody = JSON.parse(verifyRes.body);
    expect(verifyBody.error.code).toBe('FORBIDDEN');
    expect(verifyBody.error.message).toContain('Anti-gaming');
  });

  it('allows authorized peer to verify evidence and enqueues worker propagation event', async () => {
    // 1. Candidate creates project evidence
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'project',
        title: 'Microservices Mesh with Envoy',
        description: 'Configured service mesh in Kubernetes with mutual TLS.',
        source: 'github',
        provenance: 'git_commit',
        recencyDate: '2026-07-01',
      },
    });
    const evidence = JSON.parse(createRes.body).evidence;

    // 2. Peer verifies the evidence
    const verifyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${peerToken}` },
      payload: {
        verificationLevel: 'peer_reviewed',
        notes: 'Thoroughly tested and reviewed repository architecture.',
      },
    });

    expect(verifyRes.statusCode).toBe(200);
    const verifyBody = JSON.parse(verifyRes.body);
    expect(verifyBody.evidence.verificationLevel).toBe('peer_reviewed');
    expect(verifyBody.evidence.status).toBe('verified');
    expect(verifyBody.evidence.verifiedBy).toBe(peerUserId);

    // 3. Inspect worker job queue to verify async propagation event
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const jobsBody = JSON.parse(jobsRes.body);
    const propagationJob = jobsBody.jobs.find(
      (j: any) => j.type === 'evidence.propagate' && j.payload.evidenceId === evidence.id
    );
    expect(propagationJob).toBeDefined();
    expect(propagationJob.payload.status).toBe('verified');
  });

  it('supports dispute and revocation workflows with audit trails (BR-149, BR-154)', async () => {
    // 1. Create and verify evidence by admin
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'work_experience',
        title: 'VP of Engineering at Stealth AI',
        description: 'Claimed senior executive role',
        source: 'reference_claim',
        provenance: 'direct_entry',
        recencyDate: '2026-08-01',
      },
    });
    const evidence = JSON.parse(createRes.body).evidence;

    // 2. Admin verifies
    await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        verificationLevel: 'authority_verified',
      },
    });

    // 3. Dispute evidence
    const disputeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/dispute`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        reason: 'Third-party employer audit reports no record of employment.',
      },
    });
    expect(disputeRes.statusCode).toBe(200);
    expect(JSON.parse(disputeRes.body).evidence.status).toBe('disputed');

    // 4. Revoke evidence
    const revokeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/revoke`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        reason: 'Confirmed fraudulent claim post-investigation.',
      },
    });
    expect(revokeRes.statusCode).toBe(200);
    expect(JSON.parse(revokeRes.body).evidence.status).toBe('revoked');
  });

  it('provides zero-PII public verification endpoint (BR-150, BR-155)', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'assessment',
        title: 'Distributed Systems & Concurrency Benchmark',
        description: 'Passed algorithmic benchmark with top 1% score.',
        source: 'platform_sandbox',
        provenance: 'proctored_submission',
        recencyDate: '2026-08-15',
      },
    });
    const evidence = JSON.parse(createRes.body).evidence;

    // Admin verifies
    await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        verificationLevel: 'authority_verified',
      },
    });

    // Anonymous public call (no auth header)
    const publicRes = await app.inject({
      method: 'GET',
      url: `/api/v1/evidence/${evidence.id}/verify-public`,
    });

    expect(publicRes.statusCode).toBe(200);
    const body = JSON.parse(publicRes.body);
    expect(body.proof).toBeDefined();
    expect(body.proof.evidenceId).toBe(evidence.id);
    expect(body.proof.title).toBe(evidence.title);
    expect(body.proof.verificationLevel).toBe('authority_verified');
    expect(body.proof.status).toBe('verified');
    expect(body.proof.proofHash).toBeDefined();
    expect(body.proof.verificationUrl).toBe(`/verify/evidence/${evidence.id}`);

    // Ensure zero PII in public payload
    const raw = publicRes.body;
    expect(raw).not.toContain('candidate-evidence@example.com');
    expect(raw).not.toContain('Evidence Builder');
  });

  it('manages canonical skills taxonomy and validates acyclic prerequisite graph (F-84, BR-141..147)', async () => {
    // 1. Non-admin cannot create canonical skills (BR-141)
    const nonAdminRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        slug: 'kubernetes',
        name: 'Kubernetes',
        category: 'DevOps',
      },
    });
    expect(nonAdminRes.statusCode).toBe(403);

    // 2. Admin creates canonical skills
    const k8sRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        slug: 'kubernetes',
        name: 'Kubernetes',
        category: 'Cloud Infrastructure',
        description: 'Container orchestration platform',
      },
    });
    expect(k8sRes.statusCode).toBe(201);
    const k8sSkill = JSON.parse(k8sRes.body).skill;

    const dockerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        slug: 'docker',
        name: 'Docker',
        category: 'Cloud Infrastructure',
        description: 'Container runtime',
      },
    });
    expect(dockerRes.statusCode).toBe(201);
    const dockerSkill = JSON.parse(dockerRes.body).skill;

    // 3. Admin links: Docker is prerequisite_of Kubernetes (Docker -> K8s)
    const relRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/relationships',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        sourceSkillId: dockerSkill.id,
        targetSkillId: k8sSkill.id,
        relationshipType: 'prerequisite_of',
        weight: 1.0,
      },
    });
    expect(relRes.statusCode).toBe(201);

    // 4. Admin tries to make Kubernetes prerequisite_of Docker (K8s -> Docker), creating a cycle (BR-147)
    const cycleRes = await app.inject({
      method: 'POST',
      url: '/api/v1/skills/relationships',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        sourceSkillId: k8sSkill.id,
        targetSkillId: dockerSkill.id,
        relationshipType: 'prerequisite_of',
        weight: 1.0,
      },
    });
    expect(cycleRes.statusCode).toBe(422);
    const cycleBody = JSON.parse(cycleRes.body);
    expect(cycleBody.error.code).toBe('INVALID_STATE_TRANSITION');
    expect(cycleBody.error.message).toContain('circular dependency');

    // 5. Query skill graph for Kubernetes (BR-146)
    const graphRes = await app.inject({
      method: 'GET',
      url: `/api/v1/skills/${k8sSkill.id}/graph`,
    });
    expect(graphRes.statusCode).toBe(200);
    const graphBody = JSON.parse(graphRes.body);
    expect(graphBody.graph.skill.slug).toBe('kubernetes');
    expect(graphBody.graph.prerequisites).toHaveLength(1);
    expect(graphBody.graph.prerequisites[0].slug).toBe('docker');
  });
});

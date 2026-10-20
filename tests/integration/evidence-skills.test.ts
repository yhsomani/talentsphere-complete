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

    // 2. Peer review needs a recorded relationship (G-01): the peer gives the
    // candidate a reference for a role first.
    const strangerVerify = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${peerToken}` },
      payload: { verificationLevel: 'peer_reviewed' },
    });
    expect(strangerVerify.statusCode).toBe(403);

    const role = await app.inject({
      method: 'POST',
      url: '/api/v1/candidates/work-history',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        companyName: 'Mesh Co',
        title: 'Platform Engineer',
        employmentType: 'full_time',
        startDate: '2022-01-01',
        endDate: '2024-01-01',
        isCurrent: false,
      },
    });
    const roleId = JSON.parse(role.body).workHistory.id;
    const requested = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/work-history/${roleId}/references/request`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        refereeName: 'Peer Reviewer',
        refereeEmail: 'peer-verifier@example.com',
        relationship: 'peer',
      },
    });
    const referenceId = JSON.parse(requested.body).reference.id;
    const jobs = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/internal/worker-jobs' })).body
    ).jobs;
    const refMessage = jobs.find(
      (j: any) => j.type === 'reference.requested' && j.payload.referenceId === referenceId
    ).payload;
    const submitted = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/work-history/references/${referenceId}/submit`,
      headers: { authorization: `Bearer ${peerToken}` },
      payload: {
        token: refMessage.token,
        confirmDates: true,
        confirmTitle: true,
        technicalProficiency: 4,
        collaborationRating: 4,
        deliveryReliability: 4,
        endorsedSkills: [],
      },
    });
    expect(submitted.statusCode).toBe(200);

    // 3. Now the peer may review the evidence
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

    // 4. Inspect worker job queue to verify async propagation event
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

  it('grants peer review only to the account that submitted the reference, not to an address match (REV-03)', async () => {
    const evidence = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/evidence',
          headers: { authorization: `Bearer ${candidateToken}` },
          payload: {
            type: 'project',
            title: 'Search indexer',
            description: 'Incremental indexer.',
            source: 'github',
            provenance: 'git_commit',
            recencyDate: '2026-05-01',
          },
        })
      ).body
    ).evidence;

    // An account exists for the referee's address, but the reference is
    // submitted from the emailed link without signing in.
    const addressHolder = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: 'address-holder@example.com',
            password: 'Password123!',
            fullName: 'Address Holder',
            role: 'candidate',
          },
        })
      ).body
    );
    const role = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/candidates/work-history',
          headers: { authorization: `Bearer ${candidateToken}` },
          payload: {
            companyName: 'Index Co',
            title: 'Engineer',
            employmentType: 'full_time',
            startDate: '2020-01-01',
            endDate: '2021-01-01',
            isCurrent: false,
          },
        })
      ).body
    ).workHistory;
    const requested = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: `/api/v1/candidates/work-history/${role.id}/references/request`,
          headers: { authorization: `Bearer ${candidateToken}` },
          payload: {
            refereeName: 'Address Holder',
            refereeEmail: 'address-holder@example.com',
            relationship: 'peer',
          },
        })
      ).body
    ).reference;
    const jobs = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/v1/internal/worker-jobs' })).body
    ).jobs;
    const token = jobs.find(
      (j: any) => j.type === 'reference.requested' && j.payload.referenceId === requested.id
    ).payload.token;
    const submitted = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/work-history/references/${requested.id}/submit`,
      payload: {
        token,
        confirmDates: true,
        confirmTitle: true,
        technicalProficiency: 3,
        collaborationRating: 3,
        deliveryReliability: 3,
        endorsedSkills: [],
      },
    });
    expect(submitted.statusCode).toBe(200);

    const review = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${addressHolder.token}` },
      payload: { verificationLevel: 'peer_reviewed' },
    });
    expect(review.statusCode).toBe(403);
  });

  it('refuses disputes from unrelated accounts and lets the owner revoke (G-01, G-02, G-25)', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: {
        type: 'project',
        title: 'Rate limiter library',
        description: 'Token-bucket limiter used in production.',
        source: 'github',
        provenance: 'git_commit',
        recencyDate: '2026-06-01',
      },
    });
    const evidence = JSON.parse(createRes.body).evidence;

    // An admin whose first role is not platform_admin still has its authority (G-25).
    const twoRoleAdmin = createSessionToken(
      'a0000000-0000-4000-a000-000000000077',
      'two.roles@talentsphere.io',
      ['candidate', 'platform_admin']
    );
    const verified = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/verify`,
      headers: { authorization: `Bearer ${twoRoleAdmin}` },
      payload: { verificationLevel: 'authority_verified' },
    });
    expect(verified.statusCode).toBe(200);

    const strangerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'evidence-stranger@example.com',
        password: 'Password123!',
        fullName: 'Unrelated Account',
        role: 'candidate',
      },
    });
    const strangerToken = JSON.parse(strangerRes.body).token;
    for (const action of ['dispute', 'revoke'] as const) {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/evidence/${evidence.id}/${action}`,
        headers: { authorization: `Bearer ${strangerToken}` },
        payload: { reason: 'Not convinced.' },
      });
      expect(res.statusCode).toBe(403);
    }

    const ownerRevoke = await app.inject({
      method: 'POST',
      url: `/api/v1/evidence/${evidence.id}/revoke`,
      headers: { authorization: `Bearer ${candidateToken}` },
      payload: { reason: 'This project is no longer maintained.' },
    });
    expect(ownerRevoke.statusCode).toBe(200);
    expect(JSON.parse(ownerRevoke.body).evidence.status).toBe('revoked');
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

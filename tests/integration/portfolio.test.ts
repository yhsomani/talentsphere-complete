import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Portfolio Showcase Integration (F-26)', () => {
  let app: FastifyInstance;

  let ownerToken: string;
  let ownerUserId: string;
  let ownerProfileId: string;

  let strangerToken: string;
  let strangerUserId: string;

  let connectedPeerToken: string;
  let connectedPeerUserId: string;

  let recruiterToken: string;
  let recruiterUserId: string;

  let publicProjectId: string;
  let connectionsProjectId: string;
  let recruitersProjectId: string;
  let privateProjectId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: 3000,
      SESSION_SECRET: 'test_jwt_secret_at_least_32_characters_long_for_security',
    });
    await app.ready();

    // 1. Register Owner Candidate
    const resOwner = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'portfolio_owner@example.com',
        password: 'Password123!',
        fullName: 'Elena Rostova',
        role: 'candidate',
      },
    });
    const bodyOwner = resOwner.json();
    ownerToken = bodyOwner.token;
    ownerUserId = bodyOwner.user.id;
    ownerProfileId = bodyOwner.profile.id;

    // 2. Register Stranger Candidate
    const resStranger = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'portfolio_stranger@example.com',
        password: 'Password123!',
        fullName: 'Sam Stranger',
        role: 'candidate',
      },
    });
    strangerToken = resStranger.json().token;
    strangerUserId = resStranger.json().user.id;

    // 3. Register Connected Peer Candidate
    const resPeer = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'portfolio_peer@example.com',
        password: 'Password123!',
        fullName: 'Paula Peer',
        role: 'candidate',
      },
    });
    connectedPeerToken = resPeer.json().token;
    connectedPeerUserId = resPeer.json().user.id;

    // 4. Register Recruiter
    const resRecruiter = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'portfolio_recruiter@example.com',
        password: 'Password123!',
        fullName: 'Rachel Recruiter',
        role: 'recruiter',
      },
    });
    recruiterToken = resRecruiter.json().token;
    recruiterUserId = resRecruiter.json().user.id;

    // 5. Establish accepted connection between Owner and Connected Peer
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/connections/request',
      headers: { authorization: `Bearer ${connectedPeerToken}` },
      payload: { recipientId: ownerUserId },
    });
    const connId = reqRes.json().connection.id;

    const acceptRes = await app.inject({
      method: 'POST',
      url: `/api/v1/connections/${connId}/respond`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { action: 'accept' },
    });
    expect(acceptRes.statusCode).toBe(200);
  });

  it('allows owner to create portfolio projects across visibility levels with media and skills', async () => {
    // 1. Create Public Project (Featured)
    const resPub = await app.inject({
      method: 'POST',
      url: '/api/v1/portfolio/projects',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Cloud-Native Distributed Database',
        description:
          'Engineered a consensus-based distributed KV store with multi-Raft clustering and MVCC.',
        projectUrl: 'https://kv-db.example.com',
        repoUrl: 'https://github.com/elena/kv-db',
        visibility: 'public',
        featured: true,
        orderIndex: 0,
        media: [
          {
            mediaUrl: 'https://images.example.com/db-architecture.png',
            mediaType: 'image',
            caption: 'Architecture Overview',
          },
        ],
      },
    });
    expect(resPub.statusCode).toBe(201);
    publicProjectId = resPub.json().project.id;
    expect(resPub.json().project.featured).toBe(true);

    // 2. Create Connections-Only Project
    const resConn = await app.inject({
      method: 'POST',
      url: '/api/v1/portfolio/projects',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Open Source Compiler Optimization Plugin',
        description:
          'LLVM pass optimizing tail-call recursions into jump instructions for high-performance ASTs.',
        visibility: 'connections_only',
        orderIndex: 1,
      },
    });
    expect(resConn.statusCode).toBe(201);
    connectionsProjectId = resConn.json().project.id;

    // 3. Create Recruiters-Only Project
    const resRec = await app.inject({
      method: 'POST',
      url: '/api/v1/portfolio/projects',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Fintech High-Frequency Risk Engine',
        description:
          'Sub-millisecond risk analysis engine evaluated by institutional hiring managers.',
        visibility: 'recruiters_only',
        orderIndex: 2,
      },
    });
    expect(resRec.statusCode).toBe(201);
    recruitersProjectId = resRec.json().project.id;

    // 4. Create Private Project
    const resPriv = await app.inject({
      method: 'POST',
      url: '/api/v1/portfolio/projects',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Stealth AI Autonomous Agent Framework',
        description:
          'Confidential research exploration for autonomous multi-agent code orchestration.',
        visibility: 'private',
        orderIndex: 3,
      },
    });
    expect(resPriv.statusCode).toBe(201);
    privateProjectId = resPriv.json().project.id;

    // Verify worker jobs were dispatched
    const jobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/internal/worker-jobs',
    });
    const createdJobs = jobsRes
      .json()
      .jobs.filter((j: any) => j.type === 'portfolio.project.created');
    expect(createdJobs.length).toBeGreaterThanOrEqual(4);
  });

  it('allows owner to list all projects regardless of visibility', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/portfolio/projects',
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().projects.length).toBe(4);
  });

  it('filters showcase properly for unconnected strangers (shows public only)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/showcase/${ownerUserId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const projects = res.json().projects;
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(publicProjectId);
    expect(projects[0].title).toBe('Cloud-Native Distributed Database');
  });

  it('filters showcase properly for connected peers (shows public + connections_only)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/showcase/${ownerUserId}`,
      headers: { authorization: `Bearer ${connectedPeerToken}` },
    });

    expect(res.statusCode).toBe(200);
    const projects = res.json().projects;
    expect(projects.length).toBe(2);
    const ids = projects.map((p: any) => p.id);
    expect(ids).toContain(publicProjectId);
    expect(ids).toContain(connectionsProjectId);
    expect(ids).not.toContain(recruitersProjectId);
    expect(ids).not.toContain(privateProjectId);
  });

  it('filters showcase properly for recruiters (shows public + recruiters_only)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/showcase/${ownerUserId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });

    expect(res.statusCode).toBe(200);
    const projects = res.json().projects;
    expect(projects.length).toBe(2);
    const ids = projects.map((p: any) => p.id);
    expect(ids).toContain(publicProjectId);
    expect(ids).toContain(recruitersProjectId);
    expect(ids).not.toContain(connectionsProjectId);
    expect(ids).not.toContain(privateProjectId);
  });

  it('enforces single project access rules and privacy boundaries', async () => {
    // 1. Stranger trying to access connections_only project -> 403
    const resDeniedConn = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${connectionsProjectId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });
    expect(resDeniedConn.statusCode).toBe(403);

    // 2. Connected peer accessing connections_only project -> 200
    const resAllowedConn = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${connectionsProjectId}`,
      headers: { authorization: `Bearer ${connectedPeerToken}` },
    });
    expect(resAllowedConn.statusCode).toBe(200);

    // 3. Stranger trying to access recruiters_only project -> 403
    const resDeniedRec = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${recruitersProjectId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });
    expect(resDeniedRec.statusCode).toBe(403);

    // 4. Recruiter accessing recruiters_only project -> 200
    const resAllowedRec = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${recruitersProjectId}`,
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(resAllowedRec.statusCode).toBe(200);

    // 5. Anyone other than owner accessing private project -> 403
    const resDeniedPriv = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${privateProjectId}`,
      headers: { authorization: `Bearer ${connectedPeerToken}` },
    });
    expect(resDeniedPriv.statusCode).toBe(403);

    // 6. Owner accessing private project -> 200
    const resAllowedPriv = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/projects/${privateProjectId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(resAllowedPriv.statusCode).toBe(200);
  });

  it('allows owner to update and delete projects, rejecting unauthorized mutations', async () => {
    // Stranger tries to update public project -> 403
    const unauthUpdate = await app.inject({
      method: 'PATCH',
      url: `/api/v1/portfolio/projects/${publicProjectId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
      payload: { title: 'Hacked Title' },
    });
    expect(unauthUpdate.statusCode).toBe(403);

    // Owner updates public project
    const authUpdate = await app.inject({
      method: 'PATCH',
      url: `/api/v1/portfolio/projects/${publicProjectId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        title: 'Cloud-Native Distributed Database v2',
        repoUrl: 'https://github.com/elena/kv-db-v2',
      },
    });
    expect(authUpdate.statusCode).toBe(200);
    expect(authUpdate.json().project.title).toBe('Cloud-Native Distributed Database v2');

    // Stranger tries to delete project -> 403
    const unauthDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/portfolio/projects/${publicProjectId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });
    expect(unauthDelete.statusCode).toBe(403);

    // Owner deletes public project
    const authDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/portfolio/projects/${publicProjectId}`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });
    expect(authDelete.statusCode).toBe(200);
    expect(authDelete.json().deletedId).toBe(publicProjectId);

    // Verify deleted project no longer appears in showcase
    const afterShowcase = await app.inject({
      method: 'GET',
      url: `/api/v1/portfolio/showcase/${ownerUserId}`,
      headers: { authorization: `Bearer ${strangerToken}` },
    });
    expect(afterShowcase.json().projects.length).toBe(0);
  });
});

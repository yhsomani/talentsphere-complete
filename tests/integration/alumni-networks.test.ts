import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

describe('Alumni Networks Integration (F-125, F-12, F-09, F-40)', () => {
  let app: FastifyInstance;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let stanfordOrgId: string;
  let mitOrgId: string;
  let aliceAffiliationId: string;
  let charlieAffiliationId: string;
  let groupId: string;
  let mentorshipId: string;

  beforeAll(async () => {
    app = await buildApp({
      NODE_ENV: 'test',
      PORT: '0',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talentsphere_test',
      JWT_SECRET: 'test_jwt_secret_min_32_characters_long_12345',
    });
    await app.ready();

    // 1. Register Alice (Stanford email)
    const reg1 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'alice@stanford.edu',
        password: 'Password123!Secure',
        fullName: 'Alice Stanford',
        role: 'candidate',
      },
    });
    const d1 = JSON.parse(reg1.body);
    user1Id = d1.user.id;
    user1Token = d1.token;

    // 2. Register Bob (Stanford email)
    const reg2 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'bob@stanford.edu',
        password: 'Password123!Secure',
        fullName: 'Bob Stanford',
        role: 'candidate',
      },
    });
    const d2 = JSON.parse(reg2.body);
    user2Id = d2.user.id;
    user2Token = d2.token;

    // 3. Register Charlie (MIT email)
    const reg3 = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'charlie@mit.edu',
        password: 'Password123!Secure',
        fullName: 'Charlie MIT',
        role: 'candidate',
      },
    });
    const d3 = JSON.parse(reg3.body);
    user3Id = d3.user.id;
    user3Token = d3.token;

    // 4. Create Stanford Organization
    const org1 = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        name: 'Stanford University',
        slug: 'stanford-university',
        website: 'https://stanford.edu',
      },
    });
    stanfordOrgId = JSON.parse(org1.body).organization.id;

    // 5. Create MIT Organization
    const org2 = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${user3Token}` },
      payload: {
        name: 'MIT',
        slug: 'mit',
        website: 'https://mit.edu',
      },
    });
    mitOrgId = JSON.parse(org2.body).organization.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('submits alumni affiliation and auto-verifies when email domain matches institution domain', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/affiliations',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        institutionId: stanfordOrgId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2021,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.affiliation.userId).toBe(user1Id);
    expect(body.affiliation.institutionId).toBe(stanfordOrgId);
    expect(body.affiliation.verificationStatus).toBe('verified');
    expect(body.affiliation.verificationMethod).toBe('email_domain');
    aliceAffiliationId = body.affiliation.id;

    // Also register Bob at Stanford
    const bobAffRes = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/affiliations',
      headers: { authorization: `Bearer ${user2Token}` },
      payload: {
        institutionId: stanfordOrgId,
        degreeType: 'masters',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2023,
      },
    });
    expect(bobAffRes.statusCode).toBe(201);
    expect(JSON.parse(bobAffRes.body).affiliation.verificationStatus).toBe('verified');
  });

  it('submits unverified affiliation when email domain does not match', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/affiliations',
      headers: { authorization: `Bearer ${user3Token}` }, // charlie@mit.edu claiming Stanford
      payload: {
        institutionId: stanfordOrgId,
        degreeType: 'bootcamp',
        fieldOfStudy: 'Data Science',
        graduationYear: 2022,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.affiliation.userId).toBe(user3Id);
    expect(body.affiliation.verificationStatus).toBe('unverified');
    charlieAffiliationId = body.affiliation.id;
  });

  it('prevents duplicate affiliation for the same degree, graduation year, and institution', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/affiliations',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        institutionId: stanfordOrgId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2021,
      },
    });

    expect(res.statusCode).toBe(409);
  });

  it('verifies affiliation via institutional seat code', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/alumni/affiliations/${charlieAffiliationId}/verify`,
      headers: { authorization: `Bearer ${user3Token}` },
      payload: {
        verificationMethod: 'institutional_seat',
        seatCode: 'STANFORD-SEAT-2022',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.affiliation.verificationStatus).toBe('verified');
    expect(body.affiliation.verificationMethod).toBe('institutional_seat');
    expect(body.affiliation.verifiedAt).toBeDefined();
  });

  it('enforces 100% cross-institution isolation on directory discovery (BR-F125-03)', async () => {
    // Charlie only has verified affiliation at Stanford now. He tries to access MIT directory where he has no affiliation yet.
    const mitDirRes = await app.inject({
      method: 'GET',
      url: `/api/v1/alumni/institutions/${mitOrgId}/directory`,
      headers: { authorization: `Bearer ${user1Token}` }, // Alice has no MIT affiliation
    });

    expect(mitDirRes.statusCode).toBe(403);
    const errBody = JSON.parse(mitDirRes.body);
    expect(errBody.error.code).toBe('TENANT_ISOLATION_VIOLATION');

    // Alice queries Stanford directory
    const stanfordDirRes = await app.inject({
      method: 'GET',
      url: `/api/v1/alumni/institutions/${stanfordOrgId}/directory`,
      headers: { authorization: `Bearer ${user1Token}` },
    });

    expect(stanfordDirRes.statusCode).toBe(200);
    const data = JSON.parse(stanfordDirRes.body);
    expect(data.directory.length).toBeGreaterThanOrEqual(2);

    // Filter by graduationYear
    const filteredRes = await app.inject({
      method: 'GET',
      url: `/api/v1/alumni/institutions/${stanfordOrgId}/directory?graduationYear=2021`,
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(filteredRes.statusCode).toBe(200);
    const filteredData = JSON.parse(filteredRes.body);
    expect(filteredData.directory).toHaveLength(1);
    expect(filteredData.directory[0].graduationYear).toBe(2021);
  });

  it('creates and joins alumni groups within an institution', async () => {
    // 1. Alice creates Silicon Valley Chapter
    const groupRes = await app.inject({
      method: 'POST',
      url: `/api/v1/alumni/institutions/${stanfordOrgId}/groups`,
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        name: 'Bay Area Stanford Tech Network',
        description: 'Silicon Valley alumni chapter for Stanford engineers',
        chapterLocation: 'San Francisco, CA',
      },
    });

    expect(groupRes.statusCode).toBe(201);
    const groupData = JSON.parse(groupRes.body);
    expect(groupData.group.name).toBe('Bay Area Stanford Tech Network');
    expect(groupData.membership.role).toBe('admin');
    groupId = groupData.group.id;

    // 2. Bob joins the group
    const joinRes = await app.inject({
      method: 'POST',
      url: `/api/v1/alumni/groups/${groupId}/join`,
      headers: { authorization: `Bearer ${user2Token}` },
      payload: { role: 'member' },
    });
    expect(joinRes.statusCode).toBe(200);

    // 3. List members
    const membersRes = await app.inject({
      method: 'GET',
      url: `/api/v1/alumni/groups/${groupId}/members`,
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(membersRes.statusCode).toBe(200);
    const membersData = JSON.parse(membersRes.body);
    expect(membersData.members).toHaveLength(2);
  });

  it('manages alumni mentorship lifecycle: request, accept, and complete', async () => {
    // 1. Bob requests mentorship from Alice
    const reqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/mentorship/request',
      headers: { authorization: `Bearer ${user2Token}` },
      payload: {
        mentorId: user1Id,
        institutionId: stanfordOrgId,
        focusAreas: ['Distributed Systems', 'Career Growth'],
      },
    });

    expect(reqRes.statusCode).toBe(201);
    const reqData = JSON.parse(reqRes.body);
    expect(reqData.mentorshipRequest.status).toBe('requested');
    expect(reqData.mentorshipRequest.focusAreas).toEqual(['Distributed Systems', 'Career Growth']);
    mentorshipId = reqData.mentorshipRequest.id;

    // 2. Self mentorship forbidden
    const selfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/alumni/mentorship/request',
      headers: { authorization: `Bearer ${user1Token}` },
      payload: {
        mentorId: user1Id,
        institutionId: stanfordOrgId,
      },
    });
    expect(selfRes.statusCode).toBe(403);

    // 3. Alice accepts mentorship
    const acceptRes = await app.inject({
      method: 'POST',
      url: `/api/v1/alumni/mentorship/${mentorshipId}/respond`,
      headers: { authorization: `Bearer ${user1Token}` },
      payload: { action: 'accept' },
    });
    expect(acceptRes.statusCode).toBe(200);
    expect(JSON.parse(acceptRes.body).mentorshipRequest.status).toBe('active');

    // 4. Bob completes mentorship
    const completeRes = await app.inject({
      method: 'POST',
      url: `/api/v1/alumni/mentorship/${mentorshipId}/respond`,
      headers: { authorization: `Bearer ${user2Token}` },
      payload: { action: 'complete' },
    });
    expect(completeRes.statusCode).toBe(200);
    expect(JSON.parse(completeRes.body).mentorshipRequest.status).toBe('completed');

    // 5. Query my mentorships
    const myMentorshipRes = await app.inject({
      method: 'GET',
      url: '/api/v1/alumni/mentorship/my',
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(myMentorshipRes.statusCode).toBe(200);
    const myData = JSON.parse(myMentorshipRes.body);
    expect(myData.mentorships.some((m: any) => m.id === mentorshipId)).toBe(true);
  });
});

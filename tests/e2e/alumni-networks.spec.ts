import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Alumni Networks, Isolation, and Mentorship (F-125, F-12, F-09, F-40)', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let stanfordOrgId: string;
  let mitOrgId: string;
  let charlieAffiliationId: string;
  let groupId: string;
  let mentorshipId: string;

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();

    // 1. Register Alice (Stanford email)
    const reg1 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `alice.alumni.${ts}@stanford.edu`,
        password: 'Password123!Secure',
        fullName: 'Alice Alum',
        role: 'candidate',
      },
    });
    expect(reg1.status()).toBe(201);
    const d1 = await reg1.json();
    user1Id = d1.user.id;
    user1Token = d1.token;

    // 2. Register Bob (Stanford email)
    const reg2 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `bob.alumni.${ts}@stanford.edu`,
        password: 'Password123!Secure',
        fullName: 'Bob Alum',
        role: 'candidate',
      },
    });
    expect(reg2.status()).toBe(201);
    const d2 = await reg2.json();
    user2Id = d2.user.id;
    user2Token = d2.token;

    // 3. Register Charlie (MIT email)
    const reg3 = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `charlie.alumni.${ts}@mit.edu`,
        password: 'Password123!Secure',
        fullName: 'Charlie Alum',
        role: 'candidate',
      },
    });
    expect(reg3.status()).toBe(201);
    const d3 = await reg3.json();
    user3Id = d3.user.id;
    user3Token = d3.token;

    // 4. Create Stanford Org
    const org1 = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        name: `Stanford University ${ts}`,
        slug: `stanford-${ts}`,
        website: 'https://stanford.edu',
      },
    });
    expect(org1.status()).toBe(201);
    stanfordOrgId = (await org1.json()).organization.id;

    // 5. Create MIT Org
    const org2 = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${user3Token}` },
      data: {
        name: `MIT ${ts}`,
        slug: `mit-${ts}`,
        website: 'https://mit.edu',
      },
    });
    expect(org2.status()).toBe(201);
    mitOrgId = (await org2.json()).organization.id;
  });

  test('submits alumni affiliations with domain auto-verification and institutional seat codes', async ({
    request,
  }) => {
    // 1. Alice submits Stanford affiliation (auto-verified via email domain)
    const affRes = await request.post(`${API_BASE}/alumni/affiliations`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        institutionId: stanfordOrgId,
        degreeType: 'bachelors',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2020,
      },
    });

    expect(affRes.status()).toBe(201);
    const affData = await affRes.json();
    expect(affData.affiliation.verificationStatus).toBe('verified');
    expect(affData.affiliation.verificationMethod).toBe('email_domain');

    // 2. Bob also registers at Stanford
    const bobAffRes = await request.post(`${API_BASE}/alumni/affiliations`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: {
        institutionId: stanfordOrgId,
        degreeType: 'masters',
        fieldOfStudy: 'Robotics',
        graduationYear: 2022,
      },
    });
    expect(bobAffRes.status()).toBe(201);
    expect((await bobAffRes.json()).affiliation.verificationStatus).toBe('verified');

    // 3. Charlie (charlie@mit.edu) claims Stanford affiliation (unverified initially)
    const charlieRes = await request.post(`${API_BASE}/alumni/affiliations`, {
      headers: { authorization: `Bearer ${user3Token}` },
      data: {
        institutionId: stanfordOrgId,
        degreeType: 'bootcamp',
        fieldOfStudy: 'Machine Learning',
        graduationYear: 2023,
      },
    });
    expect(charlieRes.status()).toBe(201);
    const charlieData = await charlieRes.json();
    expect(charlieData.affiliation.verificationStatus).toBe('unverified');
    charlieAffiliationId = charlieData.affiliation.id;

    // 4. Charlie verifies his Stanford affiliation using valid seat code
    const verifyRes = await request.post(
      `${API_BASE}/alumni/affiliations/${charlieAffiliationId}/verify`,
      {
        headers: { authorization: `Bearer ${user3Token}` },
        data: {
          verificationMethod: 'institutional_seat',
          seatCode: 'STANFORD-SEAT-2023',
        },
      }
    );
    expect(verifyRes.status()).toBe(200);
    expect((await verifyRes.json()).affiliation.verificationStatus).toBe('verified');
  });

  test('enforces strict cross-institution isolation on directory discovery (BR-F125-03)', async ({
    request,
  }) => {
    // 1. Alice has no verified affiliation at MIT -> querying MIT directory must return 403
    const mitDirRes = await request.get(`${API_BASE}/alumni/institutions/${mitOrgId}/directory`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(mitDirRes.status()).toBe(403);
    const err = await mitDirRes.json();
    expect(err.error.code).toBe('TENANT_ISOLATION_VIOLATION');

    // 2. Alice queries Stanford directory -> succeeds and returns verified alumni
    const stanfordDirRes = await request.get(
      `${API_BASE}/alumni/institutions/${stanfordOrgId}/directory`,
      {
        headers: { authorization: `Bearer ${user1Token}` },
      }
    );
    expect(stanfordDirRes.status()).toBe(200);
    const stanfordDir = await stanfordDirRes.json();
    expect(stanfordDir.directory.length).toBeGreaterThanOrEqual(2);

    // 3. Filter Stanford directory by field of study
    const searchRes = await request.get(
      `${API_BASE}/alumni/institutions/${stanfordOrgId}/directory?fieldOfStudy=Computer`,
      {
        headers: { authorization: `Bearer ${user1Token}` },
      }
    );
    expect(searchRes.status()).toBe(200);
    const searchDir = await searchRes.json();
    expect(searchDir.directory.length).toBeGreaterThanOrEqual(1);
    expect(searchDir.directory[0].fieldOfStudy).toContain('Computer Science');
  });

  test('creates, joins, and lists alumni chapter groups with institutional boundaries', async ({
    request,
  }) => {
    // 1. Alice creates Stanford chapter
    const groupRes = await request.post(`${API_BASE}/alumni/institutions/${stanfordOrgId}/groups`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        name: 'Bay Area AI Founders',
        description: 'Stanford alumni running AI startups in SF',
        chapterLocation: 'San Francisco, CA',
      },
    });
    expect(groupRes.status()).toBe(201);
    const groupData = await groupRes.json();
    expect(groupData.group.name).toBe('Bay Area AI Founders');
    groupId = groupData.group.id;

    // 2. Bob joins the group
    const joinRes = await request.post(`${API_BASE}/alumni/groups/${groupId}/join`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: { role: 'member' },
    });
    expect(joinRes.status()).toBe(200);

    // 3. List group members
    const membersRes = await request.get(`${API_BASE}/alumni/groups/${groupId}/members`, {
      headers: { authorization: `Bearer ${user1Token}` },
    });
    expect(membersRes.status()).toBe(200);
    const membersData = await membersRes.json();
    expect(membersData.members).toHaveLength(2);
  });

  test('manages alumni mentorship requests and state transitions', async ({ request }) => {
    // 1. Bob requests mentorship from Alice
    const reqRes = await request.post(`${API_BASE}/alumni/mentorship/request`, {
      headers: { authorization: `Bearer ${user2Token}` },
      data: {
        mentorId: user1Id,
        institutionId: stanfordOrgId,
        focusAreas: ['Distributed Systems', 'Foundership'],
      },
    });
    expect(reqRes.status()).toBe(201);
    const reqData = await reqRes.json();
    expect(reqData.mentorshipRequest.status).toBe('requested');
    mentorshipId = reqData.mentorshipRequest.id;

    // 2. Self mentorship forbidden
    const selfRes = await request.post(`${API_BASE}/alumni/mentorship/request`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: {
        mentorId: user1Id,
        institutionId: stanfordOrgId,
      },
    });
    expect(selfRes.status()).toBe(403);

    // 3. Alice accepts mentorship
    const acceptRes = await request.post(`${API_BASE}/alumni/mentorship/${mentorshipId}/respond`, {
      headers: { authorization: `Bearer ${user1Token}` },
      data: { action: 'accept' },
    });
    expect(acceptRes.status()).toBe(200);
    expect((await acceptRes.json()).mentorshipRequest.status).toBe('active');

    // 4. Bob completes mentorship
    const completeRes = await request.post(
      `${API_BASE}/alumni/mentorship/${mentorshipId}/respond`,
      {
        headers: { authorization: `Bearer ${user2Token}` },
        data: { action: 'complete' },
      }
    );
    expect(completeRes.status()).toBe(200);
    expect((await completeRes.json()).mentorshipRequest.status).toBe('completed');
  });
});

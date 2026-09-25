import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Saved Searches, Job Alerts & Bookmarks (F-32, F-04, F-25)', () => {
  let candidateToken: string;
  let candidateUserId: string;

  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;

  let savedSearchId: string;
  let publishedJobId: string;
  let alertId: string;

  let uniqueKeyword: string;

  test.beforeAll(async ({ request }) => {
    uniqueKeyword = `ConsensusEngine${Date.now()}`;

    // 1. Register candidate user
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.savedsearch.cand.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Robin JobSeeker',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Register recruiter and create organization
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.recruiter.alerts.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Jordan HiringLead',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;
    recruiterUserId = recData.user.id;

    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: 'Apex Distributed Technologies',
        slug: `apex-dist-tech-${Date.now()}`,
        website: 'https://apex.example.com',
        description: 'Next-gen distributed infrastructure.',
      },
    });
    expect(orgRes.status()).toBe(201);
    const orgData = await orgRes.json();
    orgId = orgData.organization.id;
  });

  test('creates, inspects, and updates candidate saved search (F-32)', async ({ request }) => {
    // 1. Create saved search
    const createRes = await request.post(`${API_BASE}/jobs/saved-searches`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        title: 'Distributed Consensus Remote Roles',
        criteria: {
          query: uniqueKeyword,
          workMode: 'remote',
          jobType: 'full_time',
        },
        alertFrequency: 'instant',
      },
    });
    expect(createRes.status()).toBe(201);
    const createData = await createRes.json();
    expect(createData.savedSearch.id).toBeDefined();
    expect(createData.savedSearch.title).toBe('Distributed Consensus Remote Roles');
    expect(createData.savedSearch.isActive).toBe(true);
    savedSearchId = createData.savedSearch.id;

    // 2. List saved searches
    const listRes = await request.get(`${API_BASE}/jobs/saved-searches`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(listData.total).toBe(1);
    expect(listData.savedSearches[0].id).toBe(savedSearchId);

    // 3. Update saved search
    const updateRes = await request.patch(`${API_BASE}/jobs/saved-searches/${savedSearchId}`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        title: 'Staff Distributed Consensus Architect',
      },
    });
    expect(updateRes.status()).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.savedSearch.title).toBe('Staff Distributed Consensus Architect');
  });

  test('dispatches job alert when matching job is published and allows running saved search (F-32, SSOT 1018)', async ({
    request,
  }) => {
    // 1. Recruiter publishes a matching job
    const postJobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: `Staff Architect ${uniqueKeyword}`,
        description: `Design fault-tolerant ${uniqueKeyword} engines with Raft and Paxos in Rust and Go.`,
        location: 'Seattle, WA',
        workMode: 'remote',
        jobType: 'full_time',
      },
    });
    expect(postJobRes.status()).toBe(201);
    const jobData = await postJobRes.json();
    publishedJobId = jobData.job.id;

    // Recruiter publishes job to trigger alert evaluation
    const pubRes = await request.patch(`${API_BASE}/jobs/${publishedJobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(pubRes.status()).toBe(200);

    // 2. Candidate receives job alert
    const alertsRes = await request.get(`${API_BASE}/jobs/alerts`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(alertsRes.status()).toBe(200);
    const alertsData = await alertsRes.json();
    expect(alertsData.total).toBeGreaterThanOrEqual(1);

    const targetAlert = alertsData.alerts.find((a: any) => a.jobId === publishedJobId);
    expect(targetAlert).toBeDefined();
    expect(targetAlert.isRead).toBe(false);
    alertId = targetAlert.id;

    // 3. Candidate marks alert as read
    const readRes = await request.patch(`${API_BASE}/jobs/alerts/${alertId}/read`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(readRes.status()).toBe(200);
    const readData = await readRes.json();
    expect(readData.alert.isRead).toBe(true);

    // 4. Candidate runs saved search on-demand
    const runRes = await request.post(`${API_BASE}/jobs/saved-searches/${savedSearchId}/run`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(runRes.status()).toBe(200);
    const runData = await runRes.json();
    expect(runData.total).toBeGreaterThanOrEqual(1);
    expect(runData.matchingJobs.some((j: any) => j.id === publishedJobId)).toBe(true);
  });

  test('manages saved job bookmarks and deletes saved search (F-04, F-25, F-32)', async ({
    request,
  }) => {
    // 1. Save job bookmark
    const saveRes = await request.post(`${API_BASE}/jobs/${publishedJobId}/save`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(saveRes.status()).toBe(201);
    const saveData = await saveRes.json();
    expect(saveData.savedJob.jobId).toBe(publishedJobId);

    // 2. Prevent duplicate bookmark
    const dupRes = await request.post(`${API_BASE}/jobs/${publishedJobId}/save`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(dupRes.status()).toBe(409);

    // 3. View saved jobs
    const listSavedRes = await request.get(`${API_BASE}/jobs/saved`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(listSavedRes.status()).toBe(200);
    const listSavedData = await listSavedRes.json();
    expect(listSavedData.total).toBe(1);
    expect(listSavedData.jobs[0].id).toBe(publishedJobId);

    // 4. Remove saved job bookmark
    const removeRes = await request.delete(`${API_BASE}/jobs/${publishedJobId}/save`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(removeRes.status()).toBe(200);

    // 5. Delete saved search
    const delSearchRes = await request.delete(`${API_BASE}/jobs/saved-searches/${savedSearchId}`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(delSearchRes.status()).toBe(200);
  });
});

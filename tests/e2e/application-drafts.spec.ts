import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Application Draft Autosave & Version Recovery (F-36, BR-18, SSOT 1015)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let candidateProfileId: string;

  let recruiterToken: string;
  let recruiterUserId: string;
  let orgId: string;
  let jobId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Register candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.drafts.cand.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Alex Candidate',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;
    candidateProfileId = candData.profile.id;

    // 2. Register recruiter and create organization
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `e2e.drafts.recruiter.${Date.now()}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Pat HiringLead',
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
        name: 'Horizon Distributed Cloud',
        slug: `horizon-cloud-${Date.now()}`,
        website: 'https://horizon.example.com',
        description: 'Next-gen distributed edge compute.',
      },
    });
    expect(orgRes.status()).toBe(201);
    const orgData = await orgRes.json();
    orgId = orgData.organization.id;

    // 3. Post and publish job
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Staff Distributed Systems Engineer',
        description: 'Lead engineering on high-throughput distributed consensus clusters.',
        location: 'Remote',
        workMode: 'remote',
        jobType: 'full_time',
      },
    });
    expect(jobRes.status()).toBe(201);
    const jobData = await jobRes.json();
    jobId = jobData.job.id;

    const pubRes = await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(pubRes.status()).toBe(200);
  });

  test('autosaves application draft, tracks versions, and enables historical recovery (F-36, BR-18, SSOT 1015)', async ({ request }) => {
    // 1. Initial autosave (Step 1)
    const draft1Res = await request.put(`${API_BASE}/jobs/${jobId}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'I have deep expertise in Paxos and Raft implementations.',
        answers: { yearsExperience: 8, remotePreference: 'full_remote' },
        stepIndex: 1,
      },
    });
    expect(draft1Res.status()).toBe(200);
    const draft1Data = await draft1Res.json();
    expect(draft1Data.version).toBe(1);
    expect(draft1Data.draft.coverLetter).toBe('I have deep expertise in Paxos and Raft implementations.');

    // 2. Continuous autosave (Step 2)
    const draft2Res = await request.put(`${API_BASE}/jobs/${jobId}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Updated with additional open-source benchmarks.',
        answers: { yearsExperience: 8, remotePreference: 'full_remote', portfolioUrl: 'https://alex.dev' },
        stepIndex: 2,
      },
    });
    expect(draft2Res.status()).toBe(200);
    const draft2Data = await draft2Res.json();
    expect(draft2Data.version).toBe(2);

    // 3. Fetch active draft with version history
    const getRes = await request.get(`${API_BASE}/jobs/${jobId}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.draft.version).toBe(2);
    expect(getData.versions.length).toBe(2);
    expect(getData.versions[0].version).toBe(1);
    expect(getData.versions[1].version).toBe(2);

    // 4. Recover / Restore previous version (BR-18)
    const restoreRes = await request.post(`${API_BASE}/jobs/${jobId}/draft/restore`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: { targetVersion: 1 },
    });
    expect(restoreRes.status()).toBe(200);
    const restoreData = await restoreRes.json();
    expect(restoreData.draft.version).toBe(3); // audit-safe forward version
    expect(restoreData.draft.coverLetter).toBe('I have deep expertise in Paxos and Raft implementations.');
    expect(restoreData.draft.stepIndex).toBe(1);

    // 5. Candidate lists all active drafts across opportunities
    const listRes = await request.get(`${API_BASE}/applications/drafts`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(listData.total).toBeGreaterThanOrEqual(1);
    const activeDraft = listData.drafts.find((d: any) => d.jobId === jobId);
    expect(activeDraft).toBeDefined();
    expect(activeDraft.job.title).toBe('Staff Distributed Systems Engineer');
  });

  test('submitting application marks draft as submitted and prevents further mutation (F-36, BR-15, SSOT 1015)', async ({ request }) => {
    // 1. Submit application
    const applyRes = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Final official application cover letter.',
      },
    });
    expect(applyRes.status()).toBe(201);

    // 2. Draft endpoint now returns 404 (draft is submitted and archived)
    const getDraftRes = await request.get(`${API_BASE}/jobs/${jobId}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getDraftRes.status()).toBe(404);

    // 3. Attempting to autosave against submitted draft fails (422 INVALID_STATE_TRANSITION)
    const mutateRes = await request.put(`${API_BASE}/jobs/${jobId}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        coverLetter: 'Attempting edit after submit',
      },
    });
    expect(mutateRes.status()).toBe(422);
  });

  test('discards active draft on candidate command (F-36)', async ({ request }) => {
    // 1. Recruiter creates second job
    const job2Res = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId,
        title: 'Distributed Infrastructure Architect',
        description: 'Design multi-region active-active cloud topologies.',
        location: 'Remote',
      },
    });
    expect(job2Res.status()).toBe(201);
    const job2Id = (await job2Res.json()).job.id;

    // 2. Candidate saves draft for job 2
    const saveRes = await request.put(`${API_BASE}/jobs/${job2Id}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: { coverLetter: 'Draft to discard' },
    });
    expect(saveRes.status()).toBe(200);

    // 3. Discard draft
    const deleteRes = await request.delete(`${API_BASE}/jobs/${job2Id}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(deleteRes.status()).toBe(200);

    // 4. Getting discarded draft returns 404
    const getRes = await request.get(`${API_BASE}/jobs/${job2Id}/draft`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(getRes.status()).toBe(404);
  });
});

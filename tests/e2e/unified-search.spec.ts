import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('E2E: Unified Multi-Entity Search & Autocomplete Discovery (F-147, BR-265, BR-266, BR-267)', () => {
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let recruiterOrgId: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const timestamp = Date.now();

    // 1. Register Candidate
    const candRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `search.user.${timestamp}@example.com`,
        password: 'Password123!Secure',
        fullName: 'Samantha Searcher',
        role: 'candidate',
      },
    });
    expect(candRes.status()).toBe(201);
    const candData = await candRes.json();
    candidateToken = candData.token;
    candidateUserId = candData.user.id;

    // 2. Register Recruiter and create organization
    const recRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `rec.search.${timestamp}@enterprise.io`,
        password: 'Password123!Secure',
        fullName: 'Roland Recruiter',
        role: 'recruiter',
      },
    });
    expect(recRes.status()).toBe(201);
    const recData = await recRes.json();
    recruiterToken = recData.token;

    const orgRes = await request.post(`${API_BASE}/organizations`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        name: `CyberCorp Innovations ${timestamp}`,
        slug: `cybercorp-innovations-${timestamp}`,
        website: 'https://cybercorp.example.com',
        description: 'Pioneering intelligent systems',
      },
    });
    expect(orgRes.status()).toBe(201);
    const orgData = await orgRes.json();
    recruiterOrgId = orgData.organization.id;

    // 3. Post a published job
    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        orgId: recruiterOrgId,
        title: 'Lead Distributed Systems Architect',
        description: 'Build planet-scale distributed key-value storage in Go and Rust',
        location: 'Zurich, Switzerland',
        workMode: 'hybrid',
        jobType: 'full_time',
      },
    });
    expect(jobRes.status()).toBe(201);
    const jobData = await jobRes.json();
    const jobId = jobData.job.id;

    const pubRes = await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: { status: 'published' },
    });
    expect(pubRes.status()).toBe(200);

    // 4. Create public portfolio project for candidate
    const projRes = await request.post(`${API_BASE}/portfolio/projects`, {
      headers: { authorization: `Bearer ${candidateToken}` },
      data: {
        title: 'Distributed Consensus Engine Raft-KV',
        description: 'Fault-tolerant distributed log replication in Rust',
        visibility: 'public',
        tags: ['rust', 'consensus'],
      },
    });
    expect(projRes.status()).toBe(201);
  });

  test('performs multi-entity cross-domain search across jobs, companies, and projects', async ({
    request,
  }) => {
    // 1. Search for jobs
    const jobSearch = await request.get(`${API_BASE}/search?query=Distributed&type=jobs`);
    expect(jobSearch.status()).toBe(200);
    const jobBody = await jobSearch.json();
    expect(jobBody.results.length).toBeGreaterThanOrEqual(1);
    expect(
      jobBody.results.some(
        (r: any) => r.type === 'job' && r.title.includes('Lead Distributed Systems')
      )
    ).toBe(true);

    // 2. Search for companies
    const compSearch = await request.get(`${API_BASE}/search?query=CyberCorp&type=companies`);
    expect(compSearch.status()).toBe(200);
    const compBody = await compSearch.json();
    expect(compBody.results.length).toBeGreaterThanOrEqual(1);
    expect(
      compBody.results.some(
        (r: any) => r.type === 'company' && r.title.includes('CyberCorp Innovations')
      )
    ).toBe(true);

    // 3. Search for projects
    const projSearch = await request.get(`${API_BASE}/search?query=Consensus&type=projects`);
    expect(projSearch.status()).toBe(200);
    const projBody = await projSearch.json();
    expect(projBody.results.length).toBeGreaterThanOrEqual(1);
    expect(
      projBody.results.some(
        (r: any) => r.type === 'project' && r.title.includes('Distributed Consensus Engine')
      )
    ).toBe(true);

    // 4. Unified all-entity search
    const allSearch = await request.get(`${API_BASE}/search?query=Distributed&type=all`);
    expect(allSearch.status()).toBe(200);
    const allBody = await allSearch.json();
    expect(allBody.results.length).toBeGreaterThanOrEqual(2);
    expect(allBody.categories.jobs).toBeGreaterThanOrEqual(1);
    expect(allBody.categories.projects).toBeGreaterThanOrEqual(1);
  });

  test('delivers sub-100ms autocomplete suggestions with prefix and typo tolerance (BR-265, BR-266)', async ({
    request,
  }) => {
    const tStart = Date.now();
    const res = await request.get(`${API_BASE}/search/autocomplete?query=distrib&limit=5`);
    const duration = Date.now() - tStart;

    expect(res.status()).toBe(200);
    expect(duration).toBeLessThan(100);

    const body = await res.json();
    expect(body.query).toBe('distrib');
    expect(body.suggestions.length).toBeGreaterThanOrEqual(1);
    expect(body.suggestions.some((s: any) => s.text.toLowerCase().includes('distributed'))).toBe(
      true
    );
  });

  test('applies multi-faceted filtering on location and minScore (BR-267)', async ({ request }) => {
    // Search with location matching Zurich
    const matchedLocRes = await request.get(
      `${API_BASE}/search?query=Architect&type=jobs&location=Zurich`
    );
    expect(matchedLocRes.status()).toBe(200);
    const matchedBody = await matchedLocRes.json();
    expect(matchedBody.results.length).toBeGreaterThanOrEqual(1);
    expect(matchedBody.results[0].subtitle).toContain('Zurich');

    // Search with non-matching location
    const unmatchLocRes = await request.get(
      `${API_BASE}/search?query=Architect&type=jobs&location=Sydney`
    );
    expect(unmatchLocRes.status()).toBe(200);
    const unmatchBody = await unmatchLocRes.json();
    expect(unmatchBody.results.length).toBe(0);

    // Search with minScore
    const minScoreRes = await request.get(`${API_BASE}/search?query=Distributed&minScore=50`);
    expect(minScoreRes.status()).toBe(200);
    const minScoreBody = await minScoreRes.json();
    expect(minScoreBody.results.every((r: any) => r.score >= 50)).toBe(true);
  });

  test('enforces zero-leakage privacy on private portfolio projects', async ({ request }) => {
    // 1. Recruiter creates private project
    const privProjRes = await request.post(`${API_BASE}/portfolio/projects`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
      data: {
        title: 'Secret Internal NextGen Kernel',
        description: 'Proprietary OS kernel research',
        visibility: 'private',
        tags: ['kernel'],
      },
    });
    expect(privProjRes.status()).toBe(201);

    // 2. Candidate searching cannot see private project
    const candSearch = await request.get(`${API_BASE}/search?query=Kernel&type=projects`, {
      headers: { authorization: `Bearer ${candidateToken}` },
    });
    expect(candSearch.status()).toBe(200);
    const candBody = await candSearch.json();
    expect(
      candBody.results.some((r: any) => r.title.includes('Secret Internal NextGen Kernel'))
    ).toBe(false);

    // 3. Unauthenticated public search cannot see private project
    const pubSearch = await request.get(`${API_BASE}/search?query=Kernel&type=projects`);
    expect(pubSearch.status()).toBe(200);
    const pubBody = await pubSearch.json();
    expect(
      pubBody.results.some((r: any) => r.title.includes('Secret Internal NextGen Kernel'))
    ).toBe(false);

    // 4. Project owner can discover it
    const ownerSearch = await request.get(`${API_BASE}/search?query=Kernel&type=projects`, {
      headers: { authorization: `Bearer ${recruiterToken}` },
    });
    expect(ownerSearch.status()).toBe(200);
    const ownerBody = await ownerSearch.json();
    expect(
      ownerBody.results.some((r: any) => r.title.includes('Secret Internal NextGen Kernel'))
    ).toBe(true);
  });
});

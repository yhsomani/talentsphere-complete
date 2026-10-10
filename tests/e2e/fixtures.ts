/**
 * Real data for browser tests. Every job, account and application used by a
 * UI test is created through the API first — the web app no longer contains
 * any hardcoded jobs or people, so tests must not pretend it does.
 */
import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE = 'http://127.0.0.1:4000/api/v1';
export const PASSWORD = 'Password123!Secure';

export interface TestAccount {
  token: string;
  user: { id: string; email: string; roles: string[] };
  profile: { id: string; fullName: string };
  email: string;
  password: string;
}

const unique = (label: string) =>
  `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;

export async function registerAccount(
  request: APIRequestContext,
  label: string,
  role: 'candidate' | 'recruiter' = 'candidate',
  fullName = role === 'recruiter' ? 'Rita Recruiter' : 'Casey Candidate'
): Promise<TestAccount> {
  const email = `${unique(label)}@example.com`;
  const res = await request.post(`${API_BASE}/auth/register`, {
    data: { email, password: PASSWORD, fullName, role },
  });
  expect(res.status(), `register ${label}`).toBe(201);
  const body = await res.json();
  return { ...body, email, password: PASSWORD };
}

/**
 * Seed a session into localStorage on the app origin. Done once (not via
 * addInitScript) so a test that expects the session to be CLEARED — a 401
 * redirect, sign-out — is not undone by the next navigation.
 */
export async function useSession(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/privacy');
  await page.evaluate(
    (session: { token: string; user: unknown }) => {
      localStorage.setItem('talentsphere_token', session.token);
      localStorage.setItem('talentsphere_user', JSON.stringify(session.user));
    },
    { token: account.token, user: account.user }
  );
}

export interface PublishedJob {
  orgId: string;
  jobId: string;
  title: string;
  orgName: string;
}

/** A recruiter, their company and one published job — all real API records. */
export async function publishJob(
  request: APIRequestContext,
  options: { title?: string; recruiter?: TestAccount } = {}
): Promise<PublishedJob & { recruiter: TestAccount }> {
  const recruiter = options.recruiter ?? (await registerAccount(request, 'recruiter', 'recruiter'));
  const auth = { authorization: `Bearer ${recruiter.token}` };
  const orgName = `Northwind ${Math.random().toString(36).slice(2, 7)}`;
  let orgId: string;
  const mine = await (
    await request.get(`${API_BASE}/organizations/mine`, { headers: auth })
  ).json();
  if (mine.organizations?.[0]) {
    orgId = mine.organizations[0].id;
  } else {
    const org = await request.post(`${API_BASE}/organizations`, {
      headers: auth,
      data: { name: orgName, slug: orgName.toLowerCase().replace(/\s+/g, '-') },
    });
    expect(org.status()).toBe(201);
    orgId = (await org.json()).organization.id;
  }
  const title = options.title ?? `Platform Engineer ${Math.random().toString(36).slice(2, 6)}`;
  const job = await request.post(`${API_BASE}/jobs`, {
    headers: auth,
    data: {
      orgId,
      title,
      description: 'Own the deployment platform end to end. Kubernetes, CI/CD, on-call.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
    },
  });
  expect(job.status()).toBe(201);
  const jobId = (await job.json()).job.id;
  const published = await request.patch(`${API_BASE}/jobs/${jobId}/status`, {
    headers: auth,
    data: { status: 'published' },
  });
  expect(published.status()).toBe(200);
  return { orgId, jobId, title, orgName, recruiter };
}

/** The message the worker would email (dev/test outbox). */
export async function outbox(request: APIRequestContext, kind: string) {
  const res = await request.get(`${API_BASE}/internal/worker-jobs`);
  const body = await res.json();
  return body.jobs
    .filter((j: { type: string }) => j.type === kind)
    .map((j: { payload: Record<string, any> }) => j.payload);
}

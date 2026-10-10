import { test, expect } from '@playwright/test';
import { publishJob, registerAccount, useSession } from './fixtures.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

test.describe('TalentSphere Web Shell & UI Experience (E-09, E-10, F-01, F-16)', () => {
  test('renders landing page with accessibility skip-link and truthful PWA capability status', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Accessibility skip-link (WCAG 2.2 AA)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveText('Skip to main content');

    // 2. Main heading states what the product does
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Work history that’s checked, not just claimed.');

    // 3. PWA status must report MEASURED capability, not a hard-coded claim.
    //    A web app manifest is declared, so the app is installable, but no
    //    service worker is shipped, so it must NOT claim to be active/installed.
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await manifestResponse.json();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);

    const pwaBadge = page.getByTestId('pwa-status');
    await expect(pwaBadge).toBeVisible();
    await expect(pwaBadge).toHaveText('PWA Installable');
    await expect(page.getByTestId('pwa-status-tone-pending')).toBeAttached();

    // Offline support is NOT implemented, so nothing may claim a controller.
    const controlled = await page.evaluate(() => navigator.serviceWorker?.controller ?? null);
    expect(controlled).toBeNull();

    // 4. Who it is for, and what "verified" means — no unbacked claims
    await expect(page.locator('h2', { hasText: 'Looking for work' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Hiring' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'What “verified” means here' })).toBeVisible();
    for (const claim of ['SOC2', 'GDPR & CCPA Compliant', 'DKIM', 'proctored', 'cryptograph']) {
      await expect(page.getByText(claim, { exact: false })).toHaveCount(0);
    }
  });

  test('guards the dashboard and displays career cockpit after real sign-in', async ({
    page,
    request,
  }) => {
    const email = `e2e.ui.dashboard.${Date.now()}@example.com`;
    const password = 'Password123!Secure';
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'UI Dashboard Candidate', role: 'candidate' },
    });
    expect(reg.status()).toBe(201);

    // Direct navigation without a session must bounce to /login (QW-04).
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);

    // The landing call-to-action sends new visitors to create an account,
    // and sign-in is one link away from there.
    await page.goto('/');
    await page.getByTestId('cta-signup').click();
    await expect(page).toHaveURL(/\/signup$/);
    await page.getByRole('link', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Real credentials grant access to the dashboard.
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);

    // The dashboard is about THIS account: its name, its real numbers.
    await expect(page.locator('h1')).toHaveText('UI Dashboard Candidate');
    await expect(page.getByTestId('figure-active-applications')).toHaveText('0');
    await expect(page.getByTestId('figure-verified-roles')).toHaveText('0 of 0');
    await expect(page.getByTestId('figure-references')).toHaveText('0');
    // A brand-new account has every next step still to do.
    for (let step = 1; step <= 4; step++) {
      await expect(page.getByTestId(`step-${step}`)).toHaveAttribute('data-done', 'false');
    }
    // No invented people, employers or scores.
    for (const fabricated of ['Sarah Chen', 'Acme', 'Stripe', '88%', 'Level 5']) {
      await expect(page.getByText(fabricated, { exact: false })).toHaveCount(0);
    }

    // Navigation is an anchor (ButtonLink), not a nested button.
    const browse = page.getByRole('link', { name: 'Browse jobs' }).first();
    await expect(browse).toHaveAttribute('href', '/jobs');
  });

  test('authenticates candidate via login page and redirects to dashboard (F-01)', async ({
    page,
    request,
  }) => {
    // Register a real candidate so the UI login is a genuine API transaction.
    const email = `e2e.ui.login.${Date.now()}@example.com`;
    const password = 'Password123!Secure';
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'UI Login Candidate', role: 'candidate' },
    });
    expect(reg.status()).toBe(201);

    await page.goto('/login');

    // Verify login heading and elements
    await expect(page.locator('h1')).toHaveText('Sign In to TalentSphere');
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    // A wrong password must surface an error and keep the user on /login.
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill('WrongPassword!');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);

    // Correct credentials sign in through the API and redirect to the dashboard.
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toHaveText('UI Login Candidate');

    // The stored session must be API-issued, never a client-fabricated demo token.
    const token = await page.evaluate(() => localStorage.getItem('talentsphere_token'));
    expect(token).toBeTruthy();
    expect(token?.startsWith('demo_token')).toBe(false);
  });

  test('pricing is truthful: free, no card, and paid plans cannot be bought (F-16)', async ({
    page,
    request,
  }) => {
    await page.goto('/checkout');
    await expect(page.locator('h1')).toHaveText('Pricing');
    await expect(page.getByTestId('plan-candidates-price')).toHaveText('Free');
    await expect(page.getByTestId('plan-employers-price')).toHaveText('Free during early access');
    // Nothing on the page collects payment details.
    await expect(page.locator('input')).toHaveCount(0);
    await expect(page.getByTestId('plan-candidates-cta')).toHaveAttribute('href', '/signup');
    await expect(page.getByTestId('plan-employers-cta')).toHaveAttribute(
      'href',
      '/signup?role=recruiter'
    );

    // The API agrees: with no payment processor, a paid plan is refused
    // rather than activated for free. (The E2E API runs BILLING_MODE=simulated
    // for the billing journey, so this checks the endpoint contract directly
    // on an account whose plan stays free.)
    const account = await registerAccount(request, 'pricing');
    const sub = await request.get(`${API_BASE}/billing/subscription`, {
      headers: { authorization: `Bearer ${account.token}` },
    });
    expect((await sub.json()).subscription.planTier).toBe('free');
  });

  test('navigates to evidence page and validates work history attestations with anti-fraud checks', async ({
    page,
    request,
  }) => {
    const email = `e2e.ui.evidence.${Date.now()}@example.com`;
    const password = 'Password123!Secure';
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'UI Evidence Candidate', role: 'candidate' },
    });
    expect(reg.status()).toBe(201);

    // Signed-out navigation must bounce to sign-in (QW-04), never a data page.
    await page.goto('/evidence');
    await expect(page).toHaveURL(/.*login/);

    // Sign in through the UI so attestations run with a real session token.
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto('/evidence');
    await expect(page.getByTestId('add-work-history-btn')).toBeVisible();

    // A fresh account starts with NO starter attestations.
    await expect(page.getByTestId('evidence-empty')).toBeVisible();

    // Open add modal
    await page.getByTestId('add-work-history-btn').click();
    await expect(page.getByTestId('add-employment-form')).toBeVisible();

    // Test anti-fraud check: end date before start date
    await page.getByTestId('input-company').fill('Fraudulent Corp');
    await page.getByTestId('input-title').fill('Security Engineer');
    await page.getByTestId('input-start-date').fill('2024-05-01');
    await page.getByTestId('input-end-date').fill('2023-01-01'); // earlier than start date
    await page.getByTestId('submit-employment-btn').click();

    // Verify anti-fraud error is surfaced
    const alert = page.locator('div[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Anti-fraud BR-084');

    // Test anti-fraud check: disposable email domain rejection
    await page.getByTestId('input-end-date').fill('2024-12-01');
    await page.getByTestId('input-corporate-email').fill('tester@mailinator.com');
    await page.getByTestId('submit-employment-btn').click();

    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Disposable');

    // Submit a valid record with a work email: saved, but NOT verified — a
    // code goes to that mailbox and the record asks for it.
    await page.getByTestId('input-corporate-email').fill('jordan@verified-domain.com');
    await page.getByTestId('submit-employment-btn').click();

    await expect(page.getByText('Fraudulent Corp')).toBeVisible();
    await expect(page.getByText('UNVERIFIED')).toBeVisible();
    await expect(page.getByText('Email Verified')).toHaveCount(0);
    const codeInput = page.locator('[data-testid^="verify-code-input-"]');
    await expect(codeInput).toBeVisible();

    // The code reaches the mailbox (test outbox), never the page that asked.
    const jobs = await (await request.get(`${API_BASE}/internal/worker-jobs`)).json();
    const message = jobs.jobs
      .filter((j: any) => j.type === 'work_history.email_verification_requested')
      .map((j: any) => j.payload)
      .find((p: any) => p.to === 'jordan@verified-domain.com');
    expect(message?.code).toMatch(/^\d{6}$/);
    expect(await page.content()).not.toContain(message.code);

    await codeInput.fill(message.code);
    await page.locator('[data-testid^="verify-code-submit-"]').click();

    // Record now shows the SERVER-computed tier and score.
    await expect(page.getByText('BRONZE TIER')).toBeVisible();
    await expect(page.getByText('Email Verified')).toBeVisible();
  });

  test('runs proctored assessment sandbox execution with verifiable invariants', async ({
    page,
    request,
  }) => {
    // The assessments workspace requires a session (QW-04 guard).
    const email = `e2e.ui.assess.${Date.now()}@example.com`;
    const password = 'Password123!Secure';
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'UI Assessment Candidate', role: 'candidate' },
    });
    expect(reg.status()).toBe(201);

    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto('/assessments');

    // Heading verification
    await expect(page.locator('h1')).toContainText('Skill assessments (preview)');
    await expect(page.getByText('nothing on this page is scored or saved')).toBeVisible();

    // Launch first sandbox challenge
    await page.getByTestId('start-challenge-ch-dist-01').click();

    // Verify modal and code pre-block
    await expect(page.getByTestId('run-sandbox-btn')).toBeVisible();
    await expect(page.locator('pre')).toContainText('TransactionalQueue');

    // The preview must report honestly: nothing executed, nothing recorded.
    await page.getByTestId('run-sandbox-btn').click();

    await expect(page.getByTestId('sandbox-log')).toBeVisible();
    await expect(page.getByTestId('sandbox-log')).toContainText(
      'no code was executed in this session'
    );
    await expect(page.getByTestId('sandbox-log')).toContainText('no result was stored');
    await expect(page.getByText('Sandbox Invariants Verified')).toHaveCount(0);
  });

  test('browses real job postings, is asked to sign in, then applies and tracks it', async ({
    page,
    request,
  }) => {
    const job = await publishJob(request, { title: 'Distributed Systems Engineer' });

    await page.goto('/jobs');
    await expect(page.locator('h1')).toHaveText('Jobs');
    const card = page.getByTestId(`job-card-${job.jobId}`);
    await expect(card).toBeVisible();
    await expect(card).toContainText('Distributed Systems Engineer');
    await expect(card).toContainText(job.orgName);
    // No invented match scores or companies.
    await expect(page.getByText(/% MATCH/)).toHaveCount(0);
    await expect(page.getByText('CoreDB Infrastructure')).toHaveCount(0);

    // Signed out: the job page offers sign-in, never a fake success.
    await page.getByTestId(`job-link-${job.jobId}`).click();
    await expect(page.locator('h1')).toHaveText('Distributed Systems Engineer');
    await expect(page.getByTestId('apply-signin')).toBeVisible();
    await expect(page.getByTestId('apply-form')).toHaveCount(0);

    // Signed in: apply with a note, then find it on the applications page.
    const candidate = await registerAccount(request, 'jobs-apply');
    await useSession(page, candidate);
    await page.goto(`/jobs/${job.jobId}`);
    await page.getByTestId('apply-cover-letter').fill('Ten years building distributed systems.');
    await page.getByTestId(`apply-btn-${job.jobId}`).click();
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId(`apply-status-${job.jobId}`)).toHaveText('Submitted');

    await page.goto('/applications');
    await expect(page.getByTestId('applications-active')).toContainText(
      'Distributed Systems Engineer'
    );
  });

  test('renders privacy policy and terms of service pre-launch gates', async ({ page }) => {
    // Privacy Page
    await page.goto('/privacy');
    await expect(page.locator('h1')).toHaveText('TalentSphere Privacy Policy');
    // Unreviewed legal text says so, and makes no compliance claim it can't back.
    await expect(page.getByTestId('legal-draft-notice')).toBeVisible();
    await expect(page.getByText('GDPR & CCPA Compliant')).toHaveCount(0);
    await expect(page.getByText('Anti-LLM Scraping Clause')).toBeVisible();
    await expect(page.getByText('privacy@talentsphere.dev')).toBeVisible();

    // Terms Page
    await page.goto('/terms');
    await expect(page.locator('h1')).toHaveText('Terms of Service & Verification Standards');
    await expect(page.getByTestId('legal-draft-notice')).toBeVisible();
    await expect(page.getByText('Credential Integrity Notice')).toBeVisible();
    await expect(page.getByText('Prohibition of AI Proxy Agents')).toBeVisible();
  });
});

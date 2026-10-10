import { test, expect } from '@playwright/test';

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

    // 2. Main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('The Career Operating System Built on');
    await expect(heading).toContainText('Verified Evidence');

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

    // 4. Feature pillars
    await expect(page.locator(':is(h2, h3):has-text("1. Talent Graph")')).toBeVisible();
    await expect(page.locator(':is(h2, h3):has-text("2. Evidence Graph")')).toBeVisible();
    await expect(page.locator(':is(h2, h3):has-text("3. Governed Intelligence")')).toBeVisible();
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

    // The landing call-to-action sends unauthenticated visitors to sign in.
    await page.goto('/');
    await page.click('text=Launch Career Cockpit');
    await expect(page).toHaveURL(/.*login/);

    // Real credentials grant access to the cockpit.
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify dashboard heading
    const dashboardTitle = page.locator('h1');
    await expect(dashboardTitle).toHaveText('Candidate Career Cockpit');

    // Verify metrics
    await expect(page.getByText('Verified Evidence', { exact: true })).toBeVisible();
    await expect(page.getByText('Skill Readiness', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Applications', { exact: true })).toBeVisible();

    // Verify action button (navigation is an anchor — ButtonLink, not a nested button)
    const actionBtn = page.getByRole('link', { name: 'Browse Assessments' });
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toHaveAttribute('href', '/assessments');
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
    await expect(page.locator('h1')).toHaveText('Candidate Career Cockpit');

    // The stored session must be API-issued, never a client-fabricated demo token.
    const token = await page.evaluate(() => localStorage.getItem('talentsphere_token'));
    expect(token).toBeTruthy();
    expect(token?.startsWith('demo_token')).toBe(false);
  });

  test('selects subscription tier and completes checkout flow with validation handling (F-16)', async ({
    page,
    request,
  }) => {
    // A real account is required: the billing endpoint refuses anonymous callers.
    const email = `e2e.ui.checkout.${Date.now()}@example.com`;
    const password = 'Password123!Secure';
    const reg = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'UI Checkout Candidate', role: 'candidate' },
    });
    expect(reg.status()).toBe(201);

    await page.goto('/checkout');

    // Verify checkout heading and plan cards
    await expect(page.locator('h1')).toHaveText('Checkout & Plan Subscriptions');
    await expect(page.getByTestId('plan-card-candidate_pro')).toBeVisible();
    await expect(page.getByTestId('plan-card-recruiter_starter')).toBeVisible();

    // Test Annual toggle
    await page.getByTestId('billing-cycle-yearly').click();
    await expect(page.getByTestId('checkout-submit')).toContainText('$199.90');

    // Test form validation on invalid card input
    await page.getByTestId('card-name').fill('Tester');
    await page.getByTestId('card-number').fill('123'); // invalid length
    await page.getByTestId('card-expiry').fill('12/28');
    await page.getByTestId('card-cvc').fill('123');
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('checkout-error')).toBeVisible();
    await expect(page.getByTestId('checkout-error')).toContainText('valid 15 or 16-digit');

    // Prefill valid test payment; without a session the API call must be
    // refused and NO confirmation may be shown.
    await page.getByTestId('prefill-payment').click();
    await page.getByTestId('checkout-submit').click();
    await expect(page.getByTestId('checkout-error')).toContainText('sign in');
    await expect(page.getByTestId('checkout-success')).toBeHidden();

    // Sign in through the UI, then repeat checkout with a real session token.
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto('/checkout');
    await page.getByTestId('billing-cycle-yearly').click();
    await page.getByTestId('card-name').fill('Tester');
    await page.getByTestId('card-number').fill('4242 4242 4242 4242');
    await page.getByTestId('card-expiry').fill('12/28');
    await page.getByTestId('card-cvc').fill('123');
    await page.getByTestId('checkout-submit').click();

    // Verify confirmation: reference must come from the API invoice, not a
    // client-generated id.
    await expect(page.getByTestId('checkout-success')).toBeVisible();
    await expect(page.getByTestId('order-reference')).toBeVisible();
    await expect(page.getByTestId('order-amount')).toHaveText('$199.90');
    const orderReference = await page.getByTestId('order-reference').textContent();
    expect(orderReference).toMatch(/^[0-9a-f-]{36}$/i); // API invoice UUID
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
    await expect(page.locator('h1')).toContainText('Proctored Capability Assessments');

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

  test('browses verifiable job opportunities and applies with verified evidence graph', async ({
    page,
  }) => {
    await page.goto('/jobs');

    // Heading verification
    await expect(page.locator('h1')).toContainText('Verifiable Career Opportunities');

    // First job card checks
    const jobCard = page.getByTestId('job-card-job-001');
    await expect(jobCard).toBeVisible();
    await expect(jobCard).toContainText('Staff Distributed Systems Engineer');
    await expect(jobCard).toContainText('94% MATCH');
    await expect(jobCard).toContainText('CoreDB Infrastructure');

    // Apply is a real API transaction: without a session it must be refused
    // and NO success state may appear.
    const applyBtn = page.getByTestId('apply-btn-job-001');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    await expect(page.getByTestId('apply-error')).toContainText('Sign in');
    await expect(jobCard).not.toContainText('Application Transmitted');
    await expect(applyBtn).toBeEnabled();
  });

  test('renders privacy policy and terms of service pre-launch gates', async ({ page }) => {
    // Privacy Page
    await page.goto('/privacy');
    await expect(page.locator('h1')).toHaveText('TalentSphere Privacy Policy');
    await expect(page.getByText('GDPR & CCPA Compliant')).toBeVisible();
    await expect(page.getByText('Anti-LLM Scraping Clause')).toBeVisible();
    await expect(page.getByText('privacy@talentsphere.dev')).toBeVisible();

    // Terms Page
    await page.goto('/terms');
    await expect(page.locator('h1')).toHaveText('Terms of Service & Verification Standards');
    await expect(page.getByText('Credential Integrity Notice')).toBeVisible();
    await expect(page.getByText('Prohibition of AI Proxy Agents')).toBeVisible();
  });
});

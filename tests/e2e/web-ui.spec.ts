import { test, expect } from '@playwright/test';

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

  test('navigates to dashboard and displays career cockpit with readiness metrics', async ({
    page,
  }) => {
    await page.goto('/');

    // Click launch career cockpit button
    await page.click('text=Launch Career Cockpit');
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify dashboard heading
    const dashboardTitle = page.locator('h1');
    await expect(dashboardTitle).toHaveText('Candidate Career Cockpit');

    // Verify metrics
    await expect(page.getByText('Verified Evidence', { exact: true })).toBeVisible();
    await expect(page.getByText('Skill Readiness', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Applications', { exact: true })).toBeVisible();

    // Verify action button
    const actionBtn = page.locator('button:has-text("Begin Verification Challenge")');
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toBeEnabled();
  });

  test('authenticates candidate via login page and redirects to dashboard (F-01)', async ({
    page,
  }) => {
    await page.goto('/login');

    // Verify login heading and elements
    await expect(page.locator('h1')).toHaveText('Sign In to TalentSphere');
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    // Prefill test credentials
    await page.getByTestId('prefill-credentials').click();
    await expect(page.getByTestId('login-email')).toHaveValue('jordan.candidate@example.com');

    // Submit form
    await page.getByTestId('login-submit').click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toHaveText('Candidate Career Cockpit');
  });

  test('selects subscription tier and completes checkout flow with validation handling (F-16)', async ({
    page,
  }) => {
    await page.goto('/checkout');

    // Verify checkout heading and plan cards
    await expect(page.locator('h1')).toHaveText('Checkout & Plan Subscriptions');
    await expect(page.getByTestId('plan-card-candidate_pro')).toBeVisible();
    await expect(page.getByTestId('plan-card-recruiter_starter')).toBeVisible();

    // Test Annual toggle
    await page.getByTestId('billing-cycle-yearly').click();
    await expect(page.getByTestId('checkout-submit')).toContainText('$279');

    // Test form validation on invalid card input
    await page.getByTestId('card-name').fill('Tester');
    await page.getByTestId('card-number').fill('123'); // invalid length
    await page.getByTestId('card-expiry').fill('12/28');
    await page.getByTestId('card-cvc').fill('123');
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('checkout-error')).toBeVisible();
    await expect(page.getByTestId('checkout-error')).toContainText('valid 15 or 16-digit');

    // Prefill valid test payment
    await page.getByTestId('prefill-payment').click();
    await page.getByTestId('checkout-submit').click();

    // Verify confirmation
    await expect(page.getByTestId('checkout-success')).toBeVisible();
    await expect(page.getByTestId('order-reference')).toBeVisible();
    await expect(page.getByTestId('order-amount')).toHaveText('$279');
  });

  test('navigates to evidence page and validates work history attestations with anti-fraud checks', async ({
    page,
  }) => {
    await page.goto('/evidence');

    // Heading verification
    await expect(page.locator('h1')).toContainText('Verified Work History');
    await expect(page.getByTestId('add-work-history-btn')).toBeVisible();

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

    // Submit valid attestation
    await page.getByTestId('input-corporate-email').fill('jordan@verified-domain.com');
    await page.getByTestId('submit-employment-btn').click();

    // Verify new record appears in list
    await expect(page.getByText('Fraudulent Corp')).toBeVisible();
  });

  test('runs proctored assessment sandbox execution with verifiable invariants', async ({
    page,
  }) => {
    await page.goto('/assessments');

    // Heading verification
    await expect(page.locator('h1')).toContainText('Proctored Capability Assessments');

    // Launch first sandbox challenge
    await page.getByTestId('start-challenge-ch-dist-01').click();

    // Verify modal and code pre-block
    await expect(page.getByTestId('run-sandbox-btn')).toBeVisible();
    await expect(page.locator('pre')).toContainText('TransactionalQueue');

    // Execute sandbox runner
    await page.getByTestId('run-sandbox-btn').click();

    // Verify execution log and verification badge
    await expect(page.getByTestId('sandbox-log')).toBeVisible();
    await expect(page.getByTestId('sandbox-log')).toContainText(
      'Test 1/3: Basic enqueue & dequeue invariant... PASS'
    );
    await expect(page.getByText('Sandbox Invariants Verified')).toBeVisible();
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

    // Apply with evidence graph
    const applyBtn = page.getByTestId('apply-btn-job-001');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // Verify state transition to transmitted
    await expect(jobCard).toContainText('Application Transmitted');
    await expect(applyBtn).toBeDisabled();
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

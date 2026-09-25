import { test, expect } from '@playwright/test';

test.describe('TalentSphere Web Shell & UI Experience (E-09, E-10, F-01)', () => {
  test('renders landing page with accessibility skip-link and PWA indicator', async ({ page }) => {
    await page.goto('/');

    // 1. Accessibility skip-link (WCAG 2.2 AA)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveText('Skip to main content');

    // 2. Main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('The Career Operating System Built on');
    await expect(heading).toContainText('Verified Evidence');

    // 3. PWA Status badge
    const pwaBadge = page.locator('text=PWA Active');
    await expect(pwaBadge).toBeVisible();

    // 4. Feature pillars
    await expect(page.locator('h2:has-text("1. Talent Graph")')).toBeVisible();
    await expect(page.locator('h2:has-text("2. Evidence Graph")')).toBeVisible();
    await expect(page.locator('h2:has-text("3. Governed Intelligence")')).toBeVisible();
  });

  test('navigates to dashboard and displays career cockpit with readiness metrics', async ({
    page,
  }) => {
    await page.goto('/');

    // Click launch dashboard button
    await page.click('text=Launch Dashboard');
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

  test('authenticates candidate via login page and redirects to dashboard (F-01)', async ({ page }) => {
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
});


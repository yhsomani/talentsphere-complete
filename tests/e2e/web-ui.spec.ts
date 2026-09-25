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

  test('navigates to dashboard and displays career cockpit with readiness metrics', async ({ page }) => {
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
});

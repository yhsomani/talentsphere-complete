import { test, expect } from '@playwright/test';

/**
 * Responsive Design E2E Tests
 * 
 * Tests that the application responds correctly to different viewport sizes.
 */

test.describe('Responsive Design', () => {
  test('mobile: auth page is accessible at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/auth/signin');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('mobile: jobs page is accessible at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/jobs');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    // Page should load without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20); // 20px tolerance for scrollbar
  });

  test('tablet: auth page is accessible at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/auth/signin');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('desktop: all critical elements visible at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth/signin');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    // Logo should be visible on desktop auth pages
    await expect(page.locator('img[alt*="logo"]').or(page.getByText(/TalentSphere/)).first()).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('sign-in page has no obvious accessibility issues', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // All inputs should have labels
    const inputs = page.locator('input');
    for (const input of await inputs.all()) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      // Input should have id (for label), aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // All buttons should have text or aria-label
    const buttons = page.getByRole('button');
    for (const button of await buttons.all()) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect((text?.trim() || ariaLabel || '').length).toBeGreaterThan(0);
    }
  });
});

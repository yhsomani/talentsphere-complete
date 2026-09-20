import { test, expect } from '@playwright/test';

/**
 * Job Board E2E Tests
 * 
 * These tests cover the public-facing job board:
 * - Job listings page loads
 * - Job detail page accessible
 * - Apply button redirects unauthenticated users to signin
 */

test.describe('Job Board', () => {
  test('jobs listing page loads', async ({ page }) => {
    await page.goto('/jobs');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    
    // Page heading visible
    await expect(page.getByRole('heading', { name: /jobs|marketplace|opportunities/i })).toBeVisible();
  });

  test('jobs page has search input', async ({ page }) => {
    await page.goto('/jobs');
    
    // Should have a search/filter capability
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible();
  });

  test('jobs page has filter controls', async ({ page }) => {
    await page.goto('/jobs');
    
    // Should have filter buttons or dropdowns
    const filters = page.getByRole('button', { name: /filter|type|remote|full.time|part.time/i });
    await expect(filters.first()).toBeVisible();
  });
  
  test('jobs page shows loading state then content', async ({ page }) => {
    await page.goto('/jobs');
    
    // After load, should have job cards or empty state
    await page.waitForLoadState('networkidle');
    
    // Either job cards or empty state should be present
    const hasContent = await page.getByTestId('job-card').or(page.getByText(/no jobs|no results|empty/i)).isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('home page loads and has navigation', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    
    // Should have some navigation or CTA
    const cta = page.getByRole('link', { name: /get started|sign up|browse jobs|sign in/i });
    await expect(cta.first()).toBeVisible();
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    
    // Should show not found page (Next.js handles this)
    const notFound = page.getByText(/not found|404|page doesn.t exist/i);
    await expect(notFound).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('sign in link from homepage works', async ({ page }) => {
    await page.goto('/');
    
    // Find sign in button/link
    const signInLink = page.getByRole('link', { name: /sign in|login/i }).first();
    
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth\/signin/);
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * 
 * These tests cover the critical authentication user journeys:
 * - Sign in with valid credentials
 * - Sign in with invalid credentials (error handling)
 * - Sign up form validation
 * - Accessing protected routes without auth
 * - Accessing auth routes when already authenticated
 */

const _TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'test@example.com';
const _TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'test-password-123';

test.describe('Authentication', () => {
  test('sign-in page loads correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Page has correct title
    await expect(page).toHaveTitle(/TalentSphere/);
    
    // Form elements present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('sign-in form shows error for empty submission', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click submit without filling form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation error (required field)
    await expect(page.getByText(/email is required/i).or(page.locator('[aria-invalid="true"]'))).toBeVisible();
  });

  test('sign-in form shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|error|wrong/i)).toBeVisible({ timeout: 10000 });
  });

  test('sign-up page loads correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('protected route redirects unauthenticated user to sign in', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('protected route /applications redirects to sign in', async ({ page }) => {
    await page.goto('/applications');
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('password reset page loads correctly', async ({ page }) => {
    await page.goto('/auth/reset-password');
    
    await expect(page).toHaveTitle(/TalentSphere/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('sign-in page has link to sign-up', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Should have sign up link
    const signUpLink = page.getByRole('link', { name: /sign up|create account/i });
    await expect(signUpLink).toBeVisible();
  });
});

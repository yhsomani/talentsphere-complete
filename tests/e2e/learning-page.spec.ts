import { test, expect } from '@playwright/test';
import { ensureCourse } from './content.js';

// Learning (F-07): the catalogue lists published courses, filters by level, and
// enrolling in a course shows a confirmation.
test.describe('E2E: Learning catalogue (F-07)', () => {
  const email = `e2e.learning.${Date.now()}@example.com`;
  const password = 'Password123!Secure';

  test.beforeAll(async ({ request }) => {
    await ensureCourse(request);
    const res = await request.post(`${'http://127.0.0.1:4000/api/v1'}/auth/register`, {
      data: { email, password, fullName: 'Learning E2E Candidate', role: 'candidate' },
    });
    expect(res.status()).toBe(201);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('lists courses, filters by level, and enrolls', async ({ page }) => {
    await page.goto('/learning');
    await expect(page.getByTestId('learning-list')).toContainText(
      'TypeScript Full-Stack Architecture'
    );

    await page.getByLabel('Level').selectOption('beginner');
    await expect(page.getByTestId('learning-empty')).toBeVisible();

    await page.getByLabel('Level').selectOption('intermediate');
    await expect(page.getByTestId('learning-list')).toContainText(
      'TypeScript Full-Stack Architecture'
    );

    await page.getByLabel('Search courses').fill('no course has this title 9137');
    await page.getByLabel('Level').selectOption('');
    await expect(page.getByTestId('learning-empty')).toBeVisible();

    await page.getByLabel('Search courses').fill('');
    await page.getByTestId('learning-enroll').first().click();
    await expect(page.getByTestId('learning-notice')).toContainText('You are enrolled');
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4100/api/v1';

// Portfolio (F-26) and Resumes (F-13): create through the real forms, then confirm
// the item comes back from the server after a reload.
test.describe('E2E: Portfolio and resumes (F-26, F-13)', () => {
  const email = `e2e.portfolio.${Date.now()}@example.com`;
  const password = 'Password123!Secure';
  const projectTitle = `Portfolio check ${Date.now()}`;
  const resumeTitle = `Resume check ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'Portfolio E2E Candidate', role: 'candidate' },
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

  test('adds a portfolio project and shows it after reload (F-26)', async ({ page }) => {
    await page.goto('/portfolio');
    await page.getByLabel('Project title').fill(projectTitle);
    await page
      .getByLabel('What you built and what you did')
      .fill('A project added by the end to end test to check the portfolio form.');
    await page.getByLabel('Live link (optional)').fill('https://example.com/demo');
    await page.getByTestId('portfolio-add').click();
    await expect(page.getByTestId('portfolio-created')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('portfolio-list')).toContainText(projectTitle);
  });

  test('creates a resume and shows it after reload (F-13)', async ({ page }) => {
    await page.goto('/resumes');
    await page.getByLabel('Resume title (optional)').fill(resumeTitle);
    await page.getByLabel('Headline (optional)').fill('Headline from the resume check');
    await page.getByTestId('resume-create').click();
    await expect(page.getByTestId('resume-created')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('resume-list')).toContainText(resumeTitle);
  });
});

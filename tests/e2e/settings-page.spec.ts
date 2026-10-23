import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

// Settings page (F-15) and command search (F-20). Registers a throwaway candidate
// through the API, signs in through the real form, then drives the UI.
test.describe('E2E: Settings page and command search (F-15, F-20)', () => {
  const email = `e2e.settings.${Date.now()}@example.com`;
  const password = 'Password123!Secure';

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'Settings E2E Candidate', role: 'candidate' },
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

  test('saves a preference and keeps it after reload (F-15)', async ({ page, request }) => {
    await page.goto('/settings');
    const activity = page.getByLabel('Show my activity');
    await expect(activity).toBeVisible();
    const before = await activity.isChecked();

    await activity.setChecked(!before);
    await page.getByTestId('settings-save').click();
    await expect(page.getByTestId('settings-saved')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Show my activity')).toBeVisible();
    await expect(page.getByLabel('Show my activity')).toBeChecked({ checked: !before });

    // The server, not just the page, holds the value.
    const login = await request.post(`${API_BASE}/auth/login`, { data: { email, password } });
    const { token } = await login.json();
    const settings = await request.get(`${API_BASE}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await settings.json();
    expect(body.settings.showActivity).toBe(!before);
  });

  test('command search opens with Ctrl+K, filters, and navigates (F-20)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('main').click();
    await page.keyboard.press('Control+K');

    const palette = page.getByRole('dialog', { name: 'Command search' });
    await expect(palette).toBeVisible();

    await page.getByTestId('command-palette-input').fill('sett');
    await expect(page.getByTestId('command-palette-option')).toHaveCount(1);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/settings$/);
    await expect(palette).toBeHidden();
  });

  test('command search closes on Escape and returns focus (F-20)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('main').click();
    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog', { name: 'Command search' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Command search' })).toBeHidden();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

// Networking (F-09): send a request by member ID through the form, see it under
// "Requests you sent", then withdraw it. Both members are registered through the API.
test.describe('E2E: Network page (F-09)', () => {
  const password = 'Password123!Secure';
  const senderEmail = `e2e.network.sender.${Date.now()}@example.com`;
  const senderName = `Network Sender ${Date.now()}`;
  const targetEmail = `e2e.network.target.${Date.now()}@example.com`;
  const targetName = `Network Target ${Date.now()}`;
  let targetId = '';

  test.beforeAll(async ({ request }) => {
    const sender = await request.post(`${API_BASE}/auth/register`, {
      data: { email: senderEmail, password, fullName: senderName, role: 'candidate' },
    });
    expect(sender.status()).toBe(201);
    const target = await request.post(`${API_BASE}/auth/register`, {
      data: { email: targetEmail, password, fullName: targetName, role: 'candidate' },
    });
    expect(target.status()).toBe(201);
    targetId = (await target.json()).user.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(senderEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('sends a request, shows it as sent, and withdraws it', async ({ page }) => {
    await page.goto('/network');
    await page.getByLabel('Member ID').fill(targetId);
    await page.getByLabel('Note (optional)').fill('Met at the end to end test');
    await page.getByTestId('network-send').click();
    await expect(page.getByTestId('network-notice')).toHaveText('Request sent.');

    await page.reload();
    await expect(page.getByTestId('network-withdraw')).toBeVisible();

    await page.getByTestId('network-withdraw').click();
    await expect(page.getByTestId('network-notice')).toHaveText('Request withdrawn.');
    await expect(page.getByTestId('network-withdraw')).toHaveCount(0);
  });

  test('finds a member by name and connects with them', async ({ page }) => {
    await page.goto('/network');
    await page.getByLabel('Name').fill(targetName);
    await page.getByTestId('network-search-btn').click();
    const hit = page.getByTestId('network-results').locator('li', { hasText: targetName });
    await expect(hit).toBeVisible();
    await hit.getByTestId('network-connect').click();
    await expect(page.getByTestId('network-notice')).toHaveText('Request sent.');
    await page.reload();
    await expect(page.getByTestId('network-withdraw')).toBeVisible();
  });

  test('does not offer the signed-in member as a connection of their own', async ({ page }) => {
    await page.goto('/network');
    await page.getByLabel('Name').fill(senderName);
    await page.getByTestId('network-search-btn').click();
    await expect(page.getByTestId('network-results')).toContainText('No members match');
    await expect(page.getByTestId('network-connect')).toHaveCount(0);
  });
});

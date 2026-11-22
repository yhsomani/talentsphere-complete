import { test, expect } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { API_BASE, registerAccount, useSession } from './fixtures.js';

// A restricted (suspended) account (K-14, K-15). The dashboard says what the
// person can still do, without promising a reports/appeal page the web does
// not have; navigation offers only the pages the API still serves; the
// profile keeps export, password and deletion but not editing; and nothing
// the web calls on the way answers 403.
test.describe('E2E: Restricted account (K-14)', () => {
  test('shows an honest notice, reduced navigation and no refused requests', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'restricted');
    const admin = createSessionToken(
      crypto.randomUUID(),
      `admin.restricted.${Date.now()}@talentsphere.internal`,
      ['platform_admin']
    );
    const suspended = await request.patch(`${API_BASE}/admin/users/${account.user.id}/status`, {
      headers: { authorization: `Bearer ${admin}` },
      data: { status: 'suspended', reason: 'e2e restricted account' },
    });
    expect(suspended.status()).toBe(200);

    const refused: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/v1/') && res.status() === 403) {
        refused.push(`${res.request().method()} ${res.url()}`);
      }
    });

    await useSession(page, account);
    await page.goto('/dashboard');

    // 1. The notice promises only what the web offers.
    const notice = page.getByTestId('restricted-notice');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('You can still download or delete your data');
    await expect(notice).not.toContainText(/appeal|reports/i);

    // 2. Navigation: Dashboard and Profile only.
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-restricted-profile')).toBeVisible();
    for (const id of ['nav-applications', 'nav-evidence', 'nav-messages', 'nav-jobs']) {
      await expect(page.getByTestId(id)).toHaveCount(0);
    }
    await expect(page.getByTestId('nav-notifications')).toHaveCount(0);
    await page.getByTestId('account-menu-toggle').click();
    await expect(page.getByTestId('nav-settings')).toHaveCount(0);
    await page.getByTestId('account-menu-toggle').click();

    // 3. Profile: no editing, export still works.
    await page.getByTestId('restricted-profile-link').click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId('profile-restricted')).toHaveText(
      'Editing is paused while your account is restricted.'
    );
    await expect(page.getByTestId('profile-form')).toHaveCount(0);
    await expect(page.getByTestId('skills')).toHaveCount(0);
    await expect(page.getByTestId('credentials')).toHaveCount(0);
    await expect(page.getByTestId('delete-account')).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByTestId('export-data').click();
    expect((await download).suggestedFilename()).toBe('talentsphere-export.json');
    await expect(page.getByTestId('export-done')).toBeVisible();

    // 4. Nothing the web asked for on the way was refused.
    expect(refused).toEqual([]);
  });
});

import { test, expect } from '@playwright/test';
import { API_BASE, PASSWORD, registerAccount, useSession } from './fixtures.js';

// Account deletion from the profile (C-04, K-13, K-15). The dialog needs the
// typed word DELETE and the current password; a wrong password is reported on
// the password field and leaves the account intact; closing the dialog starts
// the next attempt clean; the right password erases the account.
test.describe('E2E: Delete account from the profile (C-04, K-13)', () => {
  test('confirm stays disabled until DELETE and a password are both entered', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'delete.gate');
    await useSession(page, account);
    await page.goto('/profile');
    await page.getByTestId('delete-account').click();

    const confirm = page.getByTestId('delete-confirm');
    await expect(confirm).toBeDisabled();
    await page.getByTestId('delete-confirm-input').fill('DELETE');
    await expect(confirm).toBeDisabled();
    await page.getByTestId('delete-confirm-input').fill('');
    await page.getByTestId('delete-password-input').fill(PASSWORD);
    await expect(confirm).toBeDisabled();
    await page.getByTestId('delete-confirm-input').fill('DELETE');
    await expect(confirm).toBeEnabled();
  });

  test('a wrong password is shown on the field, keeps the account, and is gone after reopening', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'delete.wrong');
    await useSession(page, account);
    await page.goto('/profile');
    await page.getByTestId('delete-account').click();

    const dialog = page.getByRole('dialog');
    const password = page.getByTestId('delete-password-input');
    await page.getByTestId('delete-confirm-input').fill('DELETE');
    await password.fill('wrong-Password-1');
    await page.getByTestId('delete-confirm').click();

    // K-13: the error belongs to the password field, and focus returns to it.
    await expect(page.locator('#delete-password-error')).toHaveText(
      'Your current password is not correct.'
    );
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(password).toHaveAttribute('aria-describedby', 'delete-password-error');
    await expect(password).toBeFocused();
    await expect(password).toHaveValue('');
    await expect(page.getByTestId('delete-error')).toHaveCount(0);

    // Still signed in on this page, and the account still exists.
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: account.email, password: PASSWORD },
    });
    expect(login.status()).toBe(200);

    // Typing again clears the field error.
    await password.fill('x');
    await expect(page.locator('#delete-password-error')).toHaveCount(0);
    await expect(password).toHaveAttribute('aria-invalid', 'false');

    // K-13: closing and reopening starts clean.
    await page.getByRole('button', { name: 'Keep my account' }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByTestId('delete-account').click();
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toContainText('Your current password is not correct.');
    await expect(page.getByTestId('delete-confirm-input')).toHaveValue('');
    await expect(page.getByTestId('delete-password-input')).toHaveValue('');
    await expect(page.getByTestId('delete-confirm')).toBeDisabled();
  });

  test('the right password deletes the account and signs out', async ({ page, request }) => {
    const account = await registerAccount(request, 'delete.right');
    await useSession(page, account);
    await page.goto('/profile');
    await page.getByTestId('delete-account').click();
    await page.getByTestId('delete-confirm-input').fill('DELETE');
    await page.getByTestId('delete-password-input').fill(PASSWORD);
    await page.getByTestId('delete-confirm').click();

    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => localStorage.getItem('talentsphere_token'))).toBeNull();
    const login = await request.post(`${API_BASE}/auth/login`, {
      data: { email: account.email, password: PASSWORD },
    });
    expect(login.status()).toBe(401);
  });
});

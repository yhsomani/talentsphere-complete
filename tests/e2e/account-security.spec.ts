/**
 * Changing a password from the profile page ends every other session and
 * keeps this one. Before 2026-10-11 there was no way to change a password,
 * and a stolen session token stayed valid for up to 24 hours.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, PASSWORD, registerAccount, useSession } from './fixtures.js';

test('changing the password signs out the other device and keeps this one', async ({
  browser,
  request,
}) => {
  const account = await registerAccount(request, 'pw-change');
  const otherLogin = await request.post(`${API_BASE}/auth/login`, {
    data: { email: account.email, password: PASSWORD },
  });
  const other = { ...account, token: (await otherLogin.json()).token };

  const here = await (await browser.newContext()).newPage();
  const elsewhere = await (await browser.newContext()).newPage();
  await useSession(here, account);
  await useSession(elsewhere, other);
  await elsewhere.goto('/dashboard');
  await expect(elsewhere.locator('h1')).toHaveText(account.profile.fullName);

  await here.goto('/profile');
  // A wrong current password is reported on that field, and nothing changes.
  await here.getByTestId('password-current').fill('not-my-password');
  await here.getByTestId('password-new').fill('a-brand-new-passphrase');
  await here.getByTestId('password-confirm').fill('a-brand-new-passphrase');
  await here.getByTestId('password-submit').click();
  await expect(here.getByText('Your current password is not correct.')).toBeVisible();

  await here.getByTestId('password-current').fill(PASSWORD);
  await here.getByTestId('password-submit').click();
  await expect(here.getByTestId('password-changed')).toBeVisible();

  // This device stays signed in across a reload...
  await here.reload();
  await expect(here.getByTestId('password-form')).toBeVisible();
  await expect(here).toHaveURL(/\/profile$/);

  // ...the other one is sent to sign in on its next request...
  await elsewhere.goto('/dashboard');
  await elsewhere.waitForURL('**/login**');

  // ...where only the new password works.
  await elsewhere.getByTestId('login-email').fill(account.email);
  await elsewhere.getByTestId('login-password').fill(PASSWORD);
  await elsewhere.getByTestId('login-submit').click();
  await expect(elsewhere.getByTestId('login-error')).toBeVisible();
  await elsewhere.getByTestId('login-password').fill('a-brand-new-passphrase');
  await elsewhere.getByTestId('login-submit').click();
  await elsewhere.waitForURL('**/dashboard');
});

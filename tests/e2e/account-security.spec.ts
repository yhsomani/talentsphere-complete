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
  // ...and told why, not dropped there unexplained.
  await expect(elsewhere.getByTestId('login-session-ended')).toHaveText(
    'This session was ended from another device. Sign in again.'
  );

  // The reason is shown once, not on every later visit to sign-in.
  await elsewhere.reload();
  await expect(elsewhere.getByTestId('login-form')).toBeVisible();
  await expect(elsewhere.getByTestId('login-session-ended')).toHaveCount(0);

  // ...where only the new password works.
  await elsewhere.getByTestId('login-email').fill(account.email);
  await elsewhere.getByTestId('login-password').fill(PASSWORD);
  await elsewhere.getByTestId('login-submit').click();
  await expect(elsewhere.getByTestId('login-error')).toBeVisible();
  await elsewhere.getByTestId('login-password').fill('a-brand-new-passphrase');
  await elsewhere.getByTestId('login-submit').click();
  await elsewhere.waitForURL('**/dashboard');
});

test('signing out ends the session on the server, not only in this browser', async ({
  page,
  request,
}) => {
  const account = await registerAccount(request, 'sign-out-server');
  const otherLogin = await request.post(`${API_BASE}/auth/login`, {
    data: { email: account.email, password: PASSWORD },
  });
  const otherToken = (await otherLogin.json()).token as string;

  await useSession(page, account);
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toHaveText(account.profile.fullName);
  // Sign out lives in the account menu.
  await page.getByTestId('account-menu-toggle').click();
  await page.getByTestId('account-menu').getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  // Signing out on purpose needs no explanation.
  await expect(page.getByTestId('login-form')).toBeVisible();
  await expect(page.getByTestId('login-session-ended')).toHaveCount(0);

  // The token this browser held is now refused by the API (before
  // 2026-10-11 it kept working for up to 24 hours)...
  const sessionWith = (token: string) =>
    request.get(`${API_BASE}/auth/session`, { headers: { authorization: `Bearer ${token}` } });
  await expect.poll(async () => (await sessionWith(account.token)).status()).toBe(401);
  // ...while the person's session on another device is untouched.
  expect((await sessionWith(otherToken)).status()).toBe(200);
});

test('signing out of other devices ends the other session and keeps this one', async ({
  browser,
  request,
}) => {
  const account = await registerAccount(request, 'other-devices');
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
  await here.getByRole('button', { name: 'Sign out of other devices' }).click();
  await expect(here.getByTestId('sign-out-others-done')).toHaveText(
    'Signed out of every other device. This one stays signed in.'
  );

  // This device stays signed in across a reload...
  await here.reload();
  await expect(here.getByTestId('sign-out-others')).toBeVisible();
  await expect(here).toHaveURL(/\/profile$/);
  // ...the other one is sent to sign in on its next request, and the
  // unchanged password still works there. An in-app navigation, not a page
  // load: it fires several requests at once, and every one of them gets 401.
  await elsewhere.getByTestId('nav-evidence').click();
  // Assert the final URL without waiting for a load event: simultaneous 401
  // responses can trigger overlapping client-side navigations, aborting load.
  // The next assertion still requires the precise revoked-session message.
  await expect(elsewhere).toHaveURL(/\/login(?:\?|$)/);
  // ...and told why, not dropped there unexplained.
  await expect(elsewhere.getByTestId('login-session-ended')).toHaveText(
    'This session was ended from another device. Sign in again.'
  );
  await elsewhere.getByTestId('login-email').fill(account.email);
  await elsewhere.getByTestId('login-password').fill(PASSWORD);
  await elsewhere.getByTestId('login-submit').click();
  // Back where it was heading (?return=).
  await elsewhere.waitForURL('**/evidence');
});

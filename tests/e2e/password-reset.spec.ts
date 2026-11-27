/**
 * Forgotten password (ADR-019): from the sign-in page, ask for a link, open
 * it, set a new password, and sign in with it. The old session and the old
 * password stop working, and the link works only once.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, PASSWORD, outbox, registerAccount, useSession } from './fixtures.js';

test('a forgotten password can be reset from an emailed link', async ({ browser, request }) => {
  const account = await registerAccount(request, 'pw-reset');
  const elsewhere = await (await browser.newContext()).newPage();
  await useSession(elsewhere, account);

  const page = await (await browser.newContext()).newPage();
  await page.goto('/login');
  await page.getByTestId('login-forgot-link').click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByTestId('forgot-email').fill(account.email);
  await page.getByTestId('forgot-submit').click();
  await expect(page.getByTestId('forgot-sent')).toContainText('If an account uses that email');

  const [mail] = (await outbox(request, 'auth.password_reset_requested')).filter(
    (p: { to: string }) => p.to === account.email
  );
  expect(mail?.token).toBeTruthy();

  await page.goto(`/reset-password#token=${mail.token}`);
  await page.getByTestId('reset-new').fill('a-brand-new-passphrase');
  await page.getByTestId('reset-confirm').fill('a-different-passphrase');
  await page.getByTestId('reset-submit').click();
  await expect(page.getByText('The two passwords do not match.')).toBeVisible();
  await page.getByTestId('reset-confirm').fill('a-brand-new-passphrase');
  await page.getByTestId('reset-submit').click();
  await expect(page.getByTestId('reset-done')).toBeVisible();

  // The other device was signed out; the old password no longer works.
  await elsewhere.goto('/dashboard');
  await expect(elsewhere).toHaveURL(/\/login/);
  const old = await request.post(`${API_BASE}/auth/login`, {
    data: { email: account.email, password: PASSWORD },
  });
  expect(old.status()).toBe(401);

  await page.getByTestId('reset-sign-in').click();
  await page.getByTestId('login-email').fill(account.email);
  await page.getByTestId('login-password').fill('a-brand-new-passphrase');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // The same link a second time is refused, with a way to ask again.
  const again = await (await browser.newContext()).newPage();
  await again.goto(`/reset-password#token=${mail.token}`);
  await again.getByTestId('reset-new').fill('yet-another-passphrase');
  await again.getByTestId('reset-confirm').fill('yet-another-passphrase');
  await again.getByTestId('reset-submit').click();
  await expect(again.getByTestId('reset-link-problem')).toContainText('already used');
});

test('a reset link without a token says so', async ({ page }) => {
  await page.goto('/reset-password');
  await expect(page.getByTestId('reset-link-problem')).toContainText('incomplete');
});

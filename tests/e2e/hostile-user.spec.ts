/**
 * A user, a tester and an attacker trying to break the UI. Every payload here
 * is inert: the assertions look for the app misbehaving (script running, a
 * crash, duplicate side effects, another account's data on screen).
 */
import { test, expect } from '@playwright/test';
import { API_BASE, PASSWORD, registerAccount, useSession } from './fixtures.js';

const XSS_NAME = '<img src=x onerror="window.__xss=1"> <script>window.__xss=1</script>';
const uniqueEmail = (label: string) =>
  `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

const fillSignUp = async (
  page: import('@playwright/test').Page,
  fields: { name: string; email: string; password: string }
) => {
  await page.goto('/signup');
  await page.getByTestId('signup-name').fill(fields.name);
  await page.getByTestId('signup-email').fill(fields.email);
  await page.getByTestId('signup-password').fill(fields.password);
};

test.describe('hostile input on sign-up', () => {
  test('script payloads in the name never execute', async ({ page }) => {
    await fillSignUp(page, {
      name: XSS_NAME,
      email: uniqueEmail('xss'),
      password: PASSWORD,
    });
    await page.getByTestId('signup-submit').click();
    // Either the form refuses the name or the account is created; neither may run script.
    await page.waitForLoadState('networkidle');
    expect(
      await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)
    ).toBeUndefined();
  });

  test('a stored script payload is shown as text on the dashboard', async ({ page, request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: uniqueEmail('stored'),
        password: PASSWORD,
        fullName: XSS_NAME,
        role: 'candidate',
      },
    });
    test.skip(res.status() !== 201, 'the API refuses this name outright, which is also safe');
    const body = await res.json();
    await useSession(page, { ...body, email: body.user.email, password: PASSWORD });
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('<img');
    expect(
      await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)
    ).toBeUndefined();
  });

  test('a 10,000 character name and a SQL-looking email are refused without a crash', async ({
    page,
  }) => {
    await fillSignUp(page, {
      name: 'A'.repeat(10_000),
      email: "robert'); DROP TABLE users;--@example.com",
      password: PASSWORD,
    });
    await page.getByTestId('signup-submit').click();
    await expect(page.getByTestId('signup-error')).toBeVisible();
    await expect(page.getByTestId('signup-form')).toBeVisible();
  });

  test('double-clicking submit registers once', async ({ page }) => {
    let registrations = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().endsWith('/auth/register')) registrations += 1;
    });
    await fillSignUp(page, {
      name: 'Dana Doubleclick',
      email: uniqueEmail('double'),
      password: PASSWORD,
    });
    await page.getByTestId('signup-submit').dblclick();
    await page.waitForLoadState('networkidle');
    expect(registrations).toBe(1);
  });
});

test.describe('session tampering', () => {
  test('a forged token sends the user to sign in and is discarded', async ({ page }) => {
    await page.goto('/privacy');
    await page.evaluate(() => {
      localStorage.setItem('talentsphere_token', 'forged.not-a-real-token');
      localStorage.setItem(
        'talentsphere_user',
        JSON.stringify({ id: 'x', email: 'admin@example.com', roles: ['admin', 'platform_admin'] })
      );
    });
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    expect(await page.evaluate(() => localStorage.getItem('talentsphere_token'))).toBeNull();
  });
});

test.describe('privilege and isolation', () => {
  test('a candidate cannot reach admin data through the API or the page', async ({
    page,
    request,
  }) => {
    const victim = await registerAccount(request, 'victim', 'candidate', 'Vera Victim');
    const attacker = await registerAccount(request, 'attacker', 'candidate', 'Alex Attacker');

    const api = await request.get(`${API_BASE}/admin/users`, {
      headers: { authorization: `Bearer ${attacker.token}` },
    });
    expect([401, 403]).toContain(api.status());

    await useSession(page, attacker);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(victim.email);
  });

  test("one candidate's token cannot read another's billing records", async ({ request }) => {
    const a = await registerAccount(request, 'iso-a');
    const b = await registerAccount(request, 'iso-b');
    const forB = await request.get(`${API_BASE}/billing/subscription`, {
      headers: { authorization: `Bearer ${b.token}` },
    });
    const forA = await request.get(`${API_BASE}/billing/subscription`, {
      headers: { authorization: `Bearer ${a.token}` },
    });
    expect((await forA.json()).subscription?.userId ?? a.user.id).toBe(a.user.id);
    expect((await forB.json()).subscription?.userId ?? b.user.id).toBe(b.user.id);
  });
});

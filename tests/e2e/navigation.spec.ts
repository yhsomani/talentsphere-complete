import { test, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

/**
 * Navigation & IA contract verdicts (navigation/IA audit 2026-10-08).
 *
 * Covers what the header/footer rework promises: guarded deep links resume
 * through ?return=, sign-out really leaves protected UI, the 404 page offers
 * working destinations, no route nests an interactive control inside a link,
 * client navigation announces itself, the active destination is marked with
 * aria-current, the mobile menu is a dismissable disclosure with a focus
 * handoff, the billing cycle toggle exposes pressed state, the modal traps
 * Tab until Escape, and push navigation resets the viewport to the top.
 * Plan-radio roving tabindex and arrow keys are asserted in
 * accessibility.spec.ts (duplicate coverage there, not here).
 */

async function mintSession(page: Page, request: APIRequestContext, label: string) {
  const registered = await request.post(`${API_BASE}/auth/register`, {
    data: {
      email: `nav.${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`,
      password: 'Password123!Secure',
      fullName: 'Nav Probe',
      role: 'candidate',
    },
  });
  expect(registered.status()).toBe(201);
  const { token, user } = await registered.json();
  await page.addInitScript(
    (session: { token: string; user: unknown }) => {
      localStorage.setItem('talentsphere_token', session.token);
      localStorage.setItem('talentsphere_user', JSON.stringify(session.user));
    },
    { token, user }
  );
}

test.describe('NAV: deep links and session transitions', () => {
  test('a guarded deep link resumes after sign-in via ?return=', async ({ page, request }) => {
    const email = `nav.resume.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
    const password = 'Password123!Secure';
    const registered = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password, fullName: 'Nav Resume', role: 'candidate' },
    });
    expect(registered.status()).toBe(201);

    await page.goto('/evidence');
    await expect(page).toHaveURL(/\/login\?return=%2Fevidence$/);
    await expect(page.getByTestId('login-form')).toBeVisible();

    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/evidence$/);
    await expect(page.locator('h1')).toContainText('Work history');
  });

  test('sign-out clears the session and parks the user on /login', async ({ page, request }) => {
    await mintSession(page, request, 'signout');

    await page.goto('/dashboard');
    await expect(page.locator('h1')).toBeVisible();

    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('talentsphere_token'))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('talentsphere_user'))).toBeNull();

    // A cleared session must bounce a protected route again. Use a fresh
    // page: this test's addInitScript would re-seed the token into every
    // navigation of `page`, which would fake a surviving session.
    const fresh = await page.context().newPage();
    await fresh.goto('/dashboard');
    await expect(fresh).toHaveURL(/\/login\?return=%2Fdashboard$/);
    await fresh.close();
  });

  test('an unknown path renders the 404 page with working destinations', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.locator('h1')).toHaveText('Page Not Found');
    await expect(page.getByTestId('not-found-home')).toBeVisible();
    await expect(page.getByTestId('not-found-dashboard')).toBeVisible();
    await expect(page.getByTestId('not-found-jobs')).toBeVisible();

    await page.getByTestId('not-found-jobs').click();
    await expect(page).toHaveURL(/\/jobs$/);
  });

  test('no route nests an interactive control inside a link', async ({ page, request }) => {
    await mintSession(page, request, 'nesting');
    const routes = [
      '/',
      '/jobs',
      '/checkout',
      '/login',
      '/dashboard',
      '/evidence',
      '/assessments',
      '/no-such-page',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('a button'), `nested <button> inside <a> on ${route}`).toHaveCount(
        0
      );
    }
  });
});

test.describe('NAV: announcements, current-page state, scroll', () => {
  test('client-side navigation retitles the document and announces it', async ({ page }) => {
    await page.goto('/');
    const homeTitle = await page.title();

    await page.getByTestId('nav-jobs').click();
    await expect(page).toHaveURL(/\/jobs$/);

    // The destination's title is set by its page effect, which can land a
    // beat after the URL does — wait for the change instead of one read.
    await expect.poll(() => page.title()).not.toBe(homeTitle);
    const jobsTitle = await page.title();
    // The live region echoes document.title, which child page effects set
    // before this parent effect reads it (Layout route effect).
    await expect
      .poll(async () => (await page.getByTestId('route-announcer').textContent())?.trim())
      .toBe(jobsTitle.trim());
  });

  test('the active header destination carries aria-current="page"', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByTestId('nav-jobs')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-evidence')).not.toHaveAttribute('aria-current', 'page');
  });

  test('push navigation returns the viewport to the top', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    // Synthetic click: no auto-scroll to the header, so the reset under test
    // is the route effect's, not the browser's.
    await page.evaluate(() =>
      document.querySelector<HTMLElement>('[data-testid="nav-jobs"]')?.click()
    );
    await expect(page).toHaveURL(/\/jobs$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe('NAV: disclosures and overlays', () => {
  test('mobile menu is a dismissable disclosure with focus handoff', async ({ page, request }) => {
    await mintSession(page, request, 'mobile');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggle = page.getByTestId('mobile-menu-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('mobile-menu')).toBeHidden();
    await expect(toggle).toBeFocused();

    // Choosing a destination closes the menu on route change; the link that
    // unmounts must not strand focus on <body>.
    await toggle.click();
    await page.getByTestId('mobile-nav-evidence').click();
    await expect(page).toHaveURL(/\/evidence$/);
    await expect(page.getByTestId('mobile-menu')).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id ?? ''))
      .toBe('main-content');
  });

  test('modal traps Tab, closes on Escape and restores focus to its opener', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'modal');
    await page.goto('/evidence');

    const opener = page.getByTestId('add-work-history-btn');
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const focusInsideDialog = () =>
      page.evaluate(() => {
        const panel = document.querySelector('[role="dialog"]');
        return !!panel && panel.contains(document.activeElement);
      });

    await expect.poll(focusInsideDialog).toBe(true);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
    }
    await expect.poll(focusInsideDialog).toBe(true);
    await page.keyboard.press('Shift+Tab');
    await expect.poll(focusInsideDialog).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('the billing cycle toggle exposes pressed state', async ({ page }) => {
    await page.goto('/checkout');
    const monthly = page.getByTestId('billing-cycle-monthly');
    const yearly = page.getByTestId('billing-cycle-yearly');
    await expect(monthly).toHaveAttribute('aria-pressed', 'true');
    await expect(yearly).toHaveAttribute('aria-pressed', 'false');

    await yearly.click();
    await expect(monthly).toHaveAttribute('aria-pressed', 'false');
    await expect(yearly).toHaveAttribute('aria-pressed', 'true');
  });
});

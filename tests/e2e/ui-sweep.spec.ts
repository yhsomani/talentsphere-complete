/**
 * Tester and attacker sweep over every list page: what a signed-in user would
 * see must load without script errors, failed requests or broken text, and
 * hostile URLs must not run script or send the user to another site.
 */
import { test, expect, type Page } from '@playwright/test';
import { API_BASE, PASSWORD, registerAccount, useSession } from './fixtures.js';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/jobs', '/privacy', '/terms', '/checkout'];
const MEMBER_ROUTES = [
  '/dashboard',
  '/applications',
  '/evidence',
  '/profile',
  '/settings',
  '/portfolio',
  '/resumes',
  '/network',
  '/learning',
  '/career',
  '/notifications',
  '/messages',
  '/assessments',
];
const RECRUITER_ROUTES = ['/dashboard', '/hiring', '/messages', '/notifications', '/settings'];
const BROKEN_TEXT = /\bundefined\b|\[object Object\]|\bNaN\b/;

interface Findings {
  scriptErrors: string[];
  failedRequests: string[];
}

function watch(page: Page): Findings {
  const found: Findings = { scriptErrors: [], failedRequests: [] };
  page.on('pageerror', (e) => found.scriptErrors.push(e.message));
  page.on('response', (r) => {
    // A 4xx is an honest API answer; a 5xx is a server fault the user would hit.
    if (r.status() >= 500) found.failedRequests.push(`${r.status()} ${r.url()}`);
  });
  return found;
}

async function sweep(page: Page, routes: string[]) {
  const found = watch(page);
  const problems: string[] = [];
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    const broken = text.match(BROKEN_TEXT);
    if (broken) problems.push(`${route}: broken text "${broken[0]}"`);
    if ((await page.locator('h1').count()) === 0) problems.push(`${route}: no h1`);
    if (new URL(page.url()).pathname === '/login' && route !== '/login') {
      problems.push(`${route}: signed-in user was sent to /login`);
    }
  }
  problems.push(...found.scriptErrors.map((e) => `script error: ${e}`));
  problems.push(...found.failedRequests.map((e) => `server error: ${e}`));
  return problems;
}

test.describe('route sweep', () => {
  test('public pages load cleanly', async ({ page }) => {
    expect(await sweep(page, PUBLIC_ROUTES)).toEqual([]);
  });

  test('every candidate page loads cleanly', async ({ page, request }) => {
    await useSession(page, await registerAccount(request, 'sweep-cand'));
    expect(await sweep(page, MEMBER_ROUTES)).toEqual([]);
  });

  test('every recruiter page loads cleanly', async ({ page, request }) => {
    await useSession(page, await registerAccount(request, 'sweep-rec', 'recruiter'));
    expect(await sweep(page, RECRUITER_ROUTES)).toEqual([]);
  });
});

test.describe('hostile URLs', () => {
  const HOSTILE_PATHS = [
    '/jobs/%00',
    '/jobs/<script>window.__xss=1</script>',
    '/verify/%3Cimg%20src%3Dx%20onerror%3Dwindow.__xss%3D1%3E',
    '/reference/..%2F..%2Fetc%2Fpasswd',
    '/messages/%27%20OR%201%3D1--',
    '/definitely/not/a/page',
  ];

  for (const path of HOSTILE_PATHS) {
    test(`${path} neither runs script nor crashes the shell`, async ({ page }) => {
      const found = watch(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(
        await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)
      ).toBeUndefined();
      expect(found.scriptErrors).toEqual([]);
      await expect(page.locator('header, nav, main').first()).toBeVisible();
    });
  }

  for (const target of [
    'https://evil.example/phish',
    '//evil.example',
    'javascript:window.__xss=1',
  ]) {
    test(`sign-in with return=${target} stays on this site`, async ({ page, request }) => {
      const account = await registerAccount(request, 'redirect');
      await page.goto(`/login?return=${encodeURIComponent(target)}`);
      await page.getByTestId('login-email').fill(account.email);
      await page.getByTestId('login-password').fill(PASSWORD);
      await page.getByTestId('login-submit').click();
      await page.waitForLoadState('networkidle');
      expect(new URL(page.url()).origin).toBe('http://127.0.0.1:4173');
      expect(
        await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)
      ).toBeUndefined();
    });
  }
});

test('the API answers hostile bodies with a client error, never a 5xx', async ({ request }) => {
  const attempts: Array<[string, unknown]> = [
    [
      'auth/register',
      {
        email: 'a'.repeat(5000) + '@example.com',
        password: PASSWORD,
        fullName: 'x',
        role: 'candidate',
      },
    ],
    ['auth/register', { email: 'z@example.com', password: PASSWORD, fullName: 'x', role: 'admin' }],
    ['auth/login', { email: { $ne: null }, password: { $ne: null } }],
    ['auth/login', '{"email":'],
    ['jobs/saved-searches', []],
  ];
  const statuses: number[] = [];
  for (const [path, data] of attempts) {
    const res = await request.post(`${API_BASE}/${path}`, { data: data as never });
    statuses.push(res.status());
  }
  expect(statuses.filter((s) => s >= 500)).toEqual([]);
});

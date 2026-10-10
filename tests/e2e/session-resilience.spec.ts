/**
 * When the API cannot confirm the session (throttled, server fault), the
 * dashboard says why and retries in place. Found by driving the running app
 * with Reticle (2026-10-10): after the global rate limit tripped, the page said
 * "Refresh to try again" — and every refresh spent more of the budget.
 */
import { test, expect } from '@playwright/test';
import { registerAccount, useSession } from './fixtures.js';

test('a throttled session check explains itself and recovers with Try again', async ({
  page,
  request,
}) => {
  const account = await registerAccount(request, 'throttled', 'candidate', 'Tara Throttled');
  await useSession(page, account);

  let throttle = true;
  await page.route('**/api/v1/auth/session', async (route) => {
    if (!throttle) return route.fallback();
    await route.fulfill({
      status: 429,
      headers: { 'retry-after': '30', 'content-type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Wait a moment, then try again.',
          request_id: 'req_test',
        },
      }),
    });
  });

  await page.goto('/dashboard');
  const notice = page.getByTestId('session-error');
  await expect(notice).toContainText('We could not confirm your session.');
  await expect(notice).toContainText('Too many requests right now. Try again in 30 seconds.');
  await expect(notice).not.toContainText('Refresh');

  throttle = false;
  await page.getByTestId('session-retry').click();
  await expect(page.locator('h1')).toHaveText('Tara Throttled');
  await expect(notice).toHaveCount(0);
});

import { test, expect } from '@playwright/test';
import { registerAccount, useSession } from './fixtures.js';

/**
 * C-21 (a): retrying a failed checkout for the same plan and cycle sends the
 * same idempotencyKey, so the server (and Stripe) return the existing
 * Checkout Session instead of opening a second one. Changing the cycle is a
 * new purchase and gets a new key. Billing is disabled in the e2e API, so the
 * plans and checkout responses are intercepted.
 */
const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

test('checkout retries reuse one idempotency key per plan and cycle', async ({ page, request }) => {
  const account = await registerAccount(request, 'checkout-key');
  await useSession(page, account);

  await page.route('**/api/v1/billing/plans', (route) =>
    route.fulfill(
      json({
        checkoutEnabled: true,
        plans: [
          {
            tier: 'candidate_pro',
            name: 'Candidate Pro',
            description: 'Test plan',
            priceMonthlyCents: 1999,
            priceYearlyCents: 19999,
            features: ['Test feature'],
            currency: 'USD',
            targetRole: 'candidate',
          },
        ],
      })
    )
  );
  const bodies: Array<{ planTier: string; billingCycle: string; idempotencyKey?: string }> = [];
  await page.route('**/api/v1/billing/checkout', (route) => {
    bodies.push(route.request().postDataJSON());
    // Every attempt fails, so the page stays put and the user can retry.
    return route.fulfill(
      json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Try again in a moment.',
            request_id: 'r',
          },
        },
        503
      )
    );
  });

  await page.goto('/checkout');
  const subscribe = page.getByTestId('subscribe-candidate_pro');
  await expect(subscribe).toBeEnabled();
  await subscribe.click();
  await expect.poll(() => bodies.length).toBe(1);
  await expect(subscribe).toBeEnabled();
  await subscribe.click();
  await expect.poll(() => bodies.length).toBe(2);

  await page.getByTestId('cycle-yearly').click();
  await expect(subscribe).toBeEnabled();
  await subscribe.click();
  await expect.poll(() => bodies.length).toBe(3);

  expect(bodies[0].idempotencyKey).toBeTruthy();
  expect(bodies[1].idempotencyKey).toBe(bodies[0].idempotencyKey);
  expect(bodies[2]).toMatchObject({ planTier: 'candidate_pro', billingCycle: 'yearly' });
  expect(bodies[2].idempotencyKey).not.toBe(bodies[0].idempotencyKey);
});

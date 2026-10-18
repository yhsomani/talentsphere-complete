import { test, expect } from '@playwright/test';

test('unverified privacy contacts are not represented as a staffed DPO or an SLA', async ({
  page,
}) => {
  await page.goto('/privacy');
  await expect(page.getByTestId('legal-draft-notice')).toBeVisible();
  await expect(page.getByTestId('privacy-contact-unconfigured')).toBeVisible();
  await expect(page.getByText('Response SLA: Within 48 business hours')).toHaveCount(0);
  await expect(page.locator('a[href="mailto:privacy@talentsphere.dev"]')).toHaveCount(0);
  await expect(page.locator('a[href="mailto:security@talentsphere.dev"]')).toHaveCount(0);
});

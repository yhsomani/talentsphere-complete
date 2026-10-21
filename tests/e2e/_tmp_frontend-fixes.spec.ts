/**
 * Browser checks for the front-end fixes from the October 2026 audit
 * (FE-04 retry duplicates, FE-05 reference outage vs dead link, FE-06
 * close-job confirmation, FE-07 input border contrast). Each of these was
 * only visible in a real page, so each is driven through the UI.
 */
import { test, expect, type Browser, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const run = `fe${Date.now().toString(36)}`;
const jobTitle = `Retry Engineer ${run}`;
let recruiter: Page;

async function signUpRecruiter(browser: Browser) {
  const page = await (await browser.newContext()).newPage();
  await page.goto('/signup?role=recruiter');
  await page.getByTestId('signup-name').fill('Fran Frontend');
  await page.getByTestId('signup-email').fill(`recruiter.${run}@example.com`);
  await page.getByTestId('signup-password').fill('correct horse battery');
  await page.getByTestId('signup-submit').click();
  await page.waitForURL('**/hiring');
  await page.getByTestId('org-name').fill(`Retry Co ${run}`);
  await page.getByTestId('org-submit').click();
  await expect(page.locator('h1')).toHaveText(`Hiring at Retry Co ${run}`);
  return page;
}

test('FE-07: text inputs have a border that meets 3:1 contrast', async ({ page }) => {
  await page.goto('/signup');
  const border = await page
    .getByTestId('signup-email')
    .evaluate((el) => getComputedStyle(el).borderTopColor);
  // WCAG 1.4.11: the field edge must reach 3:1 against the white/paper it sits on.
  // The old neutral[300] border was 1.5:1. Checked as a ratio, not a fixed colour,
  // so a palette change cannot silently drop below the rule.
  const [r, g, b] = (border.match(/\d+/g) ?? []).map(Number);
  const lum = [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (1 + 0.05) / (lum + 0.05);
  expect(ratio).toBeGreaterThanOrEqual(3);
});

test('FE-04: retrying after a failed publish does not create a second job', async ({ browser }) => {
  recruiter = await signUpRecruiter(browser);

  let creates = 0;
  recruiter.on('request', (req) => {
    if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/v1/jobs') creates += 1;
  });
  // The first publish fails; the draft has already been created.
  let failPublish = true;
  await recruiter.route('**/api/v1/jobs/*/status', async (route) => {
    if (failPublish && route.request().method() === 'PATCH') {
      failPublish = false;
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'Try again shortly.' } }),
      });
    }
    return route.continue();
  });

  await recruiter.getByTestId('post-job-btn').click();
  await recruiter.getByTestId('job-title').fill(jobTitle);
  await recruiter.getByTestId('job-location').fill('Porto');
  await recruiter
    .getByTestId('job-description')
    .fill('Keep our release pipeline green and our deploys boring.');
  await recruiter.getByTestId('job-submit').click();
  await expect(recruiter.getByTestId('job-form-error')).toContainText(
    'Saved as a draft, but publishing failed'
  );

  await recruiter.getByTestId('job-submit').click();
  const rows = recruiter.getByTestId('hiring-jobs').locator('li', { hasText: jobTitle });
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('Published');
  expect(creates).toBe(1);
});

test('FE-06: closing a job asks first, and Cancel leaves it open', async () => {
  const row = recruiter.getByTestId('hiring-jobs').locator('li', { hasText: jobTitle });
  const close = row.locator('[data-testid^="job-action-closed-"]');

  await close.click();
  await expect(recruiter.getByTestId('confirm-close-job')).toBeVisible();
  await recruiter.getByRole('button', { name: 'Cancel' }).click();
  await expect(recruiter.getByTestId('confirm-close-job')).toBeHidden();
  await expect(row).toContainText('Published');

  await close.click();
  await recruiter.getByTestId('confirm-close-job').click();
  await expect(recruiter.getByTestId('confirm-close-job')).toBeHidden();
  await expect(row).toContainText('Closed');
});

test('FE-11: the applicant filter is a group of toggle buttons, not fake tabs', async () => {
  const row = recruiter.getByTestId('hiring-jobs').locator('li', { hasText: jobTitle });
  await row.getByRole('link', { name: 'Review applicants' }).click();
  const filters = recruiter.getByRole('group', { name: 'Filter applicants' });
  await expect(filters).toBeVisible();
  await expect(recruiter.getByRole('tab')).toHaveCount(0);
  const closed = recruiter.getByTestId('pipeline-filter-closed');
  await expect(closed).toHaveAttribute('aria-pressed', 'false');
  await closed.click();
  await expect(closed).toHaveAttribute('aria-pressed', 'true');
});

test('sign-in sends one request however fast it is submitted', async ({ browser }) => {
  const page = await (await browser.newContext()).newPage();
  let logins = 0;
  page.on('request', (req) => {
    if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/v1/auth/login')
      logins += 1;
  });
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(`recruiter.${run}@example.com`);
  const password = page.locator('input[type="password"]');
  await password.fill('correct horse battery');
  // Two submits in the same tick, before React can re-render the disabled button.
  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await page.waitForURL('**/dashboard');
  expect(logins).toBe(1);
});

test('FE-05: an API outage is not reported as a dead reference link', async ({ page }) => {
  let outage = true;
  await page.route('**/api/v1/references/**', (route) =>
    outage
      ? route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
      : route.continue()
  );
  await page.goto(`/reference/ref_${run}#token=not-a-real-token`);
  await expect(page.getByTestId('reference-unavailable')).toBeVisible();
  await expect(page.getByTestId('reference-invalid')).toHaveCount(0);

  // Once the API is back, the same link is judged on its merits: this one is unknown.
  outage = false;
  await page.getByTestId('reference-retry').click();
  await expect(page.getByTestId('reference-invalid')).toBeVisible();
  await expect(page.getByTestId('reference-unavailable')).toHaveCount(0);
});

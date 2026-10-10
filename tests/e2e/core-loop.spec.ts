/**
 * The product's core loop, end to end, through the UI only (J-02 Apply →
 * Track → Hire, J-03 Post → Source → Hire, J-01 Learn → Prove → Showcase).
 *
 * Three people, three browser contexts, no API shortcuts except reading the
 * outbound email a real recipient would get (the dev/test outbox): a
 * recruiter posts a job, a candidate proves a role and applies, a referee
 * vouches from an emailed link, and the recruiter moves the candidate
 * forward — and each side sees the other's actions.
 */
import { test, expect, type Browser, type Page } from '@playwright/test';
import { outbox } from './fixtures.js';

test.describe.configure({ mode: 'serial' });

const run = Date.now().toString(36);
const company = `Northwind ${run}`;
const jobTitle = `Platform Engineer ${run}`;
const candidateName = 'Casey Candidate';

let recruiter: Page;
let candidate: Page;

async function signUp(browser: Browser, role: 'candidate' | 'recruiter', name: string) {
  const page = await (await browser.newContext()).newPage();
  await page.goto(role === 'recruiter' ? '/signup?role=recruiter' : '/signup');
  await page.getByTestId('signup-name').fill(name);
  await page.getByTestId('signup-email').fill(`${role}.${run}@example.com`);
  await page.getByTestId('signup-password').fill('correct horse battery');
  await page.getByTestId('signup-submit').click();
  await page.waitForURL(role === 'recruiter' ? '**/hiring' : '**/dashboard');
  return page;
}

test('a recruiter signs up, sets up a company and publishes a job', async ({ browser }) => {
  recruiter = await signUp(browser, 'recruiter', 'Rita Recruiter');
  await expect(recruiter.locator('h1')).toHaveText('Hiring');

  await recruiter.getByTestId('org-name').fill(company);
  await recruiter.getByTestId('org-submit').click();
  await expect(recruiter.locator('h1')).toHaveText(`Hiring at ${company}`);

  await recruiter.getByTestId('post-job-btn').click();
  await recruiter.getByTestId('job-title').fill(jobTitle);
  await recruiter.getByTestId('job-location').fill('Lisbon');
  await recruiter
    .getByTestId('job-description')
    .fill('Own our deployment platform end to end: Kubernetes, CI/CD, on-call.');
  await recruiter.fill('#job-salary-min', '90000');
  await recruiter.fill('#job-salary-max', '120000');
  await recruiter.getByTestId('job-submit').click();

  const row = recruiter.getByTestId('hiring-jobs').locator('li', { hasText: jobTitle });
  await expect(row).toContainText('Published');
  await expect(row).toContainText('No active applicants');
});

test('a candidate signs up and sees a dashboard about them, not a demo', async ({ browser }) => {
  candidate = await signUp(browser, 'candidate', candidateName);
  await expect(candidate.locator('h1')).toHaveText(candidateName);
  await expect(candidate.getByTestId('step-1')).toHaveAttribute('data-done', 'false');

  await candidate.getByRole('link', { name: 'Edit profile' }).click();
  await candidate.getByTestId('profile-headline').fill('Platform engineer, Kubernetes and CI/CD');
  await candidate.getByTestId('profile-location').fill('Lisbon, Portugal');
  await candidate.getByTestId('profile-save').click();
  await expect(candidate.getByTestId('profile-saved')).toBeVisible();

  await candidate.goto('/dashboard');
  await expect(candidate.getByTestId('step-1')).toHaveAttribute('data-done', 'true');
});

test('the candidate proves a role: work email code, then a reference', async ({ request }) => {
  await candidate.goto('/evidence');
  await candidate.getByTestId('add-work-history-btn').click();
  await candidate.getByTestId('input-company').fill('Contoso');
  await candidate.getByTestId('input-title').fill('Site Reliability Engineer');
  await candidate.getByTestId('input-start-date').fill('2021-03-01');
  await candidate.getByTestId('input-end-date').fill('2024-08-31');
  await candidate.getByTestId('input-corporate-email').fill(`casey.${run}@contoso.example`);
  await candidate.getByTestId('submit-employment-btn').click();

  // Saved but not verified until the code from the mailbox is entered.
  await expect(candidate.getByText('UNVERIFIED')).toBeVisible();
  const [code] = (await outbox(request, 'work_history.email_verification_requested')).filter(
    (m: { to: string }) => m.to === `casey.${run}@contoso.example`
  );
  await candidate.locator('[data-testid^="verify-code-input-"]').fill(code.code);
  await candidate.locator('[data-testid^="verify-code-submit-"]').click();
  await expect(candidate.getByText('BRONZE TIER')).toBeVisible();

  await candidate.locator('[data-testid^="request-ref-"]').click();
  await candidate.getByTestId('input-ref-name').fill('Morgan Manager');
  await candidate.getByTestId('input-ref-email').fill(`morgan.${run}@contoso.example`);
  await candidate.getByTestId('submit-reference-btn').click();
  await expect(candidate.getByTestId('ref-success')).toBeVisible();
  await expect(candidate.locator('[data-testid^="reference-"]')).toContainText(
    'Waiting for response'
  );
});

test('the referee vouches from the emailed link, which then stops working', async ({
  browser,
  request,
}) => {
  const [message] = (await outbox(request, 'reference.requested')).filter(
    (m: { to: string }) => m.to === `morgan.${run}@contoso.example`
  );
  const link = `/reference/${message.referenceId}#token=${message.token}`;

  const referee = await (await browser.newContext()).newPage();
  await referee.goto(link);
  await expect(referee.getByTestId('reference-form')).toBeVisible();
  await expect(referee.getByText(`${candidateName} listed you`)).toBeVisible();
  await referee.locator('input[name="confirm-title"]').first().check();
  await referee.locator('input[name="confirm-dates"]').first().check();
  for (const rating of ['technicalProficiency', 'collaborationRating', 'deliveryReliability']) {
    await referee.getByTestId(`rating-${rating}-5`).check();
  }
  await referee.getByTestId('reference-submit').click();
  await expect(referee.getByTestId('reference-done')).toBeVisible();

  // Single use: opening the same link again is refused.
  const again = await referee.context().newPage();
  await again.goto(link);
  await expect(again.getByTestId('reference-invalid')).toBeVisible();

  // The candidate's role is now gold: email 40 + manager 30 + strong ratings 10.
  await candidate.reload();
  await expect(candidate.getByText('GOLD TIER')).toBeVisible();
  await expect(candidate.locator('[data-testid^="reference-"]')).toContainText('Received');
});

test('the candidate finds the job and applies with a note', async () => {
  await candidate.goto('/jobs');
  await candidate.getByRole('link', { name: jobTitle, exact: true }).click();
  await expect(candidate.locator('h1')).toHaveText(jobTitle);
  await expect(candidate.getByText(company)).toBeVisible();
  await candidate.getByTestId('apply-cover-letter').fill('I ran SRE at Contoso for three years.');
  await candidate.locator('[data-testid^="apply-btn-"]').click();
  await expect(candidate.getByTestId('apply-done')).toBeVisible();

  await candidate.goto('/applications');
  const row = candidate.getByTestId('applications-active').locator('li', { hasText: jobTitle });
  await expect(row).toContainText('Submitted');
});

test('the recruiter sees how the applicant is verified and moves them forward', async () => {
  await recruiter.goto('/hiring');
  await recruiter
    .getByTestId('hiring-jobs')
    .locator('li', { hasText: jobTitle })
    .getByRole('link', { name: 'Review applicants' })
    .click();

  const applicant = recruiter.locator('[data-testid^="applicant-"]', { hasText: candidateName });
  await expect(applicant).toContainText('1 with a confirmed work email');
  await expect(applicant).toContainText('Best verified role: Gold');
  // The candidate's private work email is not shown to the recruiter.
  await expect(recruiter.getByText(`casey.${run}@contoso.example`)).toHaveCount(0);

  await applicant.getByRole('button', { name: 'Read application' }).click();
  await expect(applicant).toContainText('I ran SRE at Contoso for three years.');

  await applicant.getByRole('button', { name: 'Start review' }).click();
  await expect(applicant).toContainText('In review');
  await applicant.getByRole('button', { name: 'Shortlist' }).click();
  await expect(applicant).toContainText('Shortlisted');
});

test('the candidate sees the new status and can withdraw', async () => {
  await candidate.goto('/applications');
  const row = candidate.getByTestId('applications-active').locator('li', { hasText: jobTitle });
  await expect(row).toContainText('Shortlisted');

  await row.getByRole('button', { name: 'Withdraw' }).click();
  await candidate.getByTestId('confirm-withdraw').click();
  await expect(
    candidate.getByTestId('applications-closed').locator('li', { hasText: jobTitle })
  ).toContainText('Withdrawn');

  // ...and the recruiter's pipeline reflects it.
  await recruiter.reload();
  await recruiter.getByTestId('pipeline-filter-closed').click();
  await expect(
    recruiter.locator('[data-testid^="applicant-"]', { hasText: candidateName })
  ).toContainText('Withdrawn');
});

/**
 * Experience level on jobs, and the job-type and experience filters on the
 * jobs screen (plan TS-09, finding P-07). A fresher looking for an
 * internship can narrow the list to what fits them.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, registerAccount, useSession } from './fixtures.js';

const run = Math.random().toString(36).slice(2, 8);

test('a recruiter states the experience a job needs, and candidates filter by type and experience', async ({
  page,
  browser,
  request,
}) => {
  const recruiter = await registerAccount(request, 'filters-recruiter', 'recruiter');
  const auth = { authorization: `Bearer ${recruiter.token}` };
  const org = await request.post(`${API_BASE}/organizations`, {
    headers: auth,
    data: { name: `Filter Labs ${run}`, slug: `filter-labs-${run}` },
  });
  expect(org.status()).toBe(201);
  const orgId = (await org.json()).organization.id;
  const senior = await request.post(`${API_BASE}/jobs`, {
    headers: auth,
    data: {
      orgId,
      title: `Staff Data Engineer ${run}`,
      description: 'Lead the warehouse and mentor the data team.',
      location: 'Remote',
      workMode: 'remote',
      jobType: 'full_time',
      experienceLevel: 'senior',
    },
  });
  expect(senior.status()).toBe(201);
  await request.patch(`${API_BASE}/jobs/${(await senior.json()).job.id}/status`, {
    headers: auth,
    data: { status: 'published' },
  });

  // The recruiter posts the internship through the form, choosing "Fresher".
  const recruiterPage = await (await browser.newContext()).newPage();
  await useSession(recruiterPage, recruiter);
  await recruiterPage.goto('/hiring');
  await recruiterPage.getByTestId('post-job-btn').click();
  await recruiterPage.getByTestId('job-title').fill(`Data Intern ${run}`);
  await recruiterPage.getByTestId('job-location').fill('Remote');
  await recruiterPage.selectOption('#job-type', 'internship');
  await recruiterPage.getByTestId('job-experience').selectOption('fresher');
  await recruiterPage
    .getByTestId('job-description')
    .fill('Learn data engineering on real pipelines with a mentor.');
  await recruiterPage.getByTestId('job-submit').click();
  await expect(
    recruiterPage.getByTestId('hiring-jobs').locator('li', { hasText: `Data Intern ${run}` })
  ).toContainText('Published');

  const candidate = await registerAccount(request, 'filters-candidate');
  await useSession(page, candidate);
  await page.goto('/jobs');
  await page.getByTestId('jobs-search').fill(run);
  const list = page.getByTestId('jobs-list');
  await expect(list.locator('li')).toHaveCount(2);
  const internCard = list.locator('li', { hasText: `Data Intern ${run}` });
  await expect(internCard).toContainText('Internship');
  await expect(internCard).toContainText('Fresher');

  await page.getByTestId('jobs-type-filter').selectOption('internship');
  await expect(list.locator('li')).toHaveCount(1);
  await expect(internCard).toBeVisible();

  await page.getByTestId('jobs-type-filter').selectOption('');
  await page.getByTestId('jobs-experience-filter').selectOption('senior');
  await expect(list.locator('li')).toHaveCount(1);
  await expect(list.locator('li', { hasText: `Staff Data Engineer ${run}` })).toContainText(
    'Senior'
  );
});

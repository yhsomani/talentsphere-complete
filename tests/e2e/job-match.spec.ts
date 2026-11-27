/**
 * Explained job match (plan TS-13): a signed-in candidate opens a posting and
 * sees, for each required skill, whether they have shown it, how strongly,
 * and which record it rests on, with a way to add evidence for the rest.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, publishJob, registerAccount, useSession } from './fixtures.js';

const TYPESCRIPT = '10000000-0000-4000-a000-000000000001';
const SQL = '10000000-0000-4000-a000-000000000003';

test('shows which required skills the candidate has shown, and from what', async ({
  page,
  request,
}) => {
  const { jobId } = await publishJob(request, { requiredSkillIds: [TYPESCRIPT, SQL] });
  const candidate = await registerAccount(request, 'job-match');
  const evidence = await request.post(`${API_BASE}/evidence`, {
    headers: { authorization: `Bearer ${candidate.token}` },
    data: {
      type: 'project',
      title: 'Typed billing service',
      description: 'Built and shipped.',
      source: 'https://example.com/repo',
      provenance: 'github_repository',
      recencyDate: '2026-05-15',
      skillIds: [TYPESCRIPT],
    },
  });
  expect(evidence.status()).toBe(201);

  await useSession(page, candidate);
  await page.goto(`/jobs/${jobId}`);
  const match = page.getByTestId('job-match');
  await expect(match).toBeVisible();
  await expect(page.getByTestId('job-match-summary')).toHaveText('You’ve shown 1 of 2.');
  const rows = page.getByTestId('job-match-skill');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('(self-reported), from Typed billing service');
  await expect(rows.nth(1).getByTestId('job-match-missing')).toContainText('not shown yet');
  await rows.nth(1).getByRole('link', { name: 'Add evidence' }).click();
  await expect(page).toHaveURL(/\/evidence$/);
});

test('signed-out visitors see the plain skill list', async ({ page, request }) => {
  const { jobId } = await publishJob(request, { requiredSkillIds: [TYPESCRIPT, SQL] });
  await page.goto(`/jobs/${jobId}`);
  await expect(page.getByRole('heading', { name: 'Skills they’re looking for' })).toBeVisible();
  await expect(page.getByTestId('job-match')).toHaveCount(0);
});

/**
 * Career goal (plan TS-13, ADR-034): a candidate names a target role, sees
 * the skills open postings for it ask for, how their evidence meets each,
 * and one next step per skill; then clears the goal.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, publishJob, registerAccount, useSession } from './fixtures.js';

const TYPESCRIPT = '10000000-0000-4000-a000-000000000001';
const SQL = '10000000-0000-4000-a000-000000000003';

test('sets a goal, shows the gaps with next steps, and clears it', async ({ page, request }) => {
  const role = `Pipeline Wrangler ${Math.random().toString(36).slice(2, 6)}`;
  const { recruiter } = await publishJob(request, {
    title: role,
    requiredSkillIds: [SQL, TYPESCRIPT],
  });
  await publishJob(request, { title: `Senior ${role}`, recruiter, requiredSkillIds: [SQL] });
  const candidate = await registerAccount(request, 'career-goal');
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
  await page.goto('/profile');
  await page.getByTestId('goal-link').click();
  await expect(page).toHaveURL(/\/goal$/);
  await page.getByTestId('goal-title').fill(role);
  await page.getByTestId('goal-save').click();

  await expect(page.getByTestId('goal-summary')).toHaveText(
    'From 2 open postings. You’ve shown 1 of 2 skills.'
  );
  const skills = page.getByTestId('goal-skill');
  await expect(skills).toHaveCount(2);
  await expect(skills.nth(0)).toContainText('(asked for by 2 of 2)');
  await expect(skills.nth(0)).toContainText('Not shown yet.');
  await expect(skills.nth(0).getByTestId('goal-step')).toContainText('add evidence that shows it');
  await expect(skills.nth(1)).toContainText('Shown, self-reported, from Typed billing service.');
  await expect(skills.nth(1).getByTestId('goal-step')).toContainText('ask a colleague');

  await page.reload();
  await expect(page.getByTestId('goal-title')).toHaveValue(role);
  await expect(page.getByTestId('goal-skill')).toHaveCount(2);

  await page.getByTestId('goal-clear').click();
  await expect(page.getByTestId('goal-plan')).toHaveCount(0);
  await expect(page.getByTestId('goal-title')).toHaveValue('');
});

test('says so when no open posting matches the goal', async ({ page, request }) => {
  const candidate = await registerAccount(request, 'career-goal-empty');
  await useSession(page, candidate);
  await page.goto('/goal');
  await page.getByTestId('goal-title').fill('Underwater Basket Weaver Zq');
  await page.getByTestId('goal-save').click();
  await expect(page.getByTestId('goal-no-postings')).toContainText('No open postings match');
});

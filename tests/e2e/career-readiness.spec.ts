import { test, expect, type APIRequestContext } from '@playwright/test';
import { API_BASE, registerAccount, type TestAccount } from './fixtures.js';

// Career readiness (F-91): pick a target role and see a readiness score with what is missing.
// Skills and years of experience come from the candidate's own profile.
test.describe('E2E: Career readiness (F-91)', () => {
  const TYPESCRIPT = '10000000-0000-4000-a000-000000000001';

  async function signIn(page: import('@playwright/test').Page, account: TestAccount) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  async function giveSkillAndExperience(request: APIRequestContext, account: TestAccount) {
    const auth = { authorization: `Bearer ${account.token}` };
    const skill = await request.post(`${API_BASE}/skills/freshness`, {
      headers: auth,
      data: { skillId: TYPESCRIPT, verificationSource: 'self_attestation' },
    });
    expect(skill.status()).toBe(201);
    const start = new Date(Date.now() - 2 * 365 * 86_400_000).toISOString().slice(0, 10);
    const role = await request.post(`${API_BASE}/candidates/work-history`, {
      headers: auth,
      data: { companyName: 'Readiness Co', title: 'Engineer', startDate: start, isCurrent: true },
    });
    expect(role.status()).toBe(201);
  }

  test('a candidate with no skills is sent to add some first', async ({ page, request }) => {
    const account = await registerAccount(request, 'career.empty');
    await signIn(page, account);
    await page.goto('/career');
    await expect(page.getByTestId('career-no-skills')).toBeVisible();
    await expect(page.getByTestId('career-submit')).toHaveCount(0);
  });

  test('picks a role, must state education, and sees a score with the missing milestones', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'career.score');
    await giveSkillAndExperience(request, account);
    await signIn(page, account);
    await page.goto('/career');

    // The inputs come from the profile, and the page says so.
    await expect(page.getByTestId('career-basis')).toContainText('1 skill');
    await expect(page.getByTestId('career-basis')).toContainText('2 years');

    // Education must be chosen: the server would silently assume a bachelor's degree.
    let checks = 0;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/career/milestones/readiness')) checks++;
    });
    await page.getByTestId('career-submit').click();
    await expect(page.getByTestId('career-error')).toContainText('education');
    expect(checks).toBe(0);

    await page.getByLabel('Highest education').selectOption('bachelor');
    await page.getByTestId('career-submit').click();
    await expect(page.getByTestId('career-score')).toContainText('out of 100');

    // TypeScript is covered; the rest of the role's skills are missing.
    await expect(page.getByTestId('career-skills-line')).toContainText('1 of 5 covered');
    await expect(page.getByTestId('career-missing')).toContainText('System Architecture');
    await expect(page.getByTestId('career-missing')).not.toContainText('TypeScript');

    // The score is the weighted sum of the three parts shown (50 / 35 / 15), within rounding.
    const text = await page.getByTestId('career-breakdown').innerText();
    const part = (label: string) => Number(new RegExp(`${label}: (\\d+)%`).exec(text)![1]);
    const score = Number((await page.getByTestId('career-score').innerText()).match(/\d+/)![0]);
    const expected =
      part('Skills match') * 0.5 + part('Experience') * 0.35 + part('Education') * 0.15;
    expect(Math.abs(score - expected)).toBeLessThanOrEqual(1.5);

    // Milestones: missing skills first (high priority), then the experience gap.
    const milestones = page.getByTestId('career-milestones');
    await expect(milestones.locator('li').first()).toContainText('Attain proficiency in');
    await expect(milestones).toContainText('more months of domain experience');
  });

  test('a lower education level lowers the education part of the score', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'career.edu');
    await giveSkillAndExperience(request, account);
    await signIn(page, account);
    await page.goto('/career');

    await page.getByLabel('Highest education').selectOption('none');
    await page.getByTestId('career-submit').click();
    await expect(page.getByTestId('career-breakdown')).toContainText('Education: 33%');

    await page.getByLabel('Highest education').selectOption('master');
    await page.getByTestId('career-submit').click();
    await expect(page.getByTestId('career-breakdown')).toContainText('Education: 100%');
  });
});

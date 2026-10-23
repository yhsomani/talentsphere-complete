import { test, expect, type APIRequestContext } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { API_BASE, registerAccount, type TestAccount } from './fixtures.js';

// Skills graph on the profile (F-84): a candidate adds a skill and sees the skills that go
// with it, as defined in the taxonomy by a platform admin.
test.describe('E2E: Skills and related skills on the profile (F-84)', () => {
  const run = Math.random().toString(36).slice(2, 8);
  const admin = createSessionToken(
    `00000000-0000-4000-a000-${Date.now().toString().padStart(12, '0').slice(-12)}`,
    `admin.skills.${Date.now()}@talentsphere.internal`,
    ['platform_admin']
  );
  const adminAuth = { authorization: `Bearer ${admin}` };

  async function createSkill(request: APIRequestContext, name: string) {
    const res = await request.post(`${API_BASE}/skills`, {
      headers: adminAuth,
      data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), category: 'Audit' },
    });
    expect(res.status(), `create skill ${name}`).toBe(201);
    return (await res.json()).skill.id as string;
  }

  async function relate(
    request: APIRequestContext,
    sourceSkillId: string,
    targetSkillId: string,
    relationshipType: 'prerequisite_of' | 'correlates_with'
  ) {
    const res = await request.post(`${API_BASE}/skills/relationships`, {
      headers: adminAuth,
      data: { sourceSkillId, targetSkillId, relationshipType },
    });
    expect(res.status(), 'define relationship').toBe(201);
  }

  async function signIn(page: import('@playwright/test').Page, account: TestAccount) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  test('adding a skill shows it with its related skills, and it cannot be added twice', async ({
    page,
    request,
  }) => {
    const main = `Main Skill ${run}`;
    const partner = `Partner Skill ${run}`;
    const basics = `Basics Skill ${run}`;
    const mainId = await createSkill(request, main);
    const partnerId = await createSkill(request, partner);
    const basicsId = await createSkill(request, basics);

    const account = await registerAccount(request, 'skills.graph');
    await signIn(page, account);
    await page.goto('/profile');
    await expect(page.getByTestId('skills-empty')).toBeVisible();

    // No relationships defined yet: the skill is listed and the page says so.
    await page.getByLabel('Add a skill').selectOption({ label: main });
    await page.getByRole('button', { name: 'Add skill' }).click();
    const item = page.getByTestId('skill-item').filter({ hasText: main });
    await expect(item).toBeVisible();
    await expect(item.getByTestId('skill-no-related')).toContainText(
      'No related skills defined yet'
    );

    // Once the taxonomy relates other skills to it, the profile shows them.
    await relate(request, mainId, partnerId, 'correlates_with');
    await relate(request, basicsId, mainId, 'prerequisite_of');
    await page.reload();
    const related = page
      .getByTestId('skill-item')
      .filter({ hasText: main })
      .getByTestId('skill-related');
    await expect(related).toContainText(`Often used with: ${partner}`);
    await expect(related).toContainText(`Learn first: ${basics}`);

    // A skill that is already listed is no longer offered.
    await expect(page.getByLabel('Add a skill').locator('option', { hasText: main })).toHaveCount(
      0
    );
  });
});

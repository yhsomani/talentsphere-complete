/**
 * Removing a mistaken role from the Work history page. Before 2026-10-11 the
 * only way to get rid of one was to delete the whole account. The dialog says
 * what goes with the role before anything is removed, "Keep it" changes
 * nothing, and after removal focus lands on the confirmation (the card and the
 * button that opened the dialog no longer exist).
 */
import { test, expect } from '@playwright/test';
import { API_BASE, registerAccount, useSession } from './fixtures.js';

test.use({ viewport: { width: 390, height: 844 } });

test('removes a mistaken role after saying what goes with it, and keeps the rest', async ({
  page,
  request,
}) => {
  const account = await registerAccount(request, 'remove-role');
  const auth = { authorization: `Bearer ${account.token}` };
  const addRole = async (companyName: string, title: string) => {
    const res = await request.post(`${API_BASE}/candidates/work-history`, {
      headers: auth,
      data: { companyName, title, startDate: '2020-01-01', endDate: '2022-01-01' },
    });
    expect(res.status()).toBe(201);
    return (await res.json()).workHistory.id as string;
  };
  const mistaken = await addRole('Contoso', 'Data Analyst');
  const kept = await addRole('Fabrikam', 'Platform Engineer');
  const ref = await request.post(
    `${API_BASE}/candidates/work-history/${mistaken}/references/request`,
    {
      headers: auth,
      data: {
        refereeName: 'Priya Peer',
        refereeEmail: 'priya@contoso.example',
        relationship: 'peer',
      },
    }
  );
  expect(ref.status()).toBe(201);

  await useSession(page, account);
  await page.goto('/evidence');
  await expect(page.getByTestId(`work-history-${mistaken}`)).toBeVisible();

  const removeButton = page.getByRole('button', {
    name: 'Remove role — Data Analyst at Contoso',
  });
  await removeButton.click();
  const dialog = page.getByRole('dialog', { name: 'Remove this role?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    'Data Analyst at Contoso will be removed from your work history. This cannot be undone.'
  );
  await expect(dialog).toContainText(
    '1 reference request still waiting. The link we sent will stop working.'
  );
  await expect(dialog).toContainText('Recruiters will no longer see this role.');
  // The dialog fits a phone screen: nothing scrolls sideways.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);

  // "Keep it" changes nothing.
  await dialog.getByRole('button', { name: 'Keep it' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId(`work-history-${mistaken}`)).toBeVisible();

  await removeButton.click();
  await dialog.getByRole('button', { name: 'Remove role' }).click();
  const confirmation = page.getByTestId('work-history-removed');
  await expect(confirmation).toHaveText('Removed Data Analyst at Contoso from your work history.');
  await expect(page.getByTestId(`work-history-${mistaken}`)).toHaveCount(0);
  await expect(page.getByTestId(`work-history-${kept}`)).toBeVisible();
  // Focus is not dropped on the page body when the card disappears.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.activeElement?.contains(
            document.querySelector('[data-testid="work-history-removed"]')
          ) ?? false
      )
    )
    .toBe(true);

  // The server agrees: after a reload the role is still gone.
  await page.reload();
  await expect(page.getByTestId(`work-history-${kept}`)).toBeVisible();
  await expect(page.getByTestId(`work-history-${mistaken}`)).toHaveCount(0);
});

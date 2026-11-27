/**
 * Import v1 (plan TS-08, ADR-033): a person reads a JSON Resume file, reviews
 * the entries (a duplicate and an entry that needs a date are left unticked),
 * fixes the date, confirms, sees the roles on Work history marked as
 * imported and unverified, and then undoes the import.
 */
import { test, expect } from '@playwright/test';
import { registerAccount, useSession } from './fixtures.js';

test.use({ viewport: { width: 390, height: 844 } });

const resume = {
  basics: { name: 'Imported Person' },
  work: [
    { name: 'Northwind', position: 'Data Engineer', startDate: '2021-03' },
    { name: 'NORTHWIND', position: 'data engineer', startDate: '2021-03-15' },
    { name: 'Tailspin', position: 'Analyst' },
  ],
  skills: [{ name: 'TypeScript' }],
  references: [{ name: 'Someone Else', reference: 'Private words' }],
};

test('imports a JSON Resume after review, shows the source, and undoes it', async ({
  page,
  request,
}) => {
  const account = await registerAccount(request, 'profile-import');
  await useSession(page, account);
  await page.goto('/evidence');
  await page.getByTestId('import-link').click();
  await expect(page).toHaveURL(/\/import$/);

  await page.getByTestId('import-file').setInputFiles({
    name: 'resume.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(resume)),
  });
  await page.getByTestId('import-start').click();

  const review = page.getByTestId('import-review');
  await expect(review).toBeVisible();
  await expect(page.getByTestId('import-item')).toHaveCount(4);
  await expect(page.getByTestId('import-item-duplicate')).toHaveCount(1);
  await expect(page.getByTestId('import-item-problem')).toContainText('Start date is missing');
  await expect(page.getByTestId('import-ignored')).toContainText('references (1)');
  await expect(review).not.toContainText('Private words');
  await expect(page.getByTestId('import-confirm')).toHaveText('Add 2 selected');

  await page.getByLabel('Start month').fill('2019-06');
  await expect(page.getByTestId('import-confirm')).toHaveText('Add 3 selected');
  await page.getByTestId('import-confirm').click();
  await expect(page.getByTestId('import-done')).toContainText('Added 3 entries');

  await page.goto('/evidence');
  await expect(page.getByTestId('work-history-imported')).toHaveCount(2);
  await expect(page.getByTestId('work-history-imported').first()).toContainText(
    'Imported from a JSON Resume file, not yet verified'
  );

  await page.goto('/import');
  await page.getByTestId('import-undo').click();
  await expect(page.getByTestId('import-done')).toContainText('Removed 3 entries');
  await page.goto('/evidence');
  await expect(page.getByTestId('work-history-imported')).toHaveCount(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});

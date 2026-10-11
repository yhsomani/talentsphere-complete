/**
 * A hiring team and an applicant talk to each other (2026-10-11). Before,
 * messaging existed only in the API — no screen — and anyone could message
 * anyone. Now a recruiter messages an applicant from their card, the
 * candidate hears about it, replies from Messages, and the recruiter sees
 * the reply. Both sides drive the real UI.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, publishJob, registerAccount, useSession } from './fixtures.js';

test('a recruiter messages an applicant, the candidate replies, both see the conversation', async ({
  browser,
  request,
}) => {
  const { jobId, title, recruiter } = await publishJob(request);
  const candidate = await registerAccount(request, 'msg-candidate', 'candidate', 'Casey Candidate');
  const applied = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
    headers: { authorization: `Bearer ${candidate.token}` },
    data: {},
  });
  expect(applied.status()).toBe(201);
  const applicationId = (await applied.json()).application.id;

  // Recruiter: from the applicant's card.
  const rita = await (await browser.newContext()).newPage();
  await useSession(rita, recruiter);
  await rita.goto(`/hiring/jobs/${jobId}`);
  await rita.getByRole('button', { name: 'Message Casey Candidate' }).click();
  const dialog = rita.getByRole('dialog', { name: 'Message Casey Candidate' });
  await expect(dialog).toContainText(`About ${title}.`);
  await dialog.getByLabel('Message').fill('Thanks for applying — are you free on Thursday?');
  await dialog.getByRole('button', { name: 'Send' }).click();
  await rita.waitForURL('**/messages/**');
  await expect(rita.locator('h1')).toHaveText('Casey Candidate');
  await expect(rita.getByTestId('conversation-messages')).toContainText(
    'Thanks for applying — are you free on Thursday?'
  );
  const conversationUrl = rita.url();
  expect(applicationId).toBeTruthy();

  // Candidate, on a phone: the bell counts it, Messages lists it as new.
  const caseyContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const casey = await caseyContext.newPage();
  await useSession(casey, candidate);
  await casey.goto('/dashboard');
  await expect(casey.getByTestId('nav-notifications')).toHaveAccessibleName(
    'Notifications, 1 unread'
  );
  await casey.goto('/messages');
  const row = casey.getByTestId('messages-list').getByRole('link');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText('Rita Recruiter');
  await expect(row).toContainText(title);
  await expect(row).toContainText('1 new');
  await row.click();
  await expect(casey.locator('h1')).toHaveText('Rita Recruiter');
  await expect(casey.getByTestId('conversation-messages')).toContainText('free on Thursday?');
  // Reading it cleared the bell too.
  await expect(casey.getByTestId('nav-notifications')).toHaveAccessibleName('Notifications');
  const overflow = await casey.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);

  await casey.getByLabel('Your message').fill('Thursday works for me.');
  await casey.getByRole('button', { name: 'Send' }).click();
  await expect(casey.getByLabel('Your message')).toHaveValue('');
  const mine = casey.locator('[data-mine="true"]');
  await expect(mine).toHaveCount(1);
  await expect(mine).toContainText('You');
  await expect(mine).toContainText('Thursday works for me.');

  // Recruiter sees the reply (on return to the conversation).
  await rita.goto(conversationUrl);
  await expect(rita.getByTestId('conversation-messages')).toContainText('Thursday works for me.');
  await expect(rita.locator('[data-mine="false"]')).toContainText('Casey Candidate');
});

/**
 * Notifications in the browser: the header badge counts what is unread, the
 * page lists it newest first, and each item opens the thing it is about.
 */
import { test, expect } from '@playwright/test';
import { API_BASE, publishJob, registerAccount, useSession } from './fixtures.js';

test('a recruiter is told about a new applicant and lands on that job’s pipeline', async ({
  page,
  request,
}) => {
  const job = await publishJob(request, { title: `Data Engineer ${Date.now().toString(36)}` });
  const candidate = await registerAccount(request, 'notify-cand');
  const applied = await request.post(`${API_BASE}/jobs/${job.jobId}/apply`, {
    headers: { authorization: `Bearer ${candidate.token}` },
    data: {},
  });
  expect(applied.status()).toBe(201);

  await useSession(page, job.recruiter);
  await page.goto('/hiring');
  await expect(page.getByTestId('notifications-badge')).toBeVisible();
  await expect(page.getByTestId('notifications-badge')).toHaveText('1');
  await expect(page.getByTestId('nav-notifications')).toHaveAttribute(
    'aria-label',
    'Notifications, 1 unread'
  );

  await page.getByTestId('nav-notifications').click();
  await expect(page.locator('h1')).toHaveText('Notifications');
  const item = page.getByTestId('notifications-list').locator('li').first();
  await expect(item).toHaveAttribute('data-read', 'false');
  await expect(item).toContainText(`New application: ${job.title}`);
  // The candidate is not named: notifications outlive an erasure.
  await expect(item).not.toContainText(candidate.profile.fullName);

  await item.getByRole('link', { name: `New application: ${job.title}` }).click();
  await page.waitForURL(`**/hiring/jobs/${job.jobId}`);
  await expect(page.getByTestId('notifications-badge')).toHaveCount(0);
});

test('a candidate sees their application move and marks everything read', async ({
  page,
  request,
}) => {
  const job = await publishJob(request);
  const candidate = await registerAccount(request, 'notify-moved');
  const applied = await request.post(`${API_BASE}/jobs/${job.jobId}/apply`, {
    headers: { authorization: `Bearer ${candidate.token}` },
    data: {},
  });
  const applicationId = (await applied.json()).application.id;
  for (const targetState of ['in_review', 'shortlisted']) {
    const moved = await request.post(`${API_BASE}/applications/${applicationId}/transition`, {
      headers: { authorization: `Bearer ${job.recruiter.token}` },
      data: { applicationId, targetState },
    });
    expect(moved.status()).toBe(200);
  }

  await useSession(page, candidate);
  await page.goto('/dashboard');
  await expect(page.getByTestId('notifications-badge')).toHaveText('2');
  await page.getByTestId('nav-notifications').click();

  const items = page.getByTestId('notifications-list').locator('li');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText(`${job.title}: shortlisted`);
  await expect(items.first()).toContainText(`You were shortlisted for ${job.title}`);
  await expect(page.getByText('2 unread.')).toBeVisible();

  await page.getByTestId('notifications-mark-all').click();
  await expect(page.getByText('You are all caught up.')).toBeVisible();
  await expect(items.first()).toHaveAttribute('data-read', 'true');
  await expect(page.getByTestId('notifications-badge')).toHaveCount(0);

  // Read state is the server's, not the page's.
  await page.reload();
  await expect(page.getByText('You are all caught up.')).toBeVisible();
});

test('someone with no notifications sees what will appear there', async ({ page, request }) => {
  const account = await registerAccount(request, 'notify-empty');
  await useSession(page, account);
  await page.goto('/notifications');
  await expect(page.getByTestId('empty-state')).toContainText('Nothing yet');
  await expect(page.getByTestId('notifications-badge')).toHaveCount(0);
});

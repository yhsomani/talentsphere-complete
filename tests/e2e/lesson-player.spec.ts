import { test, expect } from '@playwright/test';
import { API_BASE, registerAccount, type TestAccount } from './fixtures.js';

// Lesson player (F-07): open a course, enroll, read lessons in order, mark them complete,
// see progress that survives a reload, and finish with a verifiable certificate.
test.describe('E2E: Lesson player (F-07)', () => {
  async function signIn(page: import('@playwright/test').Page, account: TestAccount) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  test('a learner works through a course to a certificate', async ({ page, request }) => {
    const catalog = await (await request.get(`${API_BASE}/courses`)).json();
    const courseId: string = catalog.courses[0].id;
    const detail = await (await request.get(`${API_BASE}/courses/${courseId}`)).json();
    const total: number = detail.course.modules.flatMap(
      (m: { lessons: unknown[] }) => m.lessons
    ).length;
    expect(total, 'the seeded course has several lessons across modules').toBeGreaterThanOrEqual(3);

    const account = await registerAccount(request, 'lesson.player');
    await signIn(page, account);

    // Open the course from the list.
    await page.goto('/learning');
    await page.getByTestId('learning-open').first().click();
    await expect(page).toHaveURL(new RegExp(`/learning/${courseId}$`));
    await expect(page.getByTestId('course-page')).toContainText(detail.course.title);

    // Before enrolling: a free-preview lesson is readable, the rest are gated.
    await expect(page.getByTestId('lesson-body')).toBeVisible();
    await page.getByTestId('lesson-item').nth(1).click();
    await expect(page.getByTestId('lesson-gated')).toBeVisible();

    await page.getByTestId('course-enroll').click();
    await expect(page.getByTestId('course-progress')).toHaveText(
      `0 of ${total} lessons complete (0%)`
    );

    // The last lesson sits in a later module, so it is locked and cannot be completed yet.
    await page.getByTestId('lesson-item').last().click();
    await expect(page.getByTestId('lesson-locked')).toContainText('Finish');
    await expect(page.getByTestId('lesson-complete')).toBeDisabled();

    // Complete the first lesson: progress moves and the page advances to the next lesson.
    await page.getByTestId('lesson-item').first().click();
    const firstTitle = await page.getByTestId('lesson-title').innerText();
    await page.getByTestId('lesson-complete').click();
    // A whole-number percentage: the server sends 33.33 for 1 of 3, and that is not shown raw.
    await expect(page.getByTestId('course-progress')).toHaveText(
      `1 of ${total} lessons complete (${Math.round(100 / total)}%)`
    );
    await expect(page.getByTestId('lesson-title')).not.toHaveText(firstTitle);

    // Progress is stored on the server, not in the page.
    await page.reload();
    await expect(page.getByTestId('course-progress')).toContainText(
      `1 of ${total} lessons complete`
    );
    await expect(page.getByTestId('lesson-item').first()).toContainText('Done');

    // Finish every remaining lesson in order.
    for (let done = 1; done < total; done++) {
      await page.getByTestId('lesson-complete').click();
      await expect(page.getByTestId('course-progress')).toContainText(
        `${done + 1} of ${total} lessons complete`
      );
    }
    await expect(page.getByTestId('course-progress')).toContainText('(100%)');
    await expect(page.getByTestId('course-complete')).toContainText('Certificate');

    // The certificate link opens the public verification page.
    await page.getByTestId('course-certificate-link').click();
    await expect(page).toHaveURL(/\/verify\/[0-9a-f]{64}$/);
    await expect(page.getByTestId('verify-status')).toContainText('Valid');
  });

  test('a course that does not exist is a final answer with no retry button', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'lesson.missing');
    await signIn(page, account);
    await page.goto('/learning/c0000000-0000-0000-0000-00000000ffff');
    await expect(page.getByTestId('course-notfound')).toBeVisible();
    await expect(page.getByTestId('load-error-retry')).toHaveCount(0);
  });

  test('completing a lesson out of order is refused by the server with a clear message', async ({
    request,
  }) => {
    const catalog = await (await request.get(`${API_BASE}/courses`)).json();
    const courseId: string = catalog.courses[0].id;
    const detail = await (await request.get(`${API_BASE}/courses/${courseId}`)).json();
    const lessons = detail.course.modules.flatMap((m: { lessons: { id: string }[] }) => m.lessons);
    const account = await registerAccount(request, 'lesson.order');
    const auth = { authorization: `Bearer ${account.token}` };
    await request.post(`${API_BASE}/courses/${courseId}/enroll`, { headers: auth });
    const res = await request.post(
      `${API_BASE}/lessons/${lessons[lessons.length - 1].id}/complete`,
      {
        headers: auth,
      }
    );
    expect(res.status()).toBe(422);
    expect((await res.json()).error.message).toMatch(/sequential|prerequisite|first/i);
  });
});

import { test, expect } from '@playwright/test';
import { API_BASE, registerAccount, type TestAccount } from './fixtures.js';
import { ensureChallenge } from './content.js';

// Challenges (F-08): a candidate starts a timed session on a real challenge and submits a
// solution. The platform does not run submitted code yet, so the page must say the solution
// is saved but not run or scored, and the stored evidence must be unverified.
test.describe('E2E: Challenges (F-08)', () => {
  async function signIn(page: import('@playwright/test').Page, account: TestAccount) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  test('lists real challenges and shows only the public examples in a session', async ({
    page,
    request,
  }) => {
    await ensureChallenge(request);
    const account = await registerAccount(request, 'challenge.list');
    await signIn(page, account);
    await page.goto('/assessments');

    const list = page.getByTestId('challenge-list');
    await expect(list).toContainText('Reverse Words in a String');
    await page.getByTestId('challenge-start').first().click();

    // The public example is shown; the hidden test case never reaches the browser.
    const examples = page.getByTestId('challenge-examples');
    await expect(examples).toContainText('blue is sky the');
    await expect(page.getByTestId('challenge-session')).not.toContainText('world hello');
  });

  test('submits a solution, says it was not run or scored, and stores it as unverified', async ({
    page,
    request,
  }) => {
    await ensureChallenge(request);
    const account = await registerAccount(request, 'challenge.submit');
    await signIn(page, account);
    await page.goto('/assessments');
    await page.getByTestId('challenge-start').first().click();

    // An empty solution is stopped before any request is sent.
    let submits = 0;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith('/submit')) submits++;
    });
    await page.getByTestId('challenge-submit').click();
    await expect(page.getByTestId('challenge-error')).toContainText('Write your solution');
    expect(submits).toBe(0);

    await page.getByTestId('challenge-code').fill('export const f = (s: string) => s.trim();');
    await page.getByTestId('challenge-submit').click();
    await expect(page.getByTestId('challenge-saved')).toContainText('was not run');
    await expect(page.getByTestId('challenge-saved')).toContainText('no score');
    await expect(page.getByText(/\bpassed\b|score: \d+/i)).toHaveCount(0);
    expect(submits).toBe(1);

    // What was stored: assessment evidence that is unverified and marked as not executed.
    const mine = await (
      await request.get(`${API_BASE}/evidence/mine`, {
        headers: { authorization: `Bearer ${account.token}` },
      })
    ).json();
    const stored = mine.evidence.find((e: { type: string }) => e.type === 'assessment');
    expect(stored, 'the submission is stored as evidence').toBeDefined();
    expect(stored.verificationLevel).toBe('unverified');
    expect(stored.metadata.executed).toBe(false);
  });

  test('AI assistance is refused while a session is open and allowed again after submitting', async ({
    request,
  }) => {
    await ensureChallenge(request);
    const account = await registerAccount(request, 'challenge.ai');
    const auth = { authorization: `Bearer ${account.token}` };
    const challenges = await (await request.get(`${API_BASE}/challenges`)).json();
    const challengeId: string = challenges.challenges[0].id;

    const started = await request.post(`${API_BASE}/challenges/${challengeId}/start-session`, {
      headers: auth,
    });
    expect(started.status()).toBe(201);
    const sessionId: string = (await started.json()).session.id;

    const during = await request.post(`${API_BASE}/ai/assistant/query`, {
      headers: auth,
      data: { prompt: 'Give me the solution.' },
    });
    expect(during.status()).toBe(403);

    const submitted = await request.post(`${API_BASE}/challenges/${challengeId}/submit`, {
      headers: auth,
      data: { sessionId, language: 'typescript', code: 'export const x = 1;' },
    });
    expect(submitted.status()).toBe(200);

    const after = await request.post(`${API_BASE}/ai/assistant/query`, {
      headers: auth,
      data: { prompt: 'Explain closures.' },
    });
    expect(after.status()).not.toBe(403);
  });
});

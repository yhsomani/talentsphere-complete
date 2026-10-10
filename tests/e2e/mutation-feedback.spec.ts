import { test, expect } from '@playwright/test';
import type { APIRequestContext, Page, Route } from '@playwright/test';
import { publishJob, type PublishedJob } from './fixtures.js';

const API_BASE = 'http://127.0.0.1:4000/api/v1';

/**
 * Mutation feedback & truthfulness verdicts (optimistic-UI audit 2026-10-08).
 *
 * Contract under test: USER ACTION → IMMEDIATE CORRECT FEEDBACK → SERVER
 * MUTATION → RECONCILIATION → SUCCESS / ROLLBACK / CONFLICT. None of the six
 * UI mutations may optimistically confirm (M-07), so every test here drives a
 * route-intercepted server and proves the UI never claims a state the server
 * has not confirmed: pending feedback must appear while the response is still
 * held by the test (causal, not timing-based), failures must roll back to a
 * truthful idle state with the server's message, 409 must reconcile to server
 * truth, retries must reuse the same idempotency key, and offline/401 must
 * degrade honestly. Validation failures are covered in web-ui.spec.ts and
 * server-side replay dedupe in tests/integration (work-history-graph,
 * application-drafts, billing).
 */

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const canonicalApplication = (jobId: string) => ({
  application: {
    id: `app-${jobId}-1`,
    jobId,
    candidateId: 'profile-e2e',
    status: 'submitted',
    attachedEvidenceIds: [],
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

const sampleEntry = {
  id: 'wh-e2e-1',
  companyName: 'Acme Replay Corp',
  title: 'Reliability Engineer',
  startDate: '2021-01-01',
  endDate: '2023-01-01',
  isCurrent: false,
  verificationStatus: 'unverified',
  verificationScore: 0,
  badgeTier: 'none',
};

async function mintSession(page: Page, request: APIRequestContext, label: string) {
  const registered = await request.post(`${API_BASE}/auth/register`, {
    data: {
      email: `mut.${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`,
      password: 'Password123!Secure',
      fullName: 'Mutation Probe',
      role: 'candidate',
    },
  });
  expect(registered.status()).toBe(201);
  const { token, user } = await registered.json();
  // Seed directly rather than via addInitScript: the 401 contract test needs
  // the cleared session to STAY cleared across the full-page redirect to
  // /login — an init script would re-plant the token on every navigation and
  // fake a session the server had already rejected.
  await page.goto('/');
  await page.evaluate(
    (session: { token: string; user: unknown }) => {
      localStorage.setItem('talentsphere_token', session.token);
      localStorage.setItem('talentsphere_user', JSON.stringify(session.user));
    },
    { token, user }
  );
}

/**
 * Apply happens on the job's own page (/jobs/:id) against a REAL published
 * job; the apply request itself is intercepted so each test controls the
 * server's answer and its timing.
 */
let job: PublishedJob;
let otherJob: PublishedJob;
test.beforeAll(async ({ request }) => {
  job = await publishJob(request, { title: 'Reliability Engineer' });
  otherJob = await publishJob(request, { title: 'Data Engineer' });
});

const applyBtn = (page: Page, id = job.jobId) => page.getByTestId(`apply-btn-${id}`);

test.describe('MUT: pending feedback precedes the server response', () => {
  test('apply shows pending state before any response exists, then reconciles on 201', async ({
    page,
    request,
  }, testInfo) => {
    await mintSession(page, request, 'apply-pending');
    let captured: Route | null = null;
    await page.route('**/jobs/*/apply', (route) => {
      captured = route;
    });

    await page.goto(`/jobs/${job.jobId}`);
    const btn = applyBtn(page);

    const startedAt = Date.now();
    await btn.click();

    // Causal proof, not a timing guess: the response is still held by this
    // test, so the UI cannot have seen it — yet the user already has feedback.
    await expect(btn).toHaveText('Sending application…');
    await expect(btn).toBeDisabled();
    await expect(page.getByTestId('apply-progress')).toHaveText('Sending your application…');
    const feedbackMs = Date.now() - startedAt;
    expect(captured, 'the mutation request must be in flight').not.toBeNull();
    await expect(page.getByTestId('apply-done')).toHaveCount(0); // not confirmed yet

    await captured!.fulfill(json(canonicalApplication(job.jobId), 201));
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId(`apply-status-${job.jobId}`)).toHaveText('Submitted');
    await expect(page.getByTestId('apply-error')).toHaveCount(0);

    await testInfo.annotations.push({
      type: 'feedback-latency-ms',
      description: String(feedbackMs),
    });
  });

  test('employment attestation shows pending state, blocks dismissal, and survives retry', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'evidence-pending');
    const bodies: string[] = [];
    let call = 0;
    let first: Route | null = null;
    await page.route('**/api/v1/candidates/work-history', (route) => {
      bodies.push(route.request().postData() ?? '');
      call += 1;
      if (call === 1) {
        first = route; // hold the first response
        return;
      }
      void route.fulfill(json({ workHistory: { ...sampleEntry, id: 'wh-created-1' } }, 201));
    });

    await page.goto('/evidence');
    await page.getByTestId('add-work-history-btn').click();
    await page.getByTestId('input-company').fill(sampleEntry.companyName);
    await page.getByTestId('input-title').fill(sampleEntry.title);
    await page.getByTestId('input-start-date').fill(sampleEntry.startDate);

    const submitBtn = page.getByTestId('submit-employment-btn');
    await submitBtn.click();

    // Pending feedback while the response is still held by the test.
    await expect(submitBtn).toHaveText('Saving…');
    await expect(submitBtn).toBeDisabled();

    // The form must not be dismissable mid-flight: its result would be lost.
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('add-employment-form')).toBeVisible();

    // Server rejects the first attempt — truthful error, form intact.
    await first!.fulfill(
      json({ error: { code: 'INTERNAL', message: 'Attestation pipeline unavailable.' } }, 500)
    );
    await expect(page.getByTestId('add-error')).toHaveText('Attestation pipeline unavailable.');
    await expect(page.getByTestId('add-employment-form')).toBeVisible();
    await expect(page.getByTestId('input-company')).toHaveValue(sampleEntry.companyName);

    // Retry with the same payload succeeds and closes the form.
    await submitBtn.click();
    await expect(page.getByTestId('add-employment-form')).not.toBeVisible();

    // Duplicate protection: both attempts carried the SAME clientRequestId,
    // so the server can deduplicate the replay.
    expect(bodies.length).toBe(2);
    const firstKey = JSON.parse(bodies[0]).clientRequestId;
    expect(firstKey).toBeTruthy();
    expect(JSON.parse(bodies[1]).clientRequestId).toBe(firstKey);
  });
});

test.describe('MUT: rollback, conflict reconciliation and failure matrix', () => {
  test('apply failure rolls back to idle with the server message, then retry succeeds', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-rollback');
    let failNext = true;
    await page.route('**/jobs/*/apply', (route) => {
      if (failNext) {
        failNext = false;
        void route.fulfill(
          json({ error: { code: 'INTERNAL', message: 'Upstream evaluation unavailable.' } }, 500)
        );
        return;
      }
      void route.fulfill(json(canonicalApplication(job.jobId), 201));
    });

    await page.goto(`/jobs/${job.jobId}`);
    await page.getByTestId('apply-cover-letter').fill('Keep this note across the retry.');
    const btn = applyBtn(page);
    await btn.click();

    await expect(page.getByTestId('apply-error')).toHaveText('Upstream evaluation unavailable.');
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText('Send application'); // never claimed applied
    await expect(page.getByTestId('apply-done')).toHaveCount(0);
    // The user's note survives the failure.
    await expect(page.getByTestId('apply-cover-letter')).toHaveValue(
      'Keep this note across the retry.'
    );

    await btn.click();
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId('apply-error')).toHaveCount(0);
  });

  test('apply conflict (409) reconciles to the server record instead of a dead Apply', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-conflict');
    await page.route('**/jobs/*/apply', (route) =>
      route.fulfill(
        json(
          {
            error: {
              code: 'CONFLICT',
              message: 'An active application for this job already exists (BR-15).',
            },
          },
          409
        )
      )
    );

    // Let the page finish its own (real) lookup first...
    await Promise.all([
      page.waitForResponse('**/api/v1/applications/my'),
      page.goto(`/jobs/${job.jobId}`),
    ]);
    await expect(applyBtn(page)).toBeVisible();
    // ...then, from here on, the server "already has" this application.
    await page.route('**/applications/my', (route) =>
      route.fulfill(
        json({
          applications: [{ ...canonicalApplication(job.jobId).application, status: 'in_review' }],
        })
      )
    );
    await applyBtn(page).click();

    // Server says the application exists — adopt that, with its real status.
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId(`apply-status-${job.jobId}`)).toHaveText('In review');
  });

  test('every rejected status (403, 404, 429) surfaces its message and stays idle', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-matrix');
    const cases = [
      { status: 403, message: 'This role is no longer accepting applications.' },
      { status: 404, message: `Job with ID ${job.jobId} not found.` },
      { status: 429, message: 'Too many requests. Please slow down.' },
    ];
    let next = 0;
    await page.route('**/jobs/*/apply', (route) => {
      const c = cases[Math.min(next, cases.length - 1)];
      next += 1;
      void route.fulfill(json({ error: { code: `E${c.status}`, message: c.message } }, c.status));
    });

    await page.goto(`/jobs/${job.jobId}`);
    const btn = applyBtn(page);
    const error = page.getByTestId('apply-error');

    for (const c of cases) {
      await btn.click();
      await expect(error).toHaveText(c.message);
      await expect(btn).toBeEnabled();
      await expect(btn).toHaveText('Send application');
      await expect(page.getByTestId('apply-done')).toHaveCount(0);
    }
  });

  test('rapid double activation sends exactly one request', async ({ page, request }) => {
    await mintSession(page, request, 'apply-double');
    let requests = 0;
    let captured: Route | null = null;
    await page.route('**/jobs/*/apply', (route) => {
      requests += 1;
      captured = route;
    });

    await page.goto(`/jobs/${job.jobId}`);
    const btn = applyBtn(page);
    await btn.click();
    // Second activation arrives while the first is in flight; the handler's
    // own re-entry guard (not just the disabled attribute) must swallow it.
    await page.getByTestId('apply-form').evaluate((form: HTMLFormElement) => form.requestSubmit());
    await page.waitForTimeout(250);
    expect(requests).toBe(1);

    await captured!.fulfill(json(canonicalApplication(job.jobId), 201));
    await expect(page.getByTestId('apply-done')).toBeVisible();
  });

  test('a response for one job never lands on another job the user moved to', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-ooo');
    let held: Route | null = null;
    await page.route(`**/jobs/${job.jobId}/apply`, (route) => {
      held = route;
    });

    await page.goto(`/jobs/${job.jobId}`);
    await applyBtn(page).click();
    await expect(applyBtn(page)).toHaveText('Sending application…');

    // Move to a different job (same page component, new route param) while
    // the first submission is still in flight, then let it complete.
    await page.evaluate((path) => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, `/jobs/${otherJob.jobId}`);
    await expect(page.locator('h1')).toHaveText(otherJob.title);
    await held!.fulfill(json(canonicalApplication(job.jobId), 201));

    await page.waitForTimeout(300);
    await expect(page.getByTestId('apply-done')).toHaveCount(0);
    await expect(applyBtn(page, otherJob.jobId)).toBeVisible();
  });
});

test.describe('MUT: reconciliation, idempotency keys and session truthfulness', () => {
  test('a verify-email rejection is still shown after the list refetch (regression)', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'verify-notice');
    await page.route('**/api/v1/candidates/work-history', (route) =>
      route.fulfill(json({ workHistory: { ...sampleEntry, id: 'wh-notice-created' } }, 201))
    );
    await page.route('**/api/v1/candidates/*/work-history', (route) =>
      route.fulfill(json({ workHistories: [sampleEntry] }))
    );
    await page.route('**/verify-email', (route) =>
      route.fulfill(
        json(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Disposable email addresses are not permitted.',
            },
          },
          422
        )
      )
    );

    await page.goto('/evidence');
    await page.getByTestId('add-work-history-btn').click();
    await page.getByTestId('input-company').fill(sampleEntry.companyName);
    await page.getByTestId('input-title').fill(sampleEntry.title);
    await page.getByTestId('input-start-date').fill(sampleEntry.startDate);
    await page.getByTestId('input-corporate-email').fill('hr@replay-corp.test');
    await page.getByTestId('submit-employment-btn').click();

    // The record was saved and the refetch ran — the rejection must survive it.
    await expect(page.getByTestId(`work-history-${sampleEntry.id}`)).toBeVisible();
    await expect(page.getByTestId('evidence-notice')).toContainText(
      'Saved, but we could not start email verification'
    );
    await expect(page.getByTestId('evidence-notice')).toContainText(
      'Disposable email addresses are not permitted'
    );
  });

  test('reference request shows pending feedback and confirms only from the server', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'reference-pending');
    await page.route('**/api/v1/candidates/*/work-history', (route) =>
      route.fulfill(json({ workHistories: [sampleEntry] }))
    );
    let captured: Route | null = null;
    await page.route('**/references/request', (route) => {
      captured = route;
    });

    await page.goto('/evidence');
    await page.getByTestId(`request-ref-${sampleEntry.id}`).click();
    await page.getByTestId('input-ref-name').fill('Alex Morgan');
    await page.getByTestId('input-ref-email').fill('alex.morgan@company.test');

    const submitBtn = page.getByTestId('submit-reference-btn');
    await submitBtn.click();

    await expect(submitBtn).toHaveText('Sending…');
    await expect(submitBtn).toBeDisabled();
    await expect(page.getByTestId('ref-success')).not.toBeVisible(); // not confirmed yet

    await captured!.fulfill(
      json({ reference: { id: 'ref-1', status: 'requested' }, message: 'Created.' }, 201)
    );
    await expect(page.getByTestId('ref-success')).toHaveText(
      /Request sent to alex\.morgan@company\.test \(status: Waiting for response\)/
    );
    await expect(submitBtn).toHaveText('Send request');
  });

  test('the pricing page asks for no card and never starts a purchase', async ({ page }) => {
    // Regression: the old checkout collected card number, expiry and CVC that
    // were never sent to any processor, then "activated" a paid plan.
    let purchaseRequests = 0;
    await page.route('**/billing/subscribe', (route) => {
      purchaseRequests += 1;
      void route.abort();
    });
    await page.goto('/checkout');
    await expect(page.locator('h1')).toHaveText('Pricing');
    await expect(page.locator('input')).toHaveCount(0);
    await expect(page.getByText(/card/i).filter({ hasText: /number|cvc|expir/i })).toHaveCount(0);
    for (const cta of await page.locator('[data-testid^="plan-"][data-testid$="-cta"]').all()) {
      await expect(cta).toHaveAttribute('href', /\/signup/);
    }
    expect(purchaseRequests).toBe(0);
  });

  test('offline submission fails truthfully and succeeds after reconnect', async ({
    page,
    context,
    request,
  }) => {
    await mintSession(page, request, 'apply-offline');
    await page.goto(`/jobs/${job.jobId}`);
    const btn = applyBtn(page);
    await expect(btn).toBeVisible(); // page and session loaded while online

    await context.setOffline(true);
    await btn.click();
    await expect(page.getByTestId('apply-error')).toHaveText(
      'Could not reach TalentSphere. Check your connection and try again.'
    );
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText('Send application');
    await expect(page.getByTestId('apply-done')).toHaveCount(0);

    await context.setOffline(false);
    await page.route('**/jobs/*/apply', (route) =>
      route.fulfill(json(canonicalApplication(job.jobId), 201))
    );
    await btn.click();
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId('apply-error')).toHaveCount(0);
  });

  test('a dead session (401) mid-mutation clears state and returns to sign-in with ?return=', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-401');
    await page.route('**/jobs/*/apply', (route) =>
      route.fulfill(json({ error: { code: 'UNAUTHENTICATED', message: 'Token expired.' } }, 401))
    );

    await page.goto(`/jobs/${job.jobId}`);
    await applyBtn(page).click();

    await page.waitForURL(/\/login\?return=/);
    expect(decodeURIComponent(page.url())).toContain(`/jobs/${job.jobId}`);
    expect(await page.evaluate(() => localStorage.getItem('talentsphere_token'))).toBeNull();
  });

  test('applied state is restored from the server after a reload (hydration)', async ({
    page,
    request,
  }) => {
    await mintSession(page, request, 'apply-hydrate');
    // A REAL application, made through the API — not an intercepted one.
    const token = await page.evaluate(() => localStorage.getItem('talentsphere_token'));
    const applied = await request.post(`${API_BASE}/jobs/${job.jobId}/apply`, {
      headers: { authorization: `Bearer ${token}` },
      data: {},
    });
    expect(applied.status()).toBe(201);

    await page.goto(`/jobs/${job.jobId}`);
    // No click happened — the server's record drove this state.
    await expect(page.getByTestId('apply-done')).toBeVisible();
    await expect(page.getByTestId(`apply-status-${job.jobId}`)).toHaveText('Submitted');
    await expect(page.getByTestId('apply-form')).toHaveCount(0);

    await page.goto('/jobs');
    await expect(page.getByTestId(`apply-status-${job.jobId}`)).toHaveText('Submitted');
  });
});

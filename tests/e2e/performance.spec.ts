/**
 * Performance baseline suite (docs/quality/TESTING.md §3 "Performance";
 * docs/quality/OPERATIONS.md §3 "Set SLOs after baseline measurement").
 *
 * IMPORTANT — what this suite is and is not:
 *   It MEASURES the current baseline for route startup, interaction latency
 *   and API latency, and prints it as a build artifact. It enforces only
 *   gross-regression guards, not SLOs: no numeric SLO has been defined for
 *   this service yet (OPERATIONS.md §3), so claiming "p95 within SLO" here
 *   would be an invented requirement. The measured numbers below are the
 *   evidence needed to set real SLOs.
 */
import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const API_BASE = 'http://127.0.0.1:4000/api/v1';
const BASELINE_DIR = 'test-results/performance';

const ROUTES = ['/', '/dashboard', '/login', '/jobs', '/evidence', '/assessments', '/checkout'];

/**
 * Guards, not SLOs. These are deliberately loose: they exist to catch a
 * catastrophic regression (a route that stops rendering, an API that stops
 * responding), not to police latency. Tighten only once SLOs are ratified.
 */
const ROUTE_RENDER_GUARD_MS = 5000;
const API_RESPONSE_GUARD_MS = 2000;
const INTERACTION_GUARD_MS = 3000;

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}

function summarise(samples: number[]) {
  return {
    count: samples.length,
    min: Math.round(Math.min(...samples)),
    p50: Math.round(percentile(samples, 50)),
    p95: Math.round(percentile(samples, 95)),
    max: Math.round(Math.max(...samples)),
  };
}

test.describe('PERF: Route startup baseline', () => {
  test('every route renders within the gross-regression guard and records a baseline', async ({
    page,
  }) => {
    const baseline: Record<string, ReturnType<typeof summarise>> = {};

    for (const route of ROUTES) {
      const samples: number[] = [];
      for (let i = 0; i < 5; i++) {
        const started = Date.now();
        await page.goto(route, { waitUntil: 'load' });
        await expect(page.locator('h1')).toBeVisible();
        samples.push(Date.now() - started);
      }

      const stats = summarise(samples);
      baseline[route] = stats;

      expect(
        stats.p95,
        `${route} p95 render ${stats.p95}ms exceeds the ${ROUTE_RENDER_GUARD_MS}ms guard`
      ).toBeLessThan(ROUTE_RENDER_GUARD_MS);
    }

    mkdirSync(BASELINE_DIR, { recursive: true });
    writeFileSync(
      `${BASELINE_DIR}/route-startup.json`,
      JSON.stringify(
        { measuredAt: new Date().toISOString(), guardMs: ROUTE_RENDER_GUARD_MS, baseline },
        null,
        2
      )
    );
  });
});

test.describe('PERF: API latency baseline', () => {
  test('records p50/p95 for a representative authenticated read path', async ({ request }) => {
    const email = `perf.${Date.now()}@example.com`;
    const registered = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email,
        password: 'StrongPassword123!',
        fullName: 'Perf Baseline',
        role: 'candidate',
      },
    });
    expect(registered.status()).toBe(201);
    const { token } = await registered.json();

    const samples: number[] = [];
    for (let i = 0; i < 40; i++) {
      const started = Date.now();
      const res = await request.get(`${API_BASE}/resumes`, {
        headers: { authorization: `Bearer ${token}` },
      });
      samples.push(Date.now() - started);
      expect(res.status()).toBe(200);
    }

    const stats = summarise(samples);

    mkdirSync(BASELINE_DIR, { recursive: true });
    writeFileSync(
      `${BASELINE_DIR}/api-latency.json`,
      JSON.stringify(
        {
          measuredAt: new Date().toISOString(),
          guardMs: API_RESPONSE_GUARD_MS,
          endpoint: 'GET /api/v1/resumes',
          baseline: stats,
        },
        null,
        2
      )
    );

    expect(
      stats.p95,
      `GET /resumes p95 ${stats.p95}ms exceeds the ${API_RESPONSE_GUARD_MS}ms guard`
    ).toBeLessThan(API_RESPONSE_GUARD_MS);
  });
});

test.describe('PERF: Interaction latency baseline', () => {
  test('client-side navigation responds within the gross-regression guard', async ({ page }) => {
    await page.goto('/');

    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      const started = Date.now();
      await page.getByTestId('nav-dashboard').click();
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('h1')).toBeVisible();
      samples.push(Date.now() - started);

      await page.getByTestId('nav-jobs').click();
      await expect(page).toHaveURL(/.*jobs/);
      await expect(page.locator('h1')).toBeVisible();
    }

    const stats = summarise(samples);

    mkdirSync(BASELINE_DIR, { recursive: true });
    writeFileSync(
      `${BASELINE_DIR}/interaction-latency.json`,
      JSON.stringify(
        { measuredAt: new Date().toISOString(), guardMs: INTERACTION_GUARD_MS, baseline: stats },
        null,
        2
      )
    );

    expect(
      stats.p95,
      `client navigation p95 ${stats.p95}ms exceeds the ${INTERACTION_GUARD_MS}ms guard`
    ).toBeLessThan(INTERACTION_GUARD_MS);
  });
});

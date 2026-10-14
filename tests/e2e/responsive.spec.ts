/**
 * Responsive layout, from a 320 px phone to a 2560 px display.
 *
 * Every page is loaded at each width with real data and measured in the
 * browser. A page fails if it scrolls sideways, if anything is cut off at the
 * viewport edge, if the header wraps to a second row, if a control is smaller
 * than 24 × 24 px (WCAG 2.5.8; text links inside a sentence are exempt), or if
 * text is smaller than 12 px. Each test lists every problem it found at once.
 */
import { test, expect, request as apiRequest, type Page } from '@playwright/test';
import {
  API_BASE,
  outbox,
  publishJob,
  registerAccount,
  useSession,
  type TestAccount,
} from './fixtures.js';

const VIEWPORTS: Array<[number, number]> = [
  [320, 568], // small phone
  [390, 844], // phone
  [844, 390], // phone, landscape
  [768, 1024], // tablet
  [1024, 768], // tablet landscape / small laptop
  [1440, 900], // desktop
  [2560, 1440], // large display
];
const HEADER_ONE_ROW_MAX = 72;

interface Seeded {
  jobId: string;
  threadId: string;
  refId: string;
  refToken: string;
  candidate: TestAccount;
  recruiter: TestAccount;
}

let seeded: Seeded;

test.beforeAll(async () => {
  const request = await apiRequest.newContext();
  const { jobId, recruiter } = await publishJob(request, { title: 'Senior Platform Engineer' });
  const candidate = await registerAccount(request, 'responsive', 'candidate', 'Casey Candidate');
  const cAuth = { authorization: `Bearer ${candidate.token}` };
  const rAuth = { authorization: `Bearer ${recruiter.token}` };
  await request.patch(`${API_BASE}/profile/me`, {
    headers: cAuth,
    data: {
      headline: 'Site reliability engineer — Kubernetes, Terraform, incident response',
      location: 'Bengaluru, India',
      bio: 'Eight years running production platforms for payments and logistics companies.',
    },
  });
  const applied = await request.post(`${API_BASE}/jobs/${jobId}/apply`, {
    headers: cAuth,
    data: {
      coverLetter: 'I have run Kubernetes platforms at scale for six years and led on-call.',
    },
  });
  expect(applied.status()).toBe(201);
  const wh = await request.post(`${API_BASE}/candidates/work-history`, {
    headers: cAuth,
    data: {
      companyName: 'Contoso Payments International',
      title: 'Senior Site Reliability Engineer',
      startDate: '2019-01-01',
      endDate: '2023-06-30',
    },
  });
  const whId = (await wh.json()).workHistory.id as string;
  await request.post(`${API_BASE}/candidates/work-history/${whId}/references/request`, {
    headers: cAuth,
    data: {
      refereeName: 'Morgan Manager',
      refereeEmail: `m.${whId.slice(0, 8)}@contoso.example`,
      relationship: 'manager',
    },
  });
  const refs = await outbox(request, 'reference.requested');
  const ref = refs[refs.length - 1];
  const thread = await request.post(`${API_BASE}/threads`, {
    headers: rAuth,
    data: {
      recipientId: candidate.profile.id,
      subject: 'Senior Platform Engineer',
      initialMessage:
        'Thanks for applying — are you free for a 45-minute call on Thursday afternoon?',
    },
  });
  expect(thread.status()).toBe(201);
  const threadId = (await thread.json()).thread.id as string;
  await request.post(`${API_BASE}/threads/${threadId}/messages`, {
    headers: cAuth,
    data: { content: 'Thursday works. Shall I prepare anything about the incident-response work?' },
  });
  seeded = { jobId, threadId, refId: ref.referenceId, refToken: ref.token, candidate, recruiter };
  await request.dispose();
});

/** Everything wrong with the current page at the current viewport. */
async function layoutProblems(page: Page, headerMax = HEADER_ONE_ROW_MAX): Promise<string[]> {
  return page.evaluate((headerMax) => {
    const problems: string[] = [];
    const vw = document.documentElement.clientWidth;
    const visible = (el: Element) => {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0)
        return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const inHorizontalScroller = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) return true;
      }
      return false;
    };
    const name = (el: Element) => {
      const id = el.getAttribute('data-testid');
      const text = ((el as HTMLElement).innerText || el.getAttribute('aria-label') || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 40);
      return `${el.tagName.toLowerCase()}${id ? `[${id}]` : ''} "${text}"`;
    };
    const els = [...document.querySelectorAll('body *')].filter(visible);

    const overflow = document.documentElement.scrollWidth - vw;
    if (overflow > 0) problems.push(`page scrolls sideways by ${overflow}px`);

    // Cut off: partly or wholly past the right edge, or partly past the left
    // (wholly off-screen to the left is how the skip link hides).
    const cut = els.filter((el) => {
      const r = el.getBoundingClientRect();
      return (r.right > vw + 1 || (r.left < -1 && r.right > 0)) && !inHorizontalScroller(el);
    });
    const cutSet = new Set(cut);
    for (const el of cut.filter((e) => ![...e.children].some((c) => cutSet.has(c))).slice(0, 5)) {
      const r = el.getBoundingClientRect();
      problems.push(`cut off: ${name(el)} spans ${Math.round(r.left)}..${Math.round(r.right)}`);
    }

    const header = document.querySelector('header');
    const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : 0;
    if (headerHeight > headerMax) problems.push(`header wraps: ${headerHeight}px tall`);

    // WCAG 2.5.8 target size (AA), with its exceptions: a link inside running
    // text; a radio or checkbox whose label is the real target; and spacing —
    // an undersized target passes if a 24 px circle centred on it touches no
    // other target and no other undersized target's circle.
    const inSentence = (el: Element) =>
      el.tagName === 'A' &&
      getComputedStyle(el).display === 'inline' &&
      [...(el.parentElement?.childNodes ?? [])].some(
        (n) => n !== el && n.nodeType === 3 && n.textContent!.trim().length > 0
      );
    const targetBox = (el: Element) => {
      const input = el as HTMLInputElement;
      if (el.tagName === 'INPUT' && (input.type === 'radio' || input.type === 'checkbox')) {
        const label = input.closest('label') ?? input.labels?.[0];
        if (label) return label.getBoundingClientRect();
      }
      return el.getBoundingClientRect();
    };
    const controls = els.filter((el) =>
      el.matches(
        'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])'
      )
    );
    const boxes = controls
      .filter((el) => !inSentence(el))
      .map((el) => ({ el, r: targetBox(el) }))
      .filter(({ r }) => r.right > 0); // not the off-screen skip link
    const undersized = boxes.filter(({ r }) => r.width < 24 || r.height < 24);
    const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const circleTouchesBox = (c: { x: number; y: number }, r: DOMRect) => {
      const dx = c.x - Math.max(r.left, Math.min(c.x, r.right));
      const dy = c.y - Math.max(r.top, Math.min(c.y, r.bottom));
      return dx * dx + dy * dy < 12 * 12;
    };
    for (const a of undersized) {
      const c = centre(a.r);
      const crowded =
        boxes.some(
          (b) =>
            b.el !== a.el &&
            !b.el.contains(a.el) &&
            !a.el.contains(b.el) &&
            circleTouchesBox(c, b.r)
        ) ||
        undersized.some((b) => {
          if (b.el === a.el) return false;
          const d = centre(b.r);
          return Math.hypot(c.x - d.x, c.y - d.y) < 24;
        });
      if (crowded) {
        problems.push(
          `small target: ${name(a.el)} ${Math.round(a.r.width)}x${Math.round(a.r.height)}`
        );
      }
    }

    for (const el of els) {
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (hasText && parseFloat(getComputedStyle(el).fontSize) < 12) {
        problems.push(`tiny text: ${name(el)} ${getComputedStyle(el).fontSize}`);
      }
    }
    return [...new Set(problems)];
  }, headerMax);
}

async function auditRoutes(page: Page, paths: string[]): Promise<string[]> {
  const problems: string[] = [];
  for (const path of paths) {
    for (const [width, height] of VIEWPORTS) {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toBeVisible();
      for (const p of await layoutProblems(page))
        problems.push(`${path} @${width}x${height}: ${p}`);
    }
  }
  return problems;
}

test.describe('RESPONSIVE: every page from 320 px to 2560 px', () => {
  test.describe.configure({ timeout: 240_000 });

  test('public pages', async ({ page }) => {
    const problems = await auditRoutes(page, [
      '/',
      '/jobs',
      `/jobs/${seeded.jobId}`,
      '/login',
      '/signup',
      '/checkout',
      '/privacy',
      '/terms',
      `/reference/${seeded.refId}#token=${seeded.refToken}`,
      '/no-such-page',
    ]);
    expect(problems).toEqual([]);
  });

  test('candidate pages', async ({ page }) => {
    await useSession(page, seeded.candidate);
    const problems = await auditRoutes(page, [
      '/dashboard',
      `/jobs/${seeded.jobId}`,
      '/applications',
      '/evidence',
      '/profile',
      '/notifications',
      '/messages',
      `/messages/${seeded.threadId}`,
      '/assessments',
    ]);
    expect(problems).toEqual([]);
  });

  test('hiring pages', async ({ page }) => {
    await useSession(page, seeded.recruiter);
    const problems = await auditRoutes(page, [
      '/dashboard',
      '/hiring',
      `/hiring/jobs/${seeded.jobId}`,
      `/messages/${seeded.threadId}`,
    ]);
    expect(problems).toEqual([]);
  });
});

test.describe('RESPONSIVE: menus and dialogs fit the screen', () => {
  test('the header is one row, and the menu that holds navigation fits at every width', async ({
    page,
  }) => {
    await useSession(page, seeded.recruiter);
    for (const [width, height] of VIEWPORTS) {
      await page.setViewportSize({ width, height });
      await page.goto(`/hiring/jobs/${seeded.jobId}`);
      await expect(page.locator('h1')).toBeVisible();
      const header = await page.locator('header').boundingBox();
      expect(header!.height, `header at ${width}`).toBeLessThanOrEqual(HEADER_ONE_ROW_MAX);

      if (width < 1024) {
        // Phones and tablets: navigation behind the menu button, as an overlay
        // that scrolls on its own when the screen is short.
        await expect(page.getByTestId('nav-hiring')).toBeHidden();
        await page.getByTestId('mobile-menu-toggle').click();
        const panel = page.locator('#mobile-navigation');
        await expect(panel).toBeVisible();
        const box = (await panel.boundingBox())!;
        expect(box.y + box.height, `menu bottom at ${width}x${height}`).toBeLessThanOrEqual(
          height + 1
        );
        const signOut = panel.getByRole('button', { name: 'Sign out' });
        await signOut.scrollIntoViewIfNeeded();
        await expect(signOut).toBeInViewport();
        expect(await layoutProblems(page)).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
        await expect(page.getByTestId('mobile-menu-toggle')).toBeFocused();
      } else {
        await expect(page.getByTestId('nav-hiring')).toBeVisible();
        await expect(page.getByTestId('mobile-menu-toggle')).toBeHidden();
        await page.getByTestId('account-menu-toggle').click();
        const menu = page.getByTestId('account-menu');
        await expect(menu).toBeInViewport({ ratio: 1 });
        expect(await layoutProblems(page)).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(menu).toHaveCount(0);
      }
    }
  });

  test('a dialog is a bottom sheet on phones and a centred panel from 640 px', async ({ page }) => {
    await useSession(page, seeded.recruiter);
    for (const [width, height] of [
      [320, 568],
      [844, 390],
      [1440, 900],
    ] as Array<[number, number]>) {
      await page.setViewportSize({ width, height });
      await page.goto(`/hiring/jobs/${seeded.jobId}`);
      await page.getByRole('button', { name: 'Message Casey Candidate' }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running')
      );
      const panel = (await dialog.locator('.modal-panel').boundingBox())!;
      expect(panel.y + panel.height, `dialog bottom at ${width}x${height}`).toBeLessThanOrEqual(
        height + 1
      );
      expect(panel.x).toBeGreaterThanOrEqual(0);
      expect(panel.x + panel.width).toBeLessThanOrEqual(width + 1);
      if (width < 640) {
        expect(Math.round(panel.width), 'full-width sheet').toBe(width);
        expect(Math.round(panel.y + panel.height), 'anchored to the bottom').toBe(height);
      } else {
        expect(panel.width).toBeLessThan(width);
      }
      expect(await layoutProblems(page)).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });
});

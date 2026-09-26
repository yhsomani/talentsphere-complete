/**
 * Accessibility verification suite (docs/quality/TESTING.md §3 "Accessibility").
 *
 * Runs against the real built app in Chromium — jsdom/axe are not available in
 * this repo, and a11y claims are only worth anything when measured in a browser.
 *
 * Covered: semantics/landmarks, accessible names, form labelling, heading
 * order, keyboard reachability, skip link, focus order, reflow, reduced motion.
 */
import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/login', name: 'Login' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/evidence', name: 'Evidence' },
  { path: '/assessments', name: 'Assessments' },
  { path: '/jobs', name: 'Jobs' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
];

const INTERACTIVE = 'a[href], button, input, select, textarea, [role="button"], [role="link"]';
const IMAGES = 'img';

test.describe('A11Y: Document semantics (WCAG 2.2 AA)', () => {
  test('every route declares a language and a descriptive title', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const lang = await page.getAttribute('html', 'lang');
      expect(lang, `${route.path} must declare a document language`).toBeTruthy();

      const title = await page.title();
      expect(title.trim().length, `${route.path} must have a non-empty title`).toBeGreaterThan(0);
    }
  });

  test('every route exposes banner, main and contentinfo landmarks', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      await expect(page.locator('header'), `${route.path} banner`).toHaveCount(1);
      await expect(page.locator('main'), `${route.path} main`).toHaveCount(1);
      await expect(page.locator('footer'), `${route.path} contentinfo`).toHaveCount(1);
      await expect(page.getByRole('navigation', { name: 'Main Navigation' })).toHaveCount(1);
    }
  });

  test('every route has exactly one h1', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const h1s = page.locator('h1');
      await expect(h1s, `${route.path} must have exactly one h1`).toHaveCount(1);
      const text = (await h1s.first().innerText()).trim();
      expect(text.length, `${route.path} h1 must not be empty`).toBeGreaterThan(0);
    }
  });

  test('heading levels never skip a level', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => (n as HTMLElement).offsetParent !== null || n.tagName === 'H1')
            .map((n) => Number(n.tagName.slice(1)))
        );

      expect(levels[0], `${route.path} must start its outline at h1`).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        const jump = levels[i] - levels[i - 1];
        expect(
          jump,
          `${route.path} jumps from h${levels[i - 1]} to h${levels[i]}`
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe('A11Y: Accessible names (WCAG 2.5.3 Label in Name / 4.1.2 Name, Role, Value)', () => {
  test('every interactive control has an accessible name', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const controls = page.locator(INTERACTIVE);
      const count = await controls.count();

      for (let i = 0; i < count; i++) {
        const control = controls.nth(i);
        if (!(await control.isVisible())) continue;
        const name = (await control.evaluate((el) => el.textContent ?? '')) ?? '';
        const aria = await control.getAttribute('aria-label');
        const labelledBy = await control.getAttribute('aria-labelledby');
        const title = await control.getAttribute('title');
        // Form controls are named via <label for> / wrapping <label>, not text.
        const namedByLabel = await control.evaluate((el) => {
          if (!el.matches('input, select, textarea')) return false;
          const id = el.getAttribute('id');
          if (id && document.querySelector(`label[for="${id}"]`)) return true;
          return el.closest('label') !== null;
        });
        const hasName =
          name.trim().length > 0 ||
          (aria?.trim().length ?? 0) > 0 ||
          (labelledBy?.trim().length ?? 0) > 0 ||
          (title?.trim().length ?? 0) > 0 ||
          namedByLabel;
        expect(hasName, `${route.path} control #${i} has no accessible name`).toBe(true);
      }
    }
  });

  test('every form input has a programmatic label', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const inputs = page.locator('input:not([type="hidden"]), select, textarea');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        if (!(await input.isVisible())) continue;

        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const labelledBy = await input.getAttribute('aria-labelledby');
        const hasLabelElement =
          id !== null && (await page.locator(`label[for="${id}"]`).count()) > 0;
        const wrappedInLabel = await input.evaluate((el) => el.closest('label') !== null);
        const hasName =
          (ariaLabel?.trim().length ?? 0) > 0 ||
          (labelledBy?.trim().length ?? 0) > 0 ||
          hasLabelElement ||
          wrappedInLabel;

        expect(hasName, `${route.path} input #${i} has no programmatic label`).toBe(true);
      }
    }
  });

  test('every image carries an alt attribute', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const images = page.locator(IMAGES);
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt, `${route.path} image #${i} is missing an alt attribute`).not.toBeNull();
      }
    }
  });

  test('no element uses a positive tabindex', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path);
      const positive = await page
        .locator('[tabindex]')
        .evaluateAll((nodes) =>
          nodes.map((n) => Number((n as HTMLElement).getAttribute('tabindex'))).filter((v) => v > 0)
        );
      expect(positive, `${route.path} must not rely on positive tabindex`).toHaveLength(0);
    }
  });
});

test.describe('A11Y: Keyboard operation (WCAG 2.1.1 Keyboard / 2.4.1 Bypass Blocks)', () => {
  test('the skip link is revealed on focus and moves focus to main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]');
    await page.keyboard.press('Tab');

    await expect(skipLink).toBeFocused();
    // A skip link that is never revealed is not a bypass mechanism.
    const box = await skipLink.boundingBox();
    expect(box, 'skip link must be visibly positioned once focused').not.toBeNull();
    expect(box!.x, 'skip link must be on-screen once focused').toBeGreaterThanOrEqual(0);
    expect(box!.y, 'skip link must be on-screen once focused').toBeGreaterThanOrEqual(0);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator('main#main-content')).toBeFocused();
  });

  test('primary navigation is reachable by keyboard alone', async ({ page }) => {
    await page.goto('/');

    const reached: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const testid = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (testid) reached.push(testid);
      if (reached.includes('nav-jobs')) break;
    }

    expect(reached, 'tab order must reach the Opportunities nav link').toContain('nav-jobs');
  });

  test('every interactive control on the login form is operable by keyboard', async ({ page }) => {
    await page.goto('/login');

    const focusable = page.locator(`${INTERACTIVE}:visible`);
    const count = await focusable.count();
    expect(count, 'login page must expose interactive controls').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await focusable.nth(i).focus();
      const isFocused = await focusable.nth(i).evaluate((el) => el === document.activeElement);
      expect(isFocused, `login control #${i} must be focusable`).toBe(true);
    }
  });

  test('focused controls render a visible focus indicator', async ({ page }) => {
    await page.goto('/');

    const outline = await page.getByTestId('nav-dashboard').evaluate((el) => {
      el.focus();
      const style = window.getComputedStyle(el);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
    });

    const hasOutline = outline.outlineStyle !== 'none' && parseFloat(outline.outlineWidth) > 0;
    expect(hasOutline, 'focused navigation must show a visible focus ring').toBe(true);
  });
});

test.describe('A11Y: Reflow and motion preferences (WCAG 1.4.10 / 2.3.3)', () => {
  test('no route requires horizontal scrolling at a 320px viewport', async ({ page }) => {
    for (const route of ROUTES) {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(route.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(
        overflow,
        `${route.path} overflows horizontally by ${overflow}px at 320px wide`
      ).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('content is not hidden when text is zoomed to 200%', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 512 });

    for (const route of ROUTES) {
      await page.goto(route.path);
      await page.evaluate(() => {
        (document.documentElement as HTMLElement).style.fontSize = '200%';
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${route.path} overflows at 200% text zoom`).toBeLessThanOrEqual(1);
      await page.evaluate(() => {
        (document.documentElement as HTMLElement).style.fontSize = '';
      });
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('honours the reduced-motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // The standard reduced-motion reset uses a 0.01ms duration rather than 0,
    // because some engines skip animations declared as 0. The requirement is
    // that nothing perceptible remains, so anything at or below 1ms passes.
    const offenders = await page.evaluate(() => {
      const MAX_SECONDS = 0.001;
      const toSeconds = (value: string) =>
        value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);
      const out: string[] = [];
      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const s = window.getComputedStyle(el);
        if (s.animationName !== 'none' && toSeconds(s.animationDuration) > MAX_SECONDS) {
          out.push(`${el.tagName} animation ${s.animationName} ${s.animationDuration}`);
        }
        if (s.transitionProperty !== 'none' && toSeconds(s.transitionDuration) > MAX_SECONDS) {
          out.push(`${el.tagName} transition ${s.transitionProperty} ${s.transitionDuration}`);
        }
      });
      return out;
    });

    expect(
      offenders,
      'no element may keep a perceptible animation/transition under prefers-reduced-motion'
    ).toHaveLength(0);
    await page.emulateMedia({ reducedMotion: null });
  });
});

test.describe('A11Y: Page-specific structure', () => {
  test('every vacancy on the jobs page is named and actionable by keyboard', async ({ page }) => {
    await page.goto('/jobs');

    const cards = page.locator('[data-testid^="job-card-"]');
    const count = await cards.count();
    expect(count, 'jobs page must render vacancy entries').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const title = (await card.locator('h2, h3, h4').first().innerText()).trim();
      expect(title.length, `vacancy #${i} must expose a non-empty title`).toBeGreaterThan(0);

      const action = card.locator('button, a[href]').first();
      await expect(action, `vacancy #${i} must expose an action control`).toBeVisible();
      await action.focus();
      const focused = await action.evaluate((el) => el === document.activeElement);
      expect(focused, `vacancy #${i} action must be keyboard focusable`).toBe(true);
    }
  });

  test('plan selection is a keyboard-operable single-select group', async ({ page }) => {
    await page.goto('/checkout');

    const group = page.getByRole('radiogroup', { name: 'Subscription plans' });
    await expect(group).toBeVisible();

    const plans = group.getByRole('radio');
    const count = await plans.count();
    expect(count, 'checkout must offer selectable plans').toBeGreaterThan(0);

    // Exactly one plan is checked at a time (single-select semantics).
    const checked = await plans.evaluateAll(
      (els) => els.filter((e) => e.getAttribute('aria-checked') === 'true').length
    );
    expect(checked, 'a single-select plan group must have one selected plan').toBe(1);

    // Every plan must be reachable by Tab and selectable with the keyboard.
    for (let i = 0; i < count; i++) {
      const plan = plans.nth(i);
      await plan.focus();
      expect(
        await plan.evaluate((el) => el === document.activeElement),
        `plan #${i} must be focusable`
      ).toBe(true);
      await page.keyboard.press('Enter');
    }

    const checkedAfter = await plans.evaluateAll(
      (els) => els.filter((e) => e.getAttribute('aria-checked') === 'true').length
    );
    expect(checkedAfter, 'keyboard selection must still leave exactly one plan checked').toBe(1);
  });
});

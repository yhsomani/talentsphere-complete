# ADR-016 — Measure UI quality in a real browser, and test it adversarially

- **Status:** Proposed (a test-strategy decision; no schema, auth or pricing change).
- **Date:** 2026-10-23
- **Deciders:** product owner, whoever maintains `apps/web`.

## Context

The web app (`apps/web`, React 19 + Vite) is verified by Vitest for logic and by Playwright for the UI. The Playwright suite (`tests/e2e`, 236 tests at the time of writing) already measures accessibility (`accessibility.spec.ts`) and layout from 320 px to 2560 px (`responsive.spec.ts`). Two angles were missing: input a hostile user would send, and a sweep that every page loads without script errors or server faults. A "Web Dev Employee" (an AI Employee kit, hired 2026-10-23 into `C:\Users\yashs\ai-employees\web-dev-employee`) will also propose UI changes, so the gates it must pass need to be written down.

## Decision

1. UI quality is measured in Chromium against the built app, with real API records, not in jsdom.
2. Three gates guard every UI change: accessibility (`accessibility.spec.ts`), responsive layout (`responsive.spec.ts`), and hostile use (`hostile-user.spec.ts`, `ui-sweep.spec.ts`).
3. Hostile use means: script payloads in stored and typed text, oversized and SQL-looking input, double submit, forged tokens and roles, a candidate reaching admin data, `return=` redirect targets, hostile URL paths, and hostile API bodies. The assertion is always the app misbehaving (script runs, crash, duplicate write, off-site navigation, 5xx), never a screenshot match.
4. The Web Dev Employee, or any agent, changes the UI on a branch and merges only with these gates green. Build files stay protected under `AGENTS.md`.

## Options considered

| Option                                        | Complexity | Cost         | Verdict                                               |
| --------------------------------------------- | ---------- | ------------ | ----------------------------------------------------- |
| A. Browser-measured Playwright gates (chosen) | Low        | None extra   | Reuses fixtures and CI; catches what users see        |
| B. jsdom component tests plus axe             | Medium     | New deps     | Needs protected `package.json` changes; misses layout |
| C. Hosted visual-regression service           | Medium     | Subscription | Catches pixels, not behaviour; sends screenshots out  |

## Consequences

- Easier: every UI change has the same bar, and a regression in input handling fails CI.
- Harder: the e2e suite grows (about 4.6 minutes for the full run) and runs on one worker.
- Revisit: a visual-regression layer if design drift becomes a problem; component-level tests if the e2e run becomes too slow.

## Findings at adoption

Both new specs passed on first run (20 tests): no script execution, no off-site redirect, no 5xx under hostile input, no cross-user data on screen. This records that the surface held, not that it is unbreakable.

## Action items

1. [x] Add `tests/e2e/hostile-user.spec.ts` and `tests/e2e/ui-sweep.spec.ts`.
2. [ ] Start the Web Dev Employee session in its folder and point it at TalentSphere.
3. [ ] Add a flow to the sweep whenever a new page is added to `apps/web/src/App.tsx`.

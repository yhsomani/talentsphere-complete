# TalentSphere — TESTING.md v6.0

## 1. Testing Philosophy

Tests prove intended behavior, not accidental current behavior.

## 2. Layers

```text
Unit
→ Component
→ Integration
→ API/Contract
→ E2E
→ Security
→ Accessibility
→ Performance
→ Failure/Recovery
→ Regression
```

## 3. Coverage Ownership

### Unit
Domain rules, pure transformations, scoring, matching explanations, state transitions.

### Component
UI states, forms, validation, accessibility behavior.

### Integration
Database, RLS, queues, provider adapters, transactional workflows.

### API
AuthZ, schema validation, pagination, errors, idempotency, rate limits.

### E2E
Critical user journeys.

### Security
Authorization fuzzing, RLS deny tests, tenant isolation, SSRF, upload, webhook replay, secrets.

### Accessibility
Keyboard, focus, semantics, screen reader, zoom, contrast, reduced motion.

### Performance
Route startup, interaction latency, API p95/p99, DB queries, queue age.

## 4. Implemented Layers

Only layers with executable coverage are listed. A layer named in §2 but absent
below has **no** dedicated suite yet and must not be reported as covered.

| Layer         | Command                     | Runner               | Status                            |
| ------------- | --------------------------- | -------------------- | --------------------------------- |
| Unit          | `pnpm test:unit`            | Vitest               | Executable                        |
| Integration   | `pnpm test:integration`     | Vitest + `app.inject`| Executable                        |
| API/Contract  | `pnpm test`                 | Vitest + `app.inject`| Executable                        |
| Security      | `pnpm test:security`        | Vitest + `app.inject`| Executable                        |
| E2E           | `pnpm test:e2e`             | Playwright (Chromium)| Executable                        |
| Accessibility | `pnpm test:a11y`            | Playwright (Chromium)| Executable (see limits below)     |
| Performance   | `pnpm test:performance`     | Playwright (Chromium)| Baseline + regression guards only |

Accessibility and performance run inside the full `pnpm test:e2e` gate, so
neither can be skipped by merging.

### Accessibility coverage

Real Chromium, no jsdom: semantics, landmarks, heading order, accessible names
(including `<label for>` association), image `alt`, positive `tabindex`, skip
link, keyboard reachability, visible focus, 320px reflow, 200% zoom, and
`prefers-reduced-motion`.

**Known limits — not covered:** automated contrast checking (`axe-core` is not a
dependency) and screen-reader verification (no assistive technology in CI).
Contrast and screen-reader conformance therefore remain unverified by
automation and need manual audit before an accessibility claim is made.

### Performance coverage

`tests/e2e/performance.spec.ts` measures route startup, client-side
interaction, and API latency, writing percentiles to
`test-results/performance/*.json` (uploaded as a CI artifact).

It asserts **gross-regression guards only** — a route that stops rendering, an
API that stops responding. It does not assert SLOs, because
`docs/quality/OPERATIONS.md` §3 defers SLOs until after baseline measurement.
Ratifying SLOs is what converts this layer into a real budget check.

**Known limits — not covered:** DB query counts and queue age, because the
service currently runs against in-process state with no database. Those become
measurable only once real persistence lands.

## 5. Critical E2E Suites

Candidate:
`signup → goal → skills → learning → assessment → evidence → job → apply`

Recruiter:
`org → job → search → review → message → interview → decision`

Institution:
`tenant → learner → learning → assessment → credential → verification`

## 6. Assessment Security Tests

Verify:
- session binding;
- timing;
- submission idempotency;
- answer protection;
- AI_PROHIBITED enforcement;
- AI escape-route closure;
- suspicious event capture;
- retry behavior;
- replay resistance.

## 7. AI Tests

- prompt injection;
- data boundary enforcement;
- provider fallback;
- free-user cost gate;
- provenance;
- malformed model output;
- policy denial;
- context minimization;
- hallucination/groundedness eval where applicable.

## 8. Data Integrity Tests

- unique constraints;
- FK constraints;
- state transition validity;
- audit records;
- evidence revocation impact;
- tenant isolation;
- migration verification.

## 9. Flaky Test Policy

A flaky test is a defect. Do not permanently quarantine critical tests without owner, reason and removal deadline.

## 10. CI Gates

No merge if required checks fail. High-risk domain changes require expanded test suites.

Enforced by `.github/workflows/ci.yml` on every push and pull request, in order:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` — Prettier
3. `pnpm typecheck` — `tsc -b`
4. `pnpm test` — unit, integration, API and security
5. `pnpm build` — all packages and apps
6. `pnpm test:e2e` — E2E, accessibility and performance

`noUnusedLocals` and `noUnusedParameters` are enabled in every project
tsconfig, so step 3 fails the build on dead imports, dead locals and unused
parameters. Deleting dead code is a compiler-enforced rule, not a review
convention. Intentionally-unused parameters take a leading underscore, and
parameters that are part of a published or cross-package signature are
prefixed rather than removed.

Playwright runs with `retries: 0` and `forbidOnly` in CI: a flaky test is a
defect (§9), not something to absorb with a retry. Traces upload on failure;
the performance baseline uploads on every run for later comparison.

## 11. Production Verification

Post-deploy smoke tests verify:
- authentication;
- authorization;
- critical API;
- database connectivity;
- queue health;
- storage;
- observability;
- critical user journey.

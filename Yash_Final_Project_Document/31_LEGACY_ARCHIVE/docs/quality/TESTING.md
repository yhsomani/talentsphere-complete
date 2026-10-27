# TalentSphere — TESTING.md v6.0

## Historical measured baseline (2026-10-21)

At source `a771a87b`, the audit executed 1,172 passing Vitest assertions across
115 files and five passing migration-helper tests. Ten project TypeScript checks
passed with emission and incremental output disabled. Lint failed on seven files.
These tests reused existing built workspace dependencies; they do not establish a
fresh source build, PostgreSQL behavior, browser acceptance or deployment readiness.
See the [audit](../reports/FEATURE_STATUS_2026-10-21.md) and
[evidence ledger](../reports/AUDIT_EVIDENCE_2026-10-21.json) for commands and scope.

The assessment suite currently accepts simulated scoring, and the injection scan
can pass when its external grep command is unavailable. Passing assertions must
therefore be checked against the intended requirement. The audit's worker probe
also reproduced duplicate execution outside the ordinary passing suite.

Agent checks must respect the repository build-file restriction: do not run emitting
builds, install dependencies or write tool caches. Database and browser verification
remain outstanding; documentation edits do not require Reticle.

## Documentation checks and read-only alternatives

For the 2026-10-23 documentation pass, current checks and limitations are recorded
in [the coverage inventory](../system-model/01-inventory-and-coverage.md).
The historical counts above and the [system-model test record](../system-model/05-audit.md)
were not rerun as application acceptance.

The root `typecheck` runs `tsc -b`, which emits protected files. A per-project
read-only substitute, when existing declarations are available, is:

```sh
node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --incremental false --composite false --declaration false --declarationMap false
```

This does not replace the full reference build. For an authorized source check,
the existing Vitest can avoid config bundling and cache writes:

```sh
node node_modules/vitest/vitest.mjs run --configLoader native --no-cache
```

Inspect selected tests' own side effects before running them. This still imports
existing built workspace dependencies and cannot certify a fresh build. Default
Playwright startup uses compiled outputs; installing Chromium, rebuilding outputs
or starting Vite can write protected paths. The documentation pass therefore uses
static path/anchor/schema/migration checks and the pure migration-ledger helper
suite, without installing or building anything.

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
| Durability    | `pnpm test:pg`              | Vitest + real PostgreSQL | Executable when `TEST_DATABASE_URL` is set (`vitest.pg.config.ts`) |

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

**Known limits — not covered:** DB query counts and queue age are not measured
by this layer. The core career loop now persists to PostgreSQL (ADR-015, see
`docs/quality/OPERATIONS.md` §9); a measurement of those costs is still missing.

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
3. `pnpm typecheck` — `tsc -b`, then `tsc -p tests` (the suites themselves; Vitest and Playwright strip types without checking them)
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

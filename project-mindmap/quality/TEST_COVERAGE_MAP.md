# Test Coverage Map (Branch 18)

> **A test file referencing a route or function is not evidence that the feature works.** Matching is textual: a test is linked to an endpoint when its source contains the endpoint path (with `:param` as a wildcard) near a matching HTTP-method marker; it is linked to a rule when it names the function. None of these tests were executed in this session (no `node_modules`; installing would write protected files), so no confidence is `HIGH`. The documented audit (docs/reports/FEATURE_STATUS_2026-10-21.md) records 1,172 passing unit/integration tests on its own date; this map neither confirms nor refutes that.

## 1. Test inventory

| Category          | Files | Test cases (it/test) |
| ----------------- | ----- | -------------------- |
| scripts/tests     | 1     | 5                    |
| tests/e2e         | 61    | 327                  |
| tests/integration | 59    | 518                  |
| tests/pg          | 15    | 66                   |
| tests/security    | 6     | 115                  |
| tests/unit        | 81    | 852                  |

Total: 223 files, 1883 cases. Skipped/fixme markers: 1 (tests/e2e/hostile-user.spec.ts×1).

CI (`.github/workflows/ci.yml`): steps — Set up pnpm; Set up Node; Install dependencies; Install Playwright Chromium; Lint (Prettier); Typecheck; Unit, integration and security tests; Verify migration history guard; Detect unsafe hosted Supabase migration dependencies; Migrations on a clean database; Verify schema and migration ledger after upgrade; Persistence tests (real PostgreSQL); Build and scan browser bundle for server-only values; End-to-end, accessibility and performance.

## 2. Endpoint coverage (path-level)

- Endpoints referenced by at least one test file: **279/282**.
- **Endpoints with no test reference found (3)**: `GET /api/v1/organizations/mine`, `POST /api/v1/billing/portal [disabled-mode]`, `POST /api/v1/billing/portal`.

| API module    | Endpoints | With a test reference | Web-called | Test-file links |
| ------------- | --------- | --------------------- | ---------- | --------------- |
| activity      | 5         | 5                     | 0          | 10              |
| admin         | 8         | 8                     | 5          | 29              |
| ai            | 6         | 6                     | 1          | 14              |
| alumni        | 11        | 11                    | 0          | 30              |
| analytics     | 3         | 3                     | 0          | 11              |
| applications  | 7         | 7                     | 2          | 32              |
| auth          | 6         | 6                     | 6          | 144             |
| billing       | 12        | 10                    | 4          | 33              |
| candidates    | 8         | 8                     | 6          | 50              |
| career        | 6         | 6                     | 3          | 18              |
| certificates  | 4         | 4                     | 1          | 13              |
| challenges    | 5         | 5                     | 3          | 14              |
| connections   | 6         | 6                     | 3          | 31              |
| courses       | 7         | 7                     | 4          | 28              |
| evidence      | 8         | 8                     | 2          | 40              |
| feature-flags | 1         | 1                     | 0          | 4               |
| feedback      | 1         | 1                     | 0          | 2               |
| gamification  | 5         | 5                     | 0          | 9               |
| health        | 2         | 2                     | 0          | 12              |
| internal      | 1         | 1                     | 0          | 21              |
| interviews    | 13        | 13                    | 0          | 32              |
| job-templates | 6         | 6                     | 0          | 11              |
| jobs          | 22        | 22                    | 6          | 164             |
| learning      | 4         | 4                     | 0          | 10              |
| lessons       | 1         | 1                     | 1          | 6               |
| moderation    | 10        | 10                    | 0          | 35              |
| modules       | 1         | 1                     | 0          | 1               |
| networking    | 8         | 8                     | 0          | 14              |
| notifications | 5         | 5                     | 3          | 25              |
| organizations | 7         | 6                     | 3          | 54              |
| portfolio     | 6         | 6                     | 2          | 12              |
| profile       | 3         | 3                     | 1          | 31              |
| ready         | 1         | 1                     | 0          | 2               |
| recruiter     | 13        | 13                    | 0          | 27              |
| references    | 1         | 1                     | 1          | 8               |
| referrals     | 6         | 6                     | 0          | 16              |
| reputation    | 15        | 15                    | 0          | 34              |
| resumes       | 7         | 7                     | 2          | 19              |
| salaries      | 5         | 5                     | 0          | 13              |
| search        | 5         | 5                     | 1          | 13              |
| settings      | 8         | 8                     | 4          | 43              |
| skills        | 16        | 16                    | 4          | 53              |
| threads       | 5         | 5                     | 4          | 21              |
| verify        | 1         | 1                     | 1          | 5               |
| xp            | 1         | 1                     | 0          | 1               |

## 3. Business-rule coverage (symbol-level)

Domain functions with **no test file naming them** (9/279): this is a name search; a function exercised only through an endpoint test is listed here too.

`verifySessionToken`, `withoutSecrets`, `leaseExpiredError`, `activeJobPostingLimit`, `canSeeEvidenceInternals`, `canTransitionJob`, `updateProfileEntity`, `assertCorporateEmailEligible`, `referenceLinkExpired`

## 4. Screens without an e2e `goto`

/messages/:id, /\*

## 5. Journeys per spec

| Spec                 | Journeys |
| -------------------- | -------- |
| accessibility        | 7        |
| account-deletion     | 3        |
| account-security     | 3        |
| career-readiness     | 4        |
| challenges           | 3        |
| checkout-idempotency | 1        |
| core-loop            | 7        |
| credentials          | 6        |
| frontend-fixes       | 6        |
| hostile-user         | 5        |
| learning-page        | 2        |
| lesson-player        | 3        |
| messaging            | 1        |
| mutation-feedback    | 14       |
| navigation           | 9        |
| network-page         | 4        |
| notifications        | 3        |
| performance          | 2        |
| portfolio-resumes    | 3        |
| privacy-contact      | 1        |
| responsive           | 2        |
| restricted-account   | 1        |
| session-resilience   | 1        |
| settings-page        | 6        |
| skills-graph         | 2        |
| ui-sweep             | 1        |
| web-ui               | 8        |
| work-history-removal | 1        |

## 6. What is not measured

No coverage percentages, mutation scores, runtime results, accessibility results (an `accessibility.spec.ts` exists), or performance results are asserted. Features with weak evidence are in [implementation gaps](IMPLEMENTATION_GAPS.md).

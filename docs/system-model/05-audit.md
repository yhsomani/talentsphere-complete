# System model 05 — Audit, traceability sample and limits

## Commands run and their results (2026-10-23)

| Command | Result |
| ------- | ------ |
| `pnpm test` (unit, integration, security) | 120 files, 1266 tests, all pass |
| `pnpm lint` | passes |
| `tsc -p apps/api --noEmit`, `tsc -p tests --noEmit` | no errors |
| `pnpm build` (approved by the owner for refreshing generated output) | all packages and apps build |
| `pnpm test:e2e` (Playwright, Chromium, one worker) | 256 passed in 5.0 minutes |
| Not run | `pnpm test:pg` (needs `TEST_DATABASE_URL`; no throwaway database was available), any test against live Stripe or the hosted Supabase project, any deployment |

An earlier e2e run found 17 failures in 8 specs that depended on the removed sample course and challenge. They were fixed by creating the content through the API (`tests/e2e/content.ts`) and the run above is the re-run.

## Audits A to I

| Audit | Result | Limit |
| ----- | ------ | ----- |
| A Code to flowchart | Five investigators read the code behind F2 to F7 and cited `path:line`. An independent reviewer re-checked 14 claims: 11 confirmed, 3 corrected in the documents (CF-21, CF-29, the CF-20 citation), 4 omissions added (full Resend requirements, the second simulated evaluator, order of the job-transition checks). | Each diagram was checked by one investigator plus, for some branches, the lead and the reviewer. No diagram was checked against a running system. |
| B Requirements to flowchart | Not done as a full pass. `SSOT.md` and the PRD were only grepped for the topics in the conflict register (job approval, registration roles, token handling). | Most requirement IDs (F-xx, BR-xx) were not traced. |
| C Documentation to code | 21 open discrepancies recorded in `03-conflict-register.md` (CF-10 to CF-30). `ARCHITECTURE.md` and `SECURITY.md` were compared for auth, storage, billing and work history only. | Other documents in `docs/` were not compared. |
| D Decision-branch completeness | The diagrams show every branch the investigators reported. Failure of evaluation (unknown, missing input) is shown only where the code defines it. | Branches in code nobody read are absent. |
| E Cross-module consistency | Found: any organization membership authorizes job and applicant actions (CF-14); two different checks for "who is a recruiter" (CF-16); role strings outside the `Role` union (CF-20). | Permission checks across the other roughly 230 routes were not compared. |
| F Conflict closure | Seven resolved and verified (CF-01 to CF-07). The rest are open and each states what is needed. Seven carry a note that no decision was made because the choice belongs to an owner. | None of the open items is accepted as a risk by anyone. |
| G Regression and test coverage | New or changed tests: career benchmark, forecasts, learning impact, LMS, certificates, challenges, Stripe refunds and erasure, settings validation, hostile-input e2e. Everything above ran green. | There is no automated test that the diagrams match the code. |
| H Adversarial review | Run by an independent agent (see Audit A). Its corrections are applied. | It checked 14 claims, not all. It did not read `04-conditions.md` or the F7 page claims. |
| I Final evidence check | Each completion claim in these documents names a command or a `path:line`. | See limits below. |

## Traceability sample (requirement to code to test)

Complete traceability was not built. The rows below are the ones this work verified.

| Requirement or rule | Code | Test | Flow | Status |
| ------------------- | ---- | ---- | ---- | ------ |
| BR-15 one active application per job and candidate | `applications.ts:56`; migration 00043 | `tests/integration/jobs-applications.test.ts` | F3 A5 | Test passes |
| BR-160 benchmarks need at least 20 people | `career-trajectory.ts` | `tests/unit/career-trajectory-domain.test.ts`, integration and e2e career specs | CB-01 | Verified |
| BR-189 learning impact needs a cohort of 30 | `learning-impact.ts` | `tests/integration/learning-impact.test.ts`, e2e spec | LI-02 | Verified |
| Webhook signature over the raw body, replay safe | `stripe-gateway.ts`, migration 00052 | `tests/integration/stripe-billing.test.ts` | F5 H1, H12 | Test passes (fake gateway) |
| Production email delivery gate | `server.ts:12286,12418` | `tests/integration/email-delivery-gate.test.ts` | F4 V2 | Test passes |
| One-time referee link (no expiry) | `server.ts:12544` | none for expiry | F4 G2 | Gap: CF-10 |

## Behaviour with no documented requirement found

The investigators did not search for undocumented behaviour systematically. The ones noticed: the job-alert evaluation on publish (only in memory), the `/challenges` list being public, and the unlinked routes in CF-28. None was classified further.

## Limitations

- Not every route, page and migration was read. `apps/api/src/server.ts` has 278 unique routes. `02-flows.md` models auth, jobs and applications, work history, billing and boot with diagrams; `06-route-authorization.md` records the authorization and persistence of about 170 more routes from four further investigators, without diagrams. Per-route request validation schemas, several domain helpers and the storage SQL for those groups were not read.
- GitHub issue threads were read through the public API only; private discussion and approved stakeholder decisions were not accessible.
- No production or staging behaviour was observed. The Supabase project was inspected read-only (one keepalive migration, no application tables).
- The "council" was five investigators and one reviewer, each an AI agent working from the code. They did not debate each other, and no human approved a decision.
- Line numbers drift; two had already drifted during this work.

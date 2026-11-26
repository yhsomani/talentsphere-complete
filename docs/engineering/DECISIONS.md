# Architecture decision records

> **Status.** As-built decisions (ADR-015, ADR-016) and the decisions the owner delegated on 2026-11-26 (ADR-017 to ADR-029). ADR-015 is ratified by ADR-017.
>
> **What this file holds.** Decisions about built behaviour. `ARCHITECTURE.md` holds the decision register; this file keeps the full ADR text.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

| Section | Former file |
|---|---|
| ADR-015 — Persist the core career loop; keep the API's Maps as a read model | `docs/engineering/adr/ADR-015-core-loop-persistence.md` |
| ADR-016 — Measure UI quality in a real browser, and test it adversarially | `docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md` |

## ADR-015 — Persist the core career loop; keep the API's Maps as a read model

_Former file: `docs/engineering/adr/ADR-015-core-loop-persistence.md`._

- **Status:** Accepted. **Ratified 2026-11-26** by [ADR-017](#adr-017--ratify-adr-015-fastify-and-postgresql-are-the-architecture-of-record-issue-46) under the owner's delegated authority. The populated-database rehearsal under "Escalation" is still a step to run before `00043` touches real data.
- **Date:** 2026-10-10
- **Supersedes:** ADR-003 in `ARCHITECTURE.md` §26 ("in-memory Maps as runtime persistence") for the entities listed below.
- **Numbering:** `SSOT.md` uses ADR-001…013 for intended architecture and `ARCHITECTURE.md` §26 uses ADR-001…011 for the implemented one. ADR-014 is unassigned.

### Context

Until this change every user, organization, job, application, evidence item and work-history record lived in in-process `Map`s inside `buildApp()` and was lost on restart (production audit P0-04). The product's promise — a career record that employers can trust — cannot be kept by a store that forgets. A Postgres schema existed (migrations 00001–00042) and `pg` was already a dependency (durable background jobs, `dbcc2456`), but nothing wrote entity rows.

`apps/api/src/server.ts` has ~270 routes and ~150 Maps. Rewriting every read path to SQL in one step would touch nearly every route and could not be verified in one increment.

### Decision

1. **Write path.** Core-loop entities change only through `persist(...ops: CoreOp[])` (`apps/api/src/server.ts`). In `STORAGE=pg` the ops commit to Postgres in **one transaction** (`PgCoreStore.commit`, `apps/api/src/storage/core-store.ts`); only after `COMMIT` does `applyToReadModel` update the Maps. A failed commit throws before the read model is touched, so the API never acknowledges or serves state it could not save.
2. **Read path.** Reads keep using the Maps, now a read model hydrated from Postgres at boot (before the server accepts traffic).
3. **Scope.** Users, profiles, organizations, memberships, skills, jobs (+ `job_skills`), applications (+ `application_evidence`), evidence (+ `evidence_skills`), verified work history, references and corporate-email challenges; since migration `00044`, notifications and notification preferences, written in the same transaction as the event that causes them; since `00046`, signed-out sessions (`revoked_sessions`); since 2026-10-11, messaging (`message_threads`, `thread_participants`, `messages` from `00006`), each message's notification in its transaction. The routes they serve are listed in `apps/api/src/durability.ts` (`DURABLE_ROUTES`).
4. **Honesty about the rest.** Every other route keeps its state in memory and says so: responses carry `x-talentsphere-durability: ephemeral`, and admin health diagnostics report the split. `tests/security/core-authz.test.ts` checks that every registered route exists and `tests/pg/concurrency.test.ts` checks the header against a real database.
5. **Concurrency (added after adversarial review).** Because a commit is an `await`, two requests can both pass a check before either writes. Update ops carry `base` — the read-model value they were derived from. `persist()` refuses (409 `CONFLICT`, `reason: concurrent_modification`) when another write to the same record is in flight or the record is no longer `base`; Postgres re-checks the decisive columns inside the transaction (`WHERE status = …`, `WHERE attempts = … AND code_hash = …`), so the guarantee also holds against a second writer.
6. **Schema alignment.** Migration `00043_core_persistence_alignment.sql` reconciles schema and domain: missing job/application/evidence columns and CHECKs; BR-15 as a partial unique index (one *active* application per job and candidate, re-applying after withdrawal allowed) instead of a plain `UNIQUE(job_id, candidate_id)`; work-history and reference FKs re-pointed from `profiles(id)` to `users(id)` (the API and the 00041 RLS policies use user ids); reference tokens stored as SHA-256 only (`token_hash`, plaintext column dropped after backfill); a `work_history_email_challenges` table (service-role only); case-insensitive unique emails.

### Consequences

- **Single writer.** The read model makes the API a single writer: run exactly one API process per database. Two replicas would serve diverging state (the database guards in point 5 stop lost updates on the guarded records, not stale reads). A session-level PostgreSQL advisory lock now refuses a second API writer at startup; losing the lock makes the API unhealthy. This still does not permit horizontal scale-out — see `docs/quality/OPERATIONS.md`.
- **Out-of-band changes need a restart.** A row changed directly in SQL (e.g. bootstrapping the first admin) is seen after the API restarts and re-hydrates.
- **Boot time and memory grow with the data.** Hydration reads every core row. Acceptable at pre-launch volume; not at scale.
- **Long-tail modules are still ephemeral** (~220 routes: learning, gamification, interviews, saved searches, connections, billing records, …). They are labelled, not hidden.

### Exit path

Move reads for a module to SQL (repository functions in `apps/api`), delete its Maps, and the single-writer constraint disappears for that module. When no core read uses a Map, the API can run more than one replica. Do this before a second replica is needed, or before core data outgrows comfortable boot-time hydration.

### Verification

- `tests/pg/core-persistence.test.ts` — the whole loop writes real rows; a brand-new process serves identical state after restart; concurrent duplicate sign-ups resolve 201/409/409 with one row; BR-15 re-apply; erasure removes rows and stays erased after restart. Disabling `commit` fails every test (mutation-checked).
- `tests/pg/concurrency.test.ts` — 40 concurrent wrong email codes are all counted (was: recorded as 1, after which the correct code was accepted); a concurrent hire and withdrawal acknowledge exactly one, matching the database. Disabling the guards fails both tests; disabling only the in-process guard (simulating a second writer) still passes — the database guard holds on its own.
- CI runs both files against a `postgres:16` service container (`.github/workflows/ci.yml`), plus a migration-idempotency step.

### Escalation

Schema-changing and constraint-changing (dropping `UNIQUE(job_id, candidate_id)`, dropping `employment_references.token` after hashing it). At adoption no production database was reported; that is not a current deployment claim. The owner should ratify before `00043` is applied to any populated database. `uq_users_email_lower` will fail to build if a database already holds two emails that differ only by case; check first.

## ADR-016 — Measure UI quality in a real browser, and test it adversarially

_Former file: `docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md`._

- **Status:** Proposed (a test-strategy decision; no schema, auth or pricing change).
- **Date:** 2026-10-23
- **Deciders:** product owner, whoever maintains `apps/web`.

### Context

The web app (`apps/web`, React 19 + Vite) is verified by Vitest for logic and by Playwright for the UI. The Playwright suite (`tests/e2e`, 236 tests at the time of writing) already measures accessibility (`accessibility.spec.ts`) and layout from 320 px to 2560 px (`responsive.spec.ts`). Two angles were missing: input a hostile user would send, and a sweep that every page loads without script errors or server faults. A "Web Dev Employee" (an AI Employee kit, hired 2026-10-23 into `C:\Users\yashs\ai-employees\web-dev-employee`) will also propose UI changes, so the gates it must pass need to be written down.

### Decision

1. UI quality is measured in Chromium against the built app, with real API records, not in jsdom.
2. Three gates guard every UI change: accessibility (`accessibility.spec.ts`), responsive layout (`responsive.spec.ts`), and hostile use (`hostile-user.spec.ts`, `ui-sweep.spec.ts`).
3. Hostile use means: script payloads in stored and typed text, oversized and SQL-looking input, double submit, forged tokens and roles, a candidate reaching admin data, `return=` redirect targets, hostile URL paths, and hostile API bodies. The assertion is always the app misbehaving (script runs, crash, duplicate write, off-site navigation, 5xx), never a screenshot match.
4. The Web Dev Employee, or any agent, changes the UI on a branch and merges only with these gates green. Build files stay protected under `AGENTS.md`.

### Options considered

| Option                                        | Complexity | Cost         | Verdict                                               |
| --------------------------------------------- | ---------- | ------------ | ----------------------------------------------------- |
| A. Browser-measured Playwright gates (chosen) | Low        | None extra   | Reuses fixtures and CI; catches what users see        |
| B. jsdom component tests plus axe             | Medium     | New deps     | Needs protected `package.json` changes; misses layout |
| C. Hosted visual-regression service           | Medium     | Subscription | Catches pixels, not behaviour; sends screenshots out  |

### Consequences

- Easier: every UI change has the same bar, and a regression in input handling fails CI.
- Harder: the e2e suite grows (about 4.6 minutes for the full run) and runs on one worker.
- Revisit: a visual-regression layer if design drift becomes a problem; component-level tests if the e2e run becomes too slow.

### Findings at adoption

Both new specs passed on first run (20 tests): no script execution, no off-site redirect, no 5xx under hostile input, no cross-user data on screen. This records that the surface held, not that it is unbreakable.

### Action items

1. [x] Add `tests/e2e/hostile-user.spec.ts` and `tests/e2e/ui-sweep.spec.ts`.
2. [ ] Start the Web Dev Employee session in its folder and point it at TalentSphere.
3. [ ] Add a flow to the sweep whenever a new page is added to `apps/web/src/App.tsx`.

## Owner-delegated decisions (2026-11-26)

On 2026-11-26 the owner delegated every open decision in this repository to Claude, with one condition: weigh pros and cons first, then pick what is best for the product. The coordinator added a second condition: where a decision has legal, privacy or money impact, choose the conservative option. Each record below gives the options, the choice and the reason. Each decision is reversible by a later ADR that supersedes it. Production deploys, payment go-live, destructive migrations, account sign-ups, DNS changes and legal sign-off are not done by Claude; each record lists them under "Steps only the owner can run".

| ADR | Decision | Issue or conflict | Implementation |
| --- | --- | --- | --- |
| ADR-017 | Ratify ADR-015; Fastify and PostgreSQL are the architecture of record | #46 | Documentation (this change) |
| ADR-018 | Transactional email: Brevo, through the existing provider-independent service | #44 | Code exists; account and DNS steps for the owner |
| ADR-019 | Browser sessions in an httpOnly cookie with CSRF defence; password reset by email | #49, plan TS-10 | Two PRs to follow |
| ADR-020 | Files: S3-compatible object storage behind an adapter; ClamAV scanning; uploads refused where no scanner is configured | Plan TS-06 | One PR to follow |
| ADR-021 | Code execution: self-hosted Judge0 CE on an isolated host; scoring stays refused until it runs; ratify the referee-endorsed skill rule from PR #43 | #49 | Adapter PR after the host exists |
| ADR-022 | Split `server.ts` into per-module Fastify plugins, one module per PR, no behaviour change | Plan TS-12 | Later, after P0 |
| ADR-023 | Course completion stays unverified evidence; its certificate is a completion record, not a skill verification | Plan P-02 | One small PR to follow |
| ADR-024 | Erasure: 14-day cancel window, erasure completed within 30 days of the request; legal text stays a labelled draft until counsel reviews it | #45 | One PR to follow; counsel and inbox steps for the owner |
| ADR-025 | Staging on the existing Oracle assets; one API replica; nightly backups with a monthly restore drill | #47 | Owner runs the deploy steps |
| ADR-026 | Beta durability scope: only modules with a screen are made durable; the rest stay parked or labelled | #48 | Continues as plan TS-03 |
| ADR-027 | Launch free-only; Stripe stays wired and disabled | #50 | Already the default (`BILLING_MODE=disabled`) |
| ADR-028 | `min_cohort_k` = 10 distinct people for every published aggregate | C-8 | Salary built; review aggregates before un-parking |
| ADR-029 | AI output quality follows the SSOT wording (capability-specific evaluation, no universal threshold) | C-22 | Registry corrected (this change) |

### ADR-017 — Ratify ADR-015: Fastify and PostgreSQL are the architecture of record (issue #46)

- **Status:** Accepted 2026-11-26 (delegated).
- **Context:** ADR-015 has run since 2026-10-10 and is the only architecture that exists as code. The other descriptions in the repository (Next.js and Supabase, Spring) are not the running app.

| Option | Pros | Cons |
| --- | --- | --- |
| Ratify ADR-015 as is | Matches the tested code (1,579 unit and integration, 71 PostgreSQL, 265 e2e tests); no migration risk | Single API writer until core reads move to SQL |
| Ratify, and require core reads to move to SQL before a second replica | Same, plus a clear exit from the single-writer limit | Exit work still to do |
| Re-platform (Supabase-first or another stack) | Managed auth and storage | Discards tested code; months of work with no user benefit |

- **Decision:** the second option. ADR-015 is ratified. Its exit path becomes a requirement before anyone runs a second API replica (also plan decision TPD-05).
- **Steps only the owner can run:** before `00043` reaches a populated database, take a backup and check for case-duplicate emails (`SELECT lower(email), count(*) FROM users GROUP BY 1 HAVING count(*) > 1`). Then run `pnpm db:migrate` against a restored copy first and compare row counts.

### ADR-018 — Transactional email provider: Brevo (issue #44)

- **Status:** Accepted 2026-11-26 (delegated).
- **Context:** the worker sends work-email codes and referee links through a provider-independent service (`apps/worker/src/email`); Brevo is the only adapter and passes `tests/unit/email/provider-contract.ts`. Without live delivery, verified work history cannot work for real users.

| Option | Pros | Cons |
| --- | --- | --- |
| Brevo | Adapter built and contract-tested; free tier with a daily cap fits a pilot; EU-based | Lower deliverability reputation than specialist transactional senders |
| Postmark | Strong transactional deliverability | Paid from the first message; new adapter needed |
| Amazon SES | Lowest cost at volume | AWS account, sandbox exit request, new adapter |
| Resend | Simple API | New adapter; younger service |

- **Decision:** Brevo now. Its adapter exists, and switching later is an adapter plus `EMAIL_PROVIDER`, with no call-site changes. Revisit if bounce or spam rates on the pilot exceed what the provider dashboard shows as healthy.
- **Steps only the owner can run:**
  1. Create the Brevo account and an API key restricted to transactional sending.
  2. Choose the sending subdomain (for example `mail.<domain>`). Add Brevo's SPF and DKIM records and a DMARC record (`p=none` first, `quarantine` after two clean weeks).
  3. Set `EMAIL_PROVIDER=brevo`, the API key and the sender address in the worker's environment.
  4. Send the two templates to a real mailbox from staging.

### ADR-019 — Browser session in an httpOnly cookie, with CSRF defence; password reset by email (issue #49, plan TS-10)

- **Status:** Accepted 2026-11-26 (delegated). Implementation: two PRs.
- **Context:** the session token is in `localStorage`, readable by any script that runs on the page. There is no account recovery. The token issuer (HMAC, `packages/domain/src/auth.ts`) and revocation work and stay.

| Option | Pros | Cons |
| --- | --- | --- |
| Keep bearer token in `localStorage` | No change | Any XSS steals sessions; issue #49 open |
| httpOnly, `Secure`, `SameSite=Lax` cookie plus CSRF defence | Script cannot read the token; standard practice | CSRF must be handled; CORS needs credentials |
| Move to a hosted identity provider | Managed MFA and recovery | New vendor; migration of every account; INVARIANT-011 |

- **Decision:** the cookie. The API sets `ts_session` (httpOnly; `Secure` when deployed; `SameSite=Lax`; path `/api`) on login and registration, and clears it on sign-out. It accepts the cookie or the existing `Authorization: Bearer` header, so tests, scripts and API clients keep working.
- **CSRF defence:** every state-changing request authenticated by the cookie must carry the header `X-TalentSphere-CSRF: 1`, and its `Origin`, when present, must be in `CORS_ALLOWED_ORIGINS`. Browsers do not send that custom header cross-site without a CORS preflight, which the allow-list refuses.
- **Web app:** stops storing the token. It keeps a non-secret "signed in" marker for UX only (the API stays authoritative, INVARIANT-001).
- **Password reset:** a single-use token, stored only as a hash (INVARIANT-015), expiring after 30 minutes. It is sent by the email worker. Using it advances the session cutoff, which signs out every device. The request endpoint answers the same way whether or not the email exists, and is rate-limited like login.
- **Steps only the owner can run:** none beyond ADR-018. Reset emails need live email delivery to reach users; until then they go to the labelled dev outbox.
- **Built (API side):** `apps/api/src/session-cookie.ts`. Register, login, password change and "sign out other devices" set `ts_session`; sign-out clears it; every session read takes the Bearer header first, then the cookie; an `onRequest` hook refuses a cookie-only write without the CSRF header or from an origin outside `CORS_ALLOWED_ORIGINS` (403). Cookie headers are redacted from logs. Tests: `tests/integration/session-cookie.test.ts`. The web app still stores the token until the next PR moves it onto the cookie.

### ADR-020 — Files: S3-compatible object storage behind an adapter, with malware scanning (plan TS-06)

- **Status:** Accepted 2026-11-26 (delegated). Implementation: one PR (adapter, `files` table, upload route), with no vendor SDK.
- **Context:** there is no upload route. Resumes, imports, profile photos and course media all need one.

| Option | Pros | Cons |
| --- | --- | --- |
| Oracle Object Storage (S3-compatible API) | Same cloud as the staging assets in `deploy/oracle`; Always Free allowance; no new vendor relationship | Oracle-specific console and IAM |
| Cloudflare R2 | No egress fees; S3-compatible | New vendor |
| AWS S3 | Most mature | New account; egress fees |
| Supabase Storage | Managed | Tied to Supabase Auth policies the API does not use |
| Bytes in PostgreSQL | No new service | Bloats backups and the database; poor for media |

- **Decision:** one `ObjectStore` interface with two adapters:
  - local disk for development and tests;
  - S3-compatible, implemented with native `fetch` and AWS Signature V4, so no new dependency and no build-file change.
- **Target:** Oracle Object Storage, because it sits next to the staging host. R2 or S3 is a configuration change.
- **Scanning:** a `MalwareScanner` interface, with ClamAV (`clamd`) as the deployed scanner. Where no scanner is configured, a deployed API refuses uploads rather than storing unscanned files.
- **Access:** files are private and served only through short-lived signed URLs after an authorization check.
- **Steps only the owner can run:**
  1. Create the bucket and a customer secret key with access to that bucket only.
  2. Set the storage environment variables.
  3. Add a `clamd` container to the Oracle Compose file. `deploy/` is a protected path, so Claude proposes the change and the owner applies it.

### ADR-021 — Code execution sandbox and scoring trust rules (issue #49)

- **Status:** Accepted 2026-11-26 (delegated). Until the sandbox runs, behaviour stays as today: submissions are stored with `executed: false`, and interview execution is refused in staging and production.

| Option | Pros | Cons |
| --- | --- | --- |
| Self-hosted Judge0 CE (isolate sandbox) on its own host | Mature, many languages, per-run CPU, memory and time limits, network off; data stays with us | A host to run and patch; GPL-3.0 (fine as a separate network service) |
| Piston (self-hosted) | MIT licence, simple | Weaker isolation and resource accounting |
| Hosted Judge0 or a commercial API | Nothing to run | Candidate code and tests leave our systems; per-run cost |
| Run code in the API host or in the browser | Cheap | Unsafe (server) or untrustworthy (browser); issue #49 forbids an unsafe `eval` |

- **Decision:** self-hosted Judge0 CE on a dedicated host with no route to the database or the internal network, behind a `CodeRunner` adapter. Hidden tests stay server-side.
- **Trust rules:** ratify the rule PR #43 merged on 2026-10-18. The work-history skill bonus needs two distinct skills that independent referees confirmed; self-declared skill lists earn nothing. Executed evidence will count once the runner exists. No migration of stored scores is needed: a score is recomputed from records.
- **Steps only the owner can run:** provision the runner host (a separate Oracle Always Free VM is enough for a pilot), install Judge0 CE with networking disabled for submissions, and expose it only to the API host.

### ADR-022 — Split `apps/api/src/server.ts` into per-module plugins (plan TS-12)

- **Status:** Accepted 2026-11-26 (delegated). Scheduled after the P0 items.

| Option | Pros | Cons |
| --- | --- | --- |
| Leave the 13,887-line file | No churn | Every change touches one file; hard to own or review per module |
| One big-bang split | Done at once | Huge diff; conflicts with all in-flight work; hard to review |
| One Fastify plugin per module, one module per PR, no behaviour change | Each PR small and reviewable; tests prove nothing changed | Many PRs; shared Maps need a passed-in context during the transition |

- **Decision:** the third option. Start with modules no open branch touches. Each PR moves routes only, with all suites passing unchanged.

### ADR-023 — Course completion is not skill verification (plan P-02)

- **Status:** Accepted 2026-11-26 (delegated).
- **Context:** ARCHITECTURE §20 said completion could mint authority-verified evidence. Commit `bbeb331` (C-20) already made completion evidence start `unverified` with the description "not assessed". The certificate still names a "Verified Credential Authority".

| Option | Pros | Cons |
| --- | --- | --- |
| Completion counts as verified evidence | Learners feel rewarded | Attendance is not ability; employers would be misled ("verified over claimed", SSOT §3.1) |
| Completion stays unverified; a graded final assessment can raise the rung later | Honest; matches the evidence ladder | Completion certificates carry less weight |

- **Decision:** the second option. Completion evidence stays `unverified`. The certificate is a **completion record**: "verified" on it means only that the certificate is authentic. Only a graded assessment, once executed assessments exist (ADR-021), may raise course evidence above `unverified`.
- **Built:** the public verify answer names "TalentSphere course completion records" and carries `recordOf: 'course_completion'` (`verifyPublicCertificateProof`, `packages/domain/src/lms.ts`). The verify page calls it a "Course completion record" and says it is not an assessment of skill.

### ADR-024 — Erasure clocks and legal text (issue #45; SSOT DOR-017)

- **Status:** Accepted 2026-11-26 (delegated). Legal text stays a labelled draft (conservative: Claude is not counsel).
- **Context:** the code gives a 30-day grace period (`GDPR_GRACE_PERIOD_DAYS = 30`). The privacy page promises purge "within 30 days". SSOT DOR-017 notes that a 30-day cancel window and a 30-day completion deadline cannot both run from the same start. The GDPR expects a response without undue delay, within one month.

| Option | Pros | Cons |
| --- | --- | --- |
| 30-day cancel window, then erase | Most forgiving for accidental requests | Erasure lands after day 30; breaks the page's promise and the one-month expectation |
| 14-day cancel window, erasure completed by day 30 from the request | Both clocks hold from one start; keeps the published promise; still forgiving | Shorter undo window |
| Immediate erasure, no window | Simplest | Accidental and coerced requests cannot be undone |

- **Decision:** the second option:
  - The cancel window is 14 days from the request.
  - Erasure must be completed within 30 days of the request.
- **Recruiter-owned data:** on erasure, the person's jobs are closed and their personal identifiers removed. An organization they belong to stays if another admin exists; otherwise it is archived.
- **Execution:** the request stays at "request, status and cancel" until a scheduled executor is observed running. No automatic expiry is claimed before then.
- **Built:** `GDPR_GRACE_PERIOD_DAYS` = 14 and `ERASURE_COMPLETION_DAYS` = 30 in `packages/domain/src/settings.ts`; the request route returns `completeBy`. The Profile "Delete account" dialog still erases at once (with the current password, SSOT-AMD-01); that is the person's own choice and needs no window.
- **Legal pages:** stay marked as drafts.
- **Steps only the owner can run:**
  1. Have counsel review the privacy policy and terms, including the operator's legal identity and the India DPDP and GDPR positions.
  2. Create monitored `privacy@` and `security@` inboxes and set `VITE_PRIVACY_EMAIL` and `VITE_SECURITY_EMAIL` (added in PR #43).
  3. Remove the draft notice only after sign-off.

### ADR-025 — Staging deployment, single writer, backups and restore (issue #47)

- **Status:** Accepted 2026-11-26 (delegated). No production deploy is made by Claude.

| Option | Pros | Cons |
| --- | --- | --- |
| Oracle Always Free with the existing `deploy/oracle` assets | Assets, proxy and recovery runbook already exist; no cost | Single region; small instances |
| Managed platform (Render, Fly, Railway) plus managed PostgreSQL | Less operations work | Monthly cost; new deploy assets |
| Kubernetes | Scales | Far beyond current need; the read model allows only one API writer anyway |

- **Decision:** Oracle for staging and the pilot. Exactly one API replica, enforced by the existing advisory lock. Worker heartbeat and queue-age checks are on the admin health endpoint.
- **Backups:**
  - nightly `pg_dump`, kept 14 days, plus weekly dumps kept 8 weeks;
  - stored in the object storage bucket of ADR-020;
  - a restore drill every month, with time-to-restore recorded in `deploy/oracle/RECOVERY.md` (owner-maintained; `deploy/` is protected).
- **Steps only the owner can run:** follow `deploy/oracle/README.md` to bring up staging, run the first restore drill, and record it. Production stays a separate go decision for the owner.

### ADR-026 — Beta durability scope (issue #48)

- **Status:** Accepted 2026-11-26 (delegated).
- **Decision:** a module is made durable only if a web screen uses it. The order is resumes (built, T-007), then portfolio, course progress, challenge submissions, and moderation reports and appeals (plan TS-03). One PR per module, each with PostgreSQL restart and isolation tests.
- **Everything else:** either parked behind flags (plan decision TPD-04, PR #101) or keeps its `ephemeral` label and has no screen.
- **Rejected:** a mass rewrite of every ephemeral route. Issue #48 itself rules it out.

### ADR-027 — Launch free-only (issue #50)

- **Status:** Accepted 2026-11-26 (delegated). This is the conservative money option.

| Option | Pros | Cons |
| --- | --- | --- |
| Free-only launch, Stripe wired but disabled | No payment, tax or refund obligations before product fit; matches TPD-10 (candidates free) | No revenue during the pilot |
| Paid employer plans at launch | Early revenue signal | Needs live Stripe verification, tax, refund policy and legal review first |

- **Decision:** free-only. `BILLING_MODE=disabled` stays the default, and the checkout page keeps denying paid activation. Prices in `PRICING.md` remain recommendations. Paid employer plans are revisited after the pilot measures `ns.evidence_backed_conversations`.
- **Steps only the owner can run (later):** a live Stripe account, tax settings, a refund policy reviewed by counsel, then `BILLING_MODE=stripe` in staging first.

### ADR-028 — One small-cell threshold: `min_cohort_k` = 10 distinct people (conflict C-8)

- **Status:** Accepted 2026-11-26 (delegated). This is the conservative privacy option.
- **Context:** SSOT Amendment G sets k ≥ 10 for public and sensitive cells. Registry BR-158 and BR-178 say k ≥ 5. The code used 5 for salary benchmarks (`SALARY_BENCHMARK_MIN_COHORT`) and counted reports, not people, while one account may file 5 reports a day. Employer and instructor review aggregates have no display threshold at all: their `< 5` checks only switch off outlier trimming.

| Option | Pros | Cons |
| --- | --- | --- |
| k ≥ 5 (registry) | More cells shown | Weaker re-identification protection; below the SSOT default, which needs counsel to lower |
| k ≥ 10 distinct people (SSOT) | Stronger protection; one rule everywhere | Fewer cells shown early on |

- **Decision:** k ≥ 10, counted as distinct people (a person who files two reports counts once). It applies to salary cells and employer and instructor review aggregates. Features that already use a higher value keep it: learning impact 30, career benchmarks 20, application feedback 10. The registry rows BR-135, BR-158 and BR-178 change to match.
- **Built:** salary benchmarks count distinct people with a floor of 10 (`SALARY_BENCHMARK_MIN_COHORT`, `countDistinctReporters` in `packages/domain/src/salary-intelligence.ts`). Employer and instructor review aggregates are parked (TPD-04, `FEATURE_REPUTATION`), so nobody sees them; the k ≥ 10 rule must be added to them before that flag is turned on.

### ADR-029 — AI output quality rules follow the SSOT wording (conflict C-22)

- **Status:** Accepted 2026-11-26 (delegated).
- **Context:** for BR-065 and BR-066, SSOT says "capability-specific evaluation, no universal confidence threshold" and the registry says "below 0.7 disclaimer, below 0.5 suppressed". No code implements either. BR-35 and BR-208 cite different sections.

| Option | Pros | Cons |
| --- | --- | --- |
| Registry thresholds (0.7 and 0.5) | Simple to test | Confidence scores are not comparable across models or tasks, so one number gives false assurance |
| SSOT wording | Each AI feature is gated by its own evaluation set (plan §17.1) and falls back to non-AI | Each feature needs its own gate |

- **Decision:** the SSOT wording. The registry rows BR-065 and BR-066 now carry it, BR-208 cites SSOT §15.10, and BR-35 cites SSOT §10.19.

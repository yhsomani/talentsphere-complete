# Architecture decision records

> **Status.** As-built decisions (ADR-015, ADR-016). Ratification of ADR-015 is still open (issue #46).
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

- **Status:** Accepted for this branch, **pending owner ratification** (it changes the schema — see "Escalation").
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

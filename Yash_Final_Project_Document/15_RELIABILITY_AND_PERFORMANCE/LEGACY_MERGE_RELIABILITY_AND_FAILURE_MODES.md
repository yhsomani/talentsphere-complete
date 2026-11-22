# Legacy Merge B-15: Reliability Constants, Observed Failure Modes and Capacity Lessons (Prior Attempt) as FMEA and SLO Seeds

Doc ID: LGM-B-15 · Owner: SRE Lead · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: OPS-FMEA, OPS-SLO, OPS-SLO-R2, OPS-CAP, OPS-OBS, ADR-T05, ADR-T09, OPEN-15, OPEN-23 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: reliability, performance and failure facts spread across `31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md`, `.../quality/TESTING.md`, `.../quality/SECURITY.md`, `.../system-model/02-flows.md` (F5, F6), `.../system-model/03-conflict-register.md` (CF-05, CF-06, CF-07, CF-23, CF-24, CF-30, CF-42, CF-43) and root `ARCHITECTURE.md` (sections 18-21).

## 0. Frame

- **No measured behaviour exists for this project.** The legacy documents themselves said: SLOs are set "per-service/per-capability after baseline measurement" and "avoid false precision before measurement". Therefore none of the numbers below is an SLO. They are **starting defaults the prior attempt chose** (constants in its code and docs), kept so the target's starting values (BE-01, API-STD) can be compared and so that nothing observed is lost.
- "Prior attempt reported" = claims about the earlier attempt; "Target requires" = requirement here.

## 1. Timing and limit constants reported (prior attempt) vs. target

| Constant | Prior attempt value | Target position |
|---|---|---|
| Session token lifetime | 24 h (stateless HMAC) | Short access token + rotating refresh (ADR-T06); values in SEC-02 |
| Email verification challenge | 6-digit code, 15 min expiry, 5 wrong attempts | keep as starting default (BR-T) |
| Reference link validity | none initially; 30 days after fix (CF-10) | 14 days (diagram DGM-01 section 6); confirm in BR-T |
| Payment-provider signature tolerance | 300 s (5 min) | keep 5 min |
| Own-format billing webhook tolerance | 300 s | n/a (single provider) |
| Global API limiter | 300 / min per verified account, else per address | RL classes in API-STD section 9 (read 600/min, write 120/min, etc.) |
| Login limiter | 10 per 15 min per IP + email | RL-AUTH 20/10 min per IP and 10/15 min per identifier |
| Sign-up limiter | 20 per 15 min per IP (registration) | RL-AUTH |
| Job claim batch | up to 10 jobs | per-queue config (BE-01) |
| Job lease | 60 s | fenced lease with heartbeat extension |
| Handler timeout | 30 s via `Promise.race` (not abortive) | per-handler budget with abort signal |
| Max attempts | 3 (then dead) | per-queue; DLQ with replay tooling |
| Backoff | exponential with jitter and cap | keep |
| Terminal job retention | purge after 7 days | DB-03 retention table |
| Worker heartbeat | written between claim cycles once 10 s elapsed; stale if > 45 s | independent timer; thresholds in OPS-SLO |
| Overdue queued job alert | > 5 minutes | queue-age SLO |
| Terminal failure alert window | any in past 1 hour | error-budget alert |
| Client API timeout | 20 s default (browser helper) | per-route timeouts in the API client; keep 20 s as ceiling |
| Email provider HTTP timeout | 20 s | keep, with retry classification |
| Password hash cost | PBKDF2-SHA512, 210,000 iterations | argon2id parameters per SEC-02 |
| Cohort floors | benchmarks 20 distinct people; learning impact 30; salary benchmark 5; salary company 3; segmentation 10; feedback aggregate 10 | single k policy (OPEN-25) |

## 2. Failure modes the prior attempt observed or reported (FMEA seeds)

| # | Failure / defect | Prior behaviour | Evidence id | Target requirement |
|---|---|---|---|---|
| 1 | Event enqueue fails after a committed change | Error logged and swallowed; request succeeded; event lost (two email routes avoided it by returning 503) | CF-23 | Outbox in the same transaction (INV-T12); no post-commit enqueue |
| 2 | Job reclaim after lease expiry | Did not check `attempts`; a crashing worker could exceed max attempts before dead | CF-24 | Reclaim checks attempts; dead-letter after limit |
| 3 | Handler timeout | Timeout did not abort the underlying promise; waiting consumed later jobs' leases; duplicates possible | D-02 | Abortable handlers; heartbeat extension; fenced completion |
| 4 | Completion not fenced by claim generation | A stale worker could complete after reclaim | D-02 | Claim generation (fencing token) on completion (ADR-T09) |
| 5 | Writer lease lost (single API writer) | 503 on every request until restart | ST-04 | Retired by ADR-T05 |
| 6 | Account erasure when provider customer already deleted | Retry got "resource not found" and returned 503, erasure could not finish | CF-05 | Treat "already deleted" as success; idempotent saga steps |
| 7 | Erasure stops partway after deactivation | Caller could not retry later steps | D-03 | Resumable saga with per-step state and operator tooling |
| 8 | Checkout event for a customer already linked to another account | Unique violation; provider retried for days | CF-06 | Ignore such events with an audit record; 2xx the provider |
| 9 | Refund matched to subscription by time only | Wrong subscription cancelled | CF-07 | Resolve through invoice payment; fail safe when unresolved; provider outage on cancel -> throw so provider retries |
| 10 | Out-of-order provider events | Handled by skipping events older than the newest applied; newer live subscription recorded makes older events "record only" | F5 | Keep; test event-order matrix |
| 11 | Two concurrent paid checkout sessions | Second subscription ignored but still billed | CF-30 | Policy decision L-B13-02 |
| 12 | Email provider key or from-address missing | Permanent failure, no retry; otherwise provider errors retried | F4 | Keep permanent vs transient classification |
| 13 | Sign-out request fails (offline) | Client clears locally; server session lives until expiry | security | Refresh-family revocation; accept as residual risk, document |
| 14 | Normal user locked out by limiter | Old default 100 per 15 min per address blocked a user after ~20 page views | security lesson | Realistic-session rate-limit E2E test |
| 15 | Memory-only state for features offered in UI | Lost on restart (applications drafts, alerts, resumes, connections, etc.) | CF-25, CF-43 | All durable; restart-survival tests |
| 16 | Maintenance mode only changed diagnostics | No traffic blocked; reset on restart | CF-42 | Persisted flag; real write-blocking behaviour |
| 17 | Stale build output used by API/worker | Misleading pass/fail | architecture | Build in pipeline; build id in health |
| 18 | Standalone worker in memory mode | Idle (could not see API process Maps) | architecture | n/a (no memory mode in prod) |
| 19 | Password re-hash failure on login | Only logged (login still succeeded) | F2 | Acceptable; alert on repeated failures |
| 20 | Worker cancellation | Cooperative at acknowledgement; does not undo effects | architecture | Compensating action design for cancel |
| 21 | Dev delivery sink logs codes | Sensitive data in logs | OPERATIONS | Test-only sink; never log codes in shared environments |
| 22 | Slow boot as data grows | Hydration read every core row at start; acceptable only at pre-launch volume | ADR-015 | Retired by ADR-T05 |

**Target requires:** map each row to an FMEA entry (FM-xx) or mark "retired by design"; rows 1, 3, 4, 6-9, 12, 14, 15 and 16 must have a named test in QA-CAT. Gap check owner: SRE Lead, tracked as **L-B15-01**.

## 3. Performance and capacity lessons

- Prior performance layer asserted only gross-regression guards (no SLO); DB query counts and queue age unmeasured. **Target:** SLO calibration from WP-LOADBASE (OPEN-15); add query-count budget per route class and queue-age SLI.
- Prior hosting target: free-tier ARM64 single VM; one API instance; no HA; backups unimplemented in the compose file; no deployed metrics/tracing/alert backend established; liveness insufficient (see operations file section 2.5).
- Core design lesson: a process-memory read model forced a single instance and boot time/memory proportional to data. **Target:** SQL-only reads; capacity analysis in OPS-CAP stands; add "boot time independent of data volume" as a design check.
- UX-level reliability facts: browser helper default 20 s timeout, error masking of server faults, route error boundary for render failures, session auto-clear/redirect on 401 only when a token existed (403 retains session), throttle timing surfaced to the user. **Target:** keep as client resilience requirements (see `../10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md`).

## 4. Disaster recovery facts (prior attempt)

Restore verification existed only as unexecuted scripts (restore into a temporary database, verify migration ledger, drop it). Required but unproven: encrypted off-VM backups, retention, scheduler, missed-backup alert, separate-host restore drill, documented RPO/RTO, application-level verification after restore. Hosted-database PITR/backup posture unverified. Details and target requirements are in `../17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` section 8.

## 5. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B15-01 | Map the 22 observed failure modes to FMEA rows or mark retired | SRE Lead |
| L-B15-02 | Cohort k floors: one policy (20 / 30 / 10 / 5 / 3 in legacy) | OPEN-25 |
| L-B15-03 | Reference-link validity: 14 days (target) vs 30 days (legacy fix) | Product Director + Security Architect |

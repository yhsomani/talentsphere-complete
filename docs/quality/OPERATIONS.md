# TalentSphere — OPERATIONS.md v6.0

## 1. Environments

```text
local → CI → preview → staging → production
```

Each environment has separate secrets/config.

## 2. Observability

Critical trace:

```text
request → user → tenant → feature → API → DB/queue → provider → result
```

Use structured logs, metrics, traces, audit events and business dashboards.

## 3. SLOs

Set per-service/per-capability SLOs after baseline measurement.

## 4. Alerts

Alert on:
- elevated error rate;
- latency/SLO breach;
- queue age/backlog;
- database saturation;
- auth failures;
- tenant isolation signal;
- payment/webhook failures;
- AI policy/cost anomalies;
- assessment integrity anomalies.

## 5. Backups/DR

Prove:
- restore;
- point-in-time recovery where supported;
- storage recovery;
- queue recovery;
- configuration restoration;
- rollback.

## 6. Incident lifecycle

```text
detect → contain → assess → recover → communicate → postmortem
```

## 7. Runbooks

At minimum:
- DB incident;
- auth;
- RLS/tenant isolation;
- storage;
- queue;
- provider outage;
- payments;
- AI provider/policy;
- assessment integrity;
- privacy request;
- rollback;
- DR.

## 8. Release

No release without:
- security gate;
- critical E2E;
- accessibility evidence;
- migration proof;
- rollback path;
- observability;
- business acceptance.

---

## 9. Operating the current build (as implemented, 2026-10-10)

Sections 1–8 are the target operating model. This section is what the code in this
repository actually requires today.

### Processes and topology

- **API** (`apps/api`, `node dist/index.js`) — run **exactly one process per database**.
  The API keeps a read model of the core loop in memory, hydrated from Postgres at boot
  (ADR-015, `docs/engineering/adr/ADR-015-core-loop-persistence.md`). A second replica
  would serve state that diverges from the first. Scaling out requires the ADR-015 exit
  path (core reads in SQL) first.
- **Worker** (`apps/worker`) — claims `background_jobs` with `FOR UPDATE SKIP LOCKED`;
  safe to run more than one.
- **Web** (`apps/web/dist`) — static bundle; `VITE_SUPPORT_EMAIL` is baked in at build time.

### Required configuration

| Variable                       | Production rule                                                               |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `TOKEN_SECRET`                 | Required, ≥ 32 random characters. Rotating it signs everyone out.            |
| `DATABASE_URL`                 | Required; not the local default.                                              |
| `STORAGE`                      | `pg` (default). `memory` is refused in production.                            |
| `CORS_ALLOWED_ORIGINS`         | The web origin(s); localhost is refused in production.                        |
| `BILLING_MODE`                 | `disabled` (default). `simulated` activates paid plans without payment and is refused in production. |
| `BILLING_WEBHOOK_SECRET`       | Unset ⇒ the billing webhook answers 503 to everything.                        |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Login attempts per IP+email and sign-ups per IP per window (default 10).      |
| `RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` | Global limiter per signed-in account (per address when anonymous); default 300 per minute. |
| `TRUST_PROXY`                  | **Required behind a load balancer** (e.g. `1`): otherwise every anonymous client shares the proxy's address and one rate-limit bucket. |

`apps/api/src/index.ts` refuses to start in production when any rule above is broken and
prints which ones (`productionConfigProblems()`).

### Database

- Apply migrations with `pnpm db:migrate` (`scripts/migrate.mjs`: one transaction per
  file, `schema_migrations` ledger, re-running is a no-op). CI applies all migrations to
  an empty database and re-runs the runner on every push.
- Migration `00043` builds a case-insensitive unique index on `users.email`; on a database
  that already holds two emails differing only by case it fails — de-duplicate first.
- **Rows changed directly in SQL are seen by the API only after a restart** (the read
  model is hydrated at boot).
- Bootstrapping the first platform admin: no API route can create one (sign-up offers
  candidate and recruiter only; role changes need an existing admin). Add the role in SQL
  — `UPDATE public.users SET roles = array_append(roles, 'platform_admin') WHERE lower(email) = lower($1);`
  — then restart the API.
- Background-job retention: terminal jobs older than 7 days are purged opportunistically;
  one-time codes and reference tokens are stripped from a job's payload when it finishes.

### What survives a restart

The core loop — accounts, profiles, organizations and members, skills, jobs,
applications, evidence, work history, references and open email challenges — and
background jobs. Every other route keeps its state in process memory and says so with
the response header `x-talentsphere-durability: ephemeral` (registry:
`apps/api/src/durability.ts`; admin health diagnostics report the split).

### Email

No email provider is integrated. The worker's email handlers print messages to the log
in development ("DEV OUTBOX") and **fail them permanently in every other environment**
— visible as `failed` rows in `background_jobs`. Consequence: corporate-email codes
and referee links cannot reach anyone outside development, so work-history verification
cannot be completed there. Integrating a provider is an owner decision (new infrastructure).

### Logs and alerting

- Pino JSON logs with redaction of credentials and tokens.
- Refused requests (4xx) log at `info` as `API request rejected` with status and code;
  server faults (5xx) log at `error` as `API request failed` with the stack. **Alert on
  error-level logs**: they now mean something is broken.
- Every response carries `x-request-id`; error bodies carry the same id as `request_id`.

### Health

- `/health` — liveness. `/api/v1/health` — adds environment. Both are exempt from the rate limiter, so a load balancer's polling can never throttle the API into looking dead.
- `GET /api/v1/admin/health-diagnostics` (platform admin) — storage mode, database
  reachability (a live round-trip), queue status and active job count, and how many routes
  are durable. **Worker liveness is not measured** (no heartbeat): a dead worker over a live
  database still reports the queue as operational — watch for `queued` jobs that age.

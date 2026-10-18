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
| `STORAGE`                      | `pg` (default). `memory` is refused in production and staging.                |
| `CORS_ALLOWED_ORIGINS`         | The web origin(s); localhost is refused in production.                        |
| `BILLING_MODE`                 | `disabled` (default). `simulated` activates paid plans without payment and is refused in production. |
| `BILLING_WEBHOOK_SECRET`       | Unset ⇒ the billing webhook answers 503 to everything.                        |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Login attempts per IP+email and sign-ups per IP per window (default 10).      |
| `RATE_LIMIT_MAX_REQUESTS` / `RATE_LIMIT_WINDOW_MS` | Global limiter per signed-in account (per address when anonymous); default 300 per minute. |
| `TRUST_PROXY`                  | **Required behind a load balancer** (e.g. `1`): otherwise every anonymous client shares the proxy's address and one rate-limit bucket. |

`apps/api/src/index.ts` refuses to start in production when any rule above is broken and
prints which ones (`productionConfigProblems()`). Staging (`NODE_ENV=staging`) gets the
`TOKEN_SECRET`, `DATABASE_URL` and `STORAGE` rules too, but may simulate billing and allow a
localhost origin for testing.

### Database

- The API now holds a PostgreSQL session advisory lock for its entire
  lifetime (`pg_try_advisory_lock(718201, 1)`). A second API process against
  the same database refuses to boot, rather than serving a stale read model.
  Losing the lock session makes API traffic return 503 until restarted.
  This is a **single-writer enforcement**, not horizontal scaling support.
- The worker writes `public.worker_health.last_seen_at` every ten seconds.
  Admin health diagnostics now mark the queue degraded if the last heartbeat
  is more than 45 seconds old, missing, or unavailable. Monitor stale
  heartbeats and `background_jobs` retry/dead records. An API health liveness
  response alone does not establish worker processing.
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

Erasure request creation, status history and cancellation now use the existing
`public.data_erasure_requests` PostgreSQL table through
`apps/api/src/storage/erasure-store.ts`. A database account-row lock
serializes concurrent erasure requests. The immediate erasure operation is
still separate. **No scheduled deletion executor exists yet** and the
30-day grace-period versus immediate-delete policy needs explicit owner/legal
approval before a public release. Do not claim due-date deletion is automatic.


The core loop — accounts, profiles, organizations and members, skills, jobs,
applications, evidence, work history, references, open email challenges,
notifications and notification preferences — and background jobs. Every other route keeps its state in process memory and says so with
the response header `x-talentsphere-durability: ephemeral` (registry:
`apps/api/src/durability.ts`; admin health diagnostics report the split).

### Transactional email (opt-in)

Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` (server/worker secret),
`EMAIL_FROM` (verified sender), and an HTTPS `APP_URL` in both the API and
worker environments. **Configured does not mean delivered:** the API reports
durable enqueue, and the worker submits with a provider idempotency key. The
provider response can still be rejected, delayed or bounced. Validate sender
DNS, delivery and bounce monitoring in staging before claiming issue #44 closed.
With no configuration, deployed creation endpoints fail closed with 503.

### Account metadata and secret handling

User settings and export-request history now use existing `user_settings` and
`data_export_requests` PostgreSQL tables. The BYO AI key uses AES-256-GCM with
a separate `BYO_AI_KEY_ENCRYPTION_KEY` (64 hex chars); no key means storing a
BYO secret is refused, not downgraded to plaintext. Rotate only with a tested
re-encryption plan. Legacy plaintext keys, if any, must be remediated explicitly.
Account erasure clears those tables and a defined set of in-process private
maps, but other modules, shared records and backups still require the owner-
approved full erasure/retention inventory.

### Data export

`POST /api/v1/settings/export` returns a JSON snapshot inline. Evidence
and applications are selected by the candidate **profile** ID; no fabricated
user/profile fallback is emitted. CSV is refused with 503 until genuinely
implemented; no dead `downloadUrl` is returned. This is a partial snapshot:
data in non-durable modules is not a complete statutory export. Full export
coverage, retention and downloadable archive policy remain release gates.
The JSON metadata deliberately makes **no statutory compliance claim** while
the archive contains only a subset of personal data.

### Email

The API now fails creation of mailbox-verification codes and referee
invitations closed with `SERVICE_UNAVAILABLE` in staging and production,
before it would queue an undeliverable message. Development/test mock delivery
is unchanged. This is a safety fallback, **not** email provider integration.


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
  are durable. Worker liveness is measured with the database heartbeat: a dead worker over a live
  database still reports the queue as operational — watch for `queued` jobs that age.

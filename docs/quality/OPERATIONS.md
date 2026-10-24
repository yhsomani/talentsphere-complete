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

## 9. Operating the current build (source checked 2026-10-23)

Sections 1–8 are the target operating model. This section is what the code in this
repository actually requires today.

### Processes and topology

- **API** (`apps/api`, `node dist/index.js`) — run **exactly one process per database**.
  The API keeps a read model of the core loop in memory, hydrated from Postgres at boot
  (ADR-015, `docs/engineering/adr/ADR-015-core-loop-persistence.md`). A second replica
  would serve state that diverges from the first. Scaling out requires the ADR-015 exit
  path (core reads in SQL) first.
- **Worker** (`apps/worker`) — claims `background_jobs` with `FOR UPDATE SKIP LOCKED`;
  multiple workers can reclaim expired batch leases and execute jobs twice (audit D-02). SKIP LOCKED does not establish exactly-once execution.
- **Web** (`apps/web/dist`) — static bundle; contact variables `VITE_SUPPORT_EMAIL`, `VITE_PRIVACY_EMAIL` and `VITE_SECURITY_EMAIL` are baked in at build time where used.

### Required configuration

| Variable                       | Production rule                                                               |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `TOKEN_SECRET`                 | Required, ≥ 32 random characters. Rotating it signs everyone out.            |
| `DATABASE_URL`                 | Required; not the local default.                                              |
| `STORAGE`                      | `pg` (default). `memory` is refused in production and staging.                |
| `CORS_ALLOWED_ORIGINS`         | The web origin(s); localhost is refused in production.                        |
| `BILLING_MODE`                 | `disabled` (default), `simulated` (no payment; refused in production), or `stripe` (configured provider). |
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
- The worker checks `public.worker_health.last_seen_at` between claim cycles and writes a heartbeat when ten seconds have elapsed; long batches can delay the write.
  Admin health diagnostics now mark the queue degraded if the last heartbeat
  is more than 45 seconds old, missing, or unavailable. Monitor stale
  heartbeats and `background_jobs` retry/dead records. An API health liveness
  response alone does not establish worker processing.
- For ordinary local PostgreSQL, apply migrations with `pnpm db:migrate` (`scripts/migrate.mjs`: one transaction per
  file, `schema_migrations` ledger, re-running is a no-op). CI applies all migrations to
  an empty database and re-runs the runner on every push. Hosted Supabase must use the separate [migration gate](../engineering/HOSTED_SUPABASE_MIGRATION_GATE.md); the local runner refuses it.
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
notifications and notification preferences — and background jobs. Dedicated SQL stores also persist account metadata, erasure requests, saved searches/jobs, admin audit, flags and billing. Remaining ephemeral routes keep state in process memory and are labelled with
the response header `x-talentsphere-durability: ephemeral` (registry:
`apps/api/src/durability.ts`; admin health diagnostics report the split).

### Transactional email (opt-in)

Brevo is the only provider. Set `EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`
(server/worker secret), `EMAIL_FROM` (a sender authenticated in Brevo), optional
`EMAIL_FROM_NAME` / `EMAIL_REPLY_TO`, and an HTTPS `APP_URL` in both the API
and worker environments. An unrecognised `EMAIL_PROVIDER` is a startup error,
never a silent fallback. **Configured does not mean delivered:** the API reports
durable enqueue; the worker records only that Brevo *accepted* the message
(`messageId` logged). Delivery, bounce and block events are not consumed yet
(no webhook route or table), and Brevo has no idempotency key, so a retry after
a timeout can send a duplicate. The provider response can still be rejected,
delayed or bounced. Validate sender
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

### Transactional email operational gate

The Brevo adapter is present and **opt-in**, not proof of mailbox delivery.
Before enabling public verification, authenticate the sender domain in Brevo
(SPF, DKIM, DMARC records at the DNS host), install
`EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`, `EMAIL_FROM`, and `APP_URL` in the
API and worker secrets, send both code and referee-link emails to real staging
mailboxes, and record delivery, bounce and failure evidence. Never put sample
one-time tokens or provider credentials in GitHub evidence. Pending delivery is
not successful delivery. Without approved provider configuration, deployed
verification creation refuses requests; do not relabel that as delivered.

### Target database preflight (read-only)

Run from the repository root with `DATABASE_URL` pointing **only** at the
intended target. Output contains check identifiers and counts, not personal
records or secrets; nonzero exit status blocks promotion.

```sh
# Before applying migration 00043 on an EXISTING populated database:
node scripts/release-preflight.mjs --mode=pre-00043
# After applying all migrations; also run in CI against clean Postgres:
node scripts/release-preflight.mjs --mode=schema
# On staging/production, from an external monitor after the worker is running:
node scripts/release-preflight.mjs --mode=operational
```

The pre-00043 run detects case-folded email duplicates, active-application
collisions and candidate IDs with no corresponding user record. Resolve conflicts
under an approved backfill plan, **not by deleting rows automatically**. The
schema run detects changed applied SQL, missing 00043/00049, required indexes,
foreign-key targets, and sensitive-table RLS enablement. The operational run
also fails on stale worker heartbeat (45 seconds), queued jobs overdue by five
minutes, or terminal job failures within the past hour. Wire the nonzero exit
status to an external monitoring/alerting service; running the script once
creates no ongoing alerts. It checks RLS is enabled, **not** that hosted roles,
grants and all policies prove cross-tenant isolation.

These checks do **not** demonstrate an actual populated-database upgrade,
backup/point-in-time restore, load or cold-boot performance, HTTPS reverse
proxy, multi-replica admission, rolling deploy or incident response. Capture
separate staging evidence and operator approval before closing #46 or #47.

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
  are durable. Worker liveness uses the database heartbeat and flags an absent or stale worker.
  Also monitor overdue queued and failed/dead jobs; health is not a delivery receipt.


### Stripe configuration and troubleshooting

`BILLING_MODE=stripe` requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and
at least one distinct configured `STRIPE_PRICE_*` ID. The six optional catalog
keys cover candidate pro, recruiter starter and recruiter enterprise, monthly
or yearly. Deployed return links require HTTPS `APP_URL`; production refuses
Stripe test-mode keys. The server chooses prices and checks plan role eligibility.
Provider price amounts/currency are external configuration and must be reconciled
with the domain catalog before release.

Register the callback path `/api/v1/billing/stripe-webhook` for the events handled
by `normalizeEvent`: checkout completion, subscription created/updated/deleted,
invoice paid/payment_failed and charge refunded. The generic `/billing/webhook`
uses a different signature. Portal setup is external. A checkout redirect alone
is not subscription confirmation; inspect persisted subscription/events and
provider logs. Watch superseded subscriptions, webhook throttling and failed
post-commit event enqueue. Disputes and voided invoices remain unsupported.

### Common local failures

| Symptom | Check |
| --- | --- |
| Missing workspace export or stale behavior | API/worker import existing `dist`; operator rebuild required after source changes |
| Database boot failure | `DATABASE_URL`, schema/ledger and storage mode; no automatic memory fallback |
| Second API refuses boot | Existing session advisory writer lease; do not launch another writer |
| Sessions expire after every restart | Stable private `TOKEN_SECRET`; do not use published test keys |
| Queue degraded despite API liveness | Heartbeat age, long claim batch, database reachability, retry/dead records |
| Email route returns 503 | Deployed provider configuration and durable enqueue; sender/delivery require separate evidence |
| Checkout unavailable | Billing mode, server catalog IDs, secrets and account role; never supply a client-controlled price |
| Changes made directly in SQL do not appear | Restart/re-hydrate the API for core read-model records |

The environment schema uses `z.coerce.boolean()` for AI flags. String values are
not a strict true/false parser; do not assume textual `false` disables a flag.
This is a configuration discrepancy to address in an explicitly scoped code fix.
The flags do not establish a connected paid model provider.

# Legacy Merge B-18: Operations Runbook Material, Operational Gates and Common Failures (Prior Attempt)

Doc ID: LGM-B-18 · Owner: SRE Lead (with Head of Operations) · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: SUP-RUN, SUP-INC, SUP-PROC, OPS-OBS, OPS-DEP, FM-01..FM-48, RB-01..RB-37, OPEN-08, OPEN-16, OPEN-26, OPEN-39 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md` v6.0 (15.1 KB; sections 1-8 target operating model, section 9 "operating the current build, source checked 2026-10-23").

## 0. Frame

- **Nothing is operated here.** Section 9 of the legacy file described what the *prior attempt's* code required; every statement is "prior attempt reported". "Target requires" is a requirement for this project, to be incorporated into runbooks (RB-nn) and processes (PROC-nn).
- Legacy limits repeated for honesty: configured does not mean delivered; liveness does not mean working; a script run once creates no alerts.

## 1. Legacy "target operating model" sections 1-8 (preserved, mapped)

| Legacy section | Text (preserved) | Target document / status |
|---|---|---|
| 1 Environments | `local -> CI -> preview -> staging -> production`; each with separate secrets/config | OPS-REL environment table (matches) |
| 2 Observability | Critical trace `request -> user -> tenant -> feature -> API -> DB/queue -> provider -> result`; structured logs, metrics, traces, audit events and business dashboards | OPS-OBS (matches; verify the `feature` dimension and `tenant` dimension are present in span attributes - action SRE) |
| 3 SLOs | Set per service/capability **after baseline measurement** | OPS-SLO / OPEN-15 (matches) |
| 4 Alerts | Alert on: elevated error rate; latency/SLO breach; queue age/backlog; database saturation; auth failures; tenant isolation signal; payment/webhook failures; AI policy/cost anomalies; assessment integrity anomalies | OPS-OBS section 6 ALT-*; verify each of the nine classes has an ALT id (gap check L-B18-01) |
| 5 Backups/DR | Prove restore; PITR where supported; storage recovery; queue recovery; configuration restoration; rollback | OPS-DEP section 7 (REC-001..005) |
| 6 Incident lifecycle | `detect -> contain -> assess -> recover -> communicate -> postmortem` | SUP-INC (longer legacy sequence in security file adds preserve/eradicate/notify/learn) |
| 7 Runbooks (minimum list) | DB incident; auth; RLS/tenant isolation; storage; queue; provider outage; payments; AI provider/policy; assessment integrity; privacy request; rollback; DR | RUNBOOK_INDEX RB-01..RB-37 (verify each of the twelve topics has an RB id - L-B18-01) |
| 8 Release | No release without security gate, critical E2E, accessibility evidence, migration proof, rollback path, observability, business acceptance | OPS-REL RG gates |

## 2. Prior-attempt operational facts that should become runbook content

### 2.1 Persistence and restart behaviour

- Rows changed directly in SQL were visible to the API only after a restart (hybrid read model) - retired by ADR-T05; **runbook note:** under the target, direct SQL edits are forbidden outside an audited break-glass procedure (INV-T18).
- Erasure request creation, status history and cancellation used a durable table with an account-row lock to serialize concurrent requests; the immediate-erasure operation was separate; **no scheduled deletion executor existed**; the 30-day-grace versus immediate-delete policy "needs explicit owner/legal approval before a public release. Do not claim due-date deletion is automatic." **Target requires** RB for privacy requests (SUP-PROC) to state that the executor is a scheduled worker job with per-step state and alerting on stuck steps (L-B12-01 in the database file).
- Account metadata (settings, export-request history) lived in durable tables; erasure cleared those tables and "a defined set of in-process private maps, but other modules, shared records and backups still require the owner-approved full erasure/retention inventory." **Target:** DATA-xxx inventory (DB-03) is that inventory; the erasure saga covers each DATA row; backups age out and restores replay the erasure ledger (DB-03 section 5.6).

### 2.2 Data export

`POST settings/export` returned a JSON snapshot **inline**; evidence and applications were selected by the candidate *profile* id; no fabricated user/profile fallback was emitted; **CSV was refused with 503** until genuinely implemented; **no dead `downloadUrl`** was returned. It was a partial snapshot: data in non-durable modules was not a complete statutory export; "the JSON metadata deliberately makes **no statutory compliance claim** while the archive contains only a subset of personal data." Full export coverage, retention and downloadable archive policy remained release gates.
**Target requires:** export as an asynchronous job producing an expiring signed download (API-STD async pattern), covering every personal-data table in DATA-xxx; the export manifest lists what is included and excluded; never return a link that does not work; no compliance claim in metadata until counsel signs off (OPEN-08).

### 2.3 Transactional email (opt-in provider) - operational gate

- Provider configuration (prior attempt): provider selection variable (`EMAIL_PROVIDER=brevo`), provider API key (server/worker secret), `EMAIL_FROM` (a sender authenticated at the provider), optional from-name and reply-to, an HTTPS application URL (`APP_URL`) - set in **both** API and worker environments. An unrecognised provider value was a startup error, never a silent fallback. With no configuration, deployed creation endpoints failed closed with 503.
- **Configured does not mean delivered:** the API reported durable enqueue; the worker recorded only that the provider *accepted* the message (message id logged); delivery, bounce and block events were **not** consumed (no webhook route or table); the provider had no idempotency key so a retry after a timeout could send a duplicate; a provider response could still be rejected, delayed or bounced.
- Operational gate before enabling public verification: authenticate the sender domain (SPF, DKIM, DMARC records at the DNS host); install the provider variables in API and worker secrets; send both the code email and the referee-link email to real staging mailboxes; record delivery, bounce and failure evidence; never put sample one-time tokens or provider credentials in tracker evidence; "pending delivery is not successful delivery"; without approved provider configuration, deployed verification creation refuses requests (do not relabel that as delivered).
- **Target requires:** ADR-T20 (email port, Brevo default) plus: delivery/bounce/complaint webhook consumption writing to a `message_delivery` record; suppression list; per-provider idempotency by message id stored before send (outbox) so retry after timeout cannot duplicate; separate transactional vs marketing sending domains (OPEN-26); DNS authentication check in the staging gate; no secrets in evidence. Decision L-B18-02: double-opt-in and secondary provider (OPEN-26).

### 2.4 Logging and alerting rules

- Structured JSON logs with redaction of credentials and tokens. Refused requests (4xx) logged at `info` as "API request rejected" with status and code; server faults (5xx) logged at `error` as "API request failed" with the stack. **"Alert on error-level logs: they now mean something is broken."** Every response carried `x-request-id` and error bodies carried the same id as `request_id`.
- Development outbox logs contain delivery text (codes and links) and must be treated as sensitive.
- **Target requires:** keep the 4xx/5xx level convention so error-level alerts are meaningful; ensure logs never include verification codes or tokens even in development (use a clearly marked fake-delivery sink with a test-only flag).

### 2.5 Health and worker liveness

- `/health` is liveness; `/api/v1/health` adds environment; **both exempt from the rate limiter** "so a load balancer's polling can never throttle the API into looking dead". An admin diagnostics route (platform admin only) returned storage mode, a live database round-trip, queue status and active job count, and how many routes were durable; worker liveness used a database heartbeat table. Worker wrote the heartbeat between claim cycles once ten seconds had elapsed (long batches delayed it); the API called the queue degraded if the last heartbeat was older than 45 s, missing or unavailable. "An API health liveness response alone does not establish worker processing." Also monitor overdue queued and failed/dead jobs; "health is not a delivery receipt".
- **Target requires:** separate liveness and readiness endpoints (readiness checks DB with a short timeout and, optionally, queue age); worker heartbeat decoupled from the claim loop (independent timer) so long batches cannot fake staleness; alert thresholds stated in OPS-SLO (heartbeat, queue age, dead jobs); health endpoints exempt from rate limiting.

### 2.6 Payments configuration and troubleshooting (prior attempt)

- Stripe mode required: secret key, webhook secret and at least one distinct configured price id; six optional catalog keys covering candidate pro, recruiter starter and recruiter enterprise, monthly or yearly; HTTPS application URL for return links in deployed environments; production refused test-mode keys; the server chose prices and checked role eligibility; provider price amounts/currency are external configuration and "must be reconciled with the domain catalog before release".
- Callback registered at `/api/v1/billing/stripe-webhook` for: checkout completion; subscription created/updated/deleted; invoice paid/payment_failed; charge refunded. The generic `/billing/webhook` used a different signature. Portal setup external. A checkout redirect alone is not subscription confirmation - inspect persisted subscription/events and provider logs. Watch: superseded subscriptions, webhook throttling, failed post-commit event enqueue. Disputes and voided invoices unsupported.
- **Target requires:** RB-nn for payments with these checks; a reconciliation job comparing provider price/amount/currency to the catalog; alert on webhook failure rate and on subscriptions in conflict state.

### 2.7 Common failures table (prior attempt) -> diagnostic checks to turn into runbook entries

| Symptom | Prior check | Target runbook note |
|---|---|---|
| Missing workspace export or stale behaviour | API/worker imported prebuilt output; rebuild required after source changes | Eliminate by building in the deploy pipeline; add "stale artifact" check (build id in /health) |
| Database boot failure | connection string, schema/ledger, storage mode; no automatic memory fallback | RB database incident; never silently degrade to a non-durable mode |
| Second API refuses boot | existing session writer lease | n/a (retired) |
| Sessions expire after every restart | unstable or missing signing secret | RB auth: secret custody and rotation |
| Queue degraded despite API liveness | heartbeat age, long claim batch, database reachability, retry/dead records | RB queue |
| Email route returns 503 | deployed provider configuration and enqueue; sender/delivery need separate evidence | RB provider outage |
| Checkout unavailable | billing mode, server catalog ids, secrets, account role; never supply a client-controlled price | RB payments |
| Changes made directly in SQL do not appear | restart to re-hydrate | n/a (retired); forbid direct edits |

## 3. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B18-01 | Gap check: each of nine alert classes and twelve minimum runbook topics has an ALT/RB id | SRE Lead |
| L-B18-02 | Email double opt-in, secondary provider, separate transactional/marketing domains | Messaging owner (OPEN-26) |
| L-B18-03 | Independent worker heartbeat timer and readiness endpoint design | Backend Architecture |
| L-B18-04 | Export as async signed-download job and its inclusion manifest | Privacy Engineer + Backend |


<!-- ledger-D D-06 -->
## Merged from legacy: 31_LEGACY_ARCHIVE/docs/quality/OPERATIONS.md (gap closure D-06)

Frame: nothing is implemented in this project. The prior attempt reported or required the items below; earlier merges condensed them away. They are quoted verbatim from the archived source (`L<n>` = source line number) as reference evidence about the prior attempt only. Quoted code paths, commands, hashes, counts and URLs are not facts about this project. Source file stays unchanged in the archive. Closed under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

Named by the preservation audit: sentence 'Legacy plaintext keys, if any, must be remediated explicitly' (line 182), identifier `normalizeEvent` (line 269), and the Stripe configuration/troubleshooting and common-failure tables (lines 258-end) whose rows were reworded.

~~~~text
L176: ### Account metadata and secret handling
L177: 
L178: User settings and export-request history now use existing `user_settings` and
L179: `data_export_requests` PostgreSQL tables. The BYO AI key uses AES-256-GCM with
L180: a separate `BYO_AI_KEY_ENCRYPTION_KEY` (64 hex chars); no key means storing a
L181: BYO secret is refused, not downgraded to plaintext. Rotate only with a tested
L182: re-encryption plan. Legacy plaintext keys, if any, must be remediated explicitly.
L183: Account erasure clears those tables and a defined set of in-process private
L184: maps, but other modules, shared records and backups still require the owner-
L185: approved full erasure/retention inventory.
L186: 
[...]
L258: ### Stripe configuration and troubleshooting
L259: 
L260: `BILLING_MODE=stripe` requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and
L261: at least one distinct configured `STRIPE_PRICE_*` ID. The six optional catalog
L262: keys cover candidate pro, recruiter starter and recruiter enterprise, monthly
L263: or yearly. Deployed return links require HTTPS `APP_URL`; production refuses
L264: Stripe test-mode keys. The server chooses prices and checks plan role eligibility.
L265: Provider price amounts/currency are external configuration and must be reconciled
L266: with the domain catalog before release.
L267: 
L268: Register the callback path `/api/v1/billing/stripe-webhook` for the events handled
L269: by `normalizeEvent`: checkout completion, subscription created/updated/deleted,
L270: invoice paid/payment_failed and charge refunded. The generic `/billing/webhook`
L271: uses a different signature. Portal setup is external. A checkout redirect alone
L272: is not subscription confirmation; inspect persisted subscription/events and
L273: provider logs. Watch superseded subscriptions, webhook throttling and failed
L274: post-commit event enqueue. Disputes and voided invoices remain unsupported.
L275: 
L276: ### Common local failures
L277: 
L278: | Symptom | Check |
L279: | --- | --- |
L280: | Missing workspace export or stale behavior | API/worker import existing `dist`; operator rebuild required after source changes |
L281: | Database boot failure | `DATABASE_URL`, schema/ledger and storage mode; no automatic memory fallback |
L282: | Second API refuses boot | Existing session advisory writer lease; do not launch another writer |
L283: | Sessions expire after every restart | Stable private `TOKEN_SECRET`; do not use published test keys |
L284: | Queue degraded despite API liveness | Heartbeat age, long claim batch, database reachability, retry/dead records |
L285: | Email route returns 503 | Deployed provider configuration and durable enqueue; sender/delivery require separate evidence |
L286: | Checkout unavailable | Billing mode, server catalog IDs, secrets and account role; never supply a client-controlled price |
L287: | Changes made directly in SQL do not appear | Restart/re-hydrate the API for core read-model records |
L288: 
L289: The environment schema uses `z.coerce.boolean()` for AI flags. String values are
L290: not a strict true/false parser; do not assume textual `false` disables a flag.
L291: This is a configuration discrepancy to address in an explicitly scoped code fix.
L292: The flags do not establish a connected paid model provider.
~~~~

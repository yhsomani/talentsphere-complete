# Physical Database Design, Revision 2 (DB-02 REV2)

Doc ID: DB-02-R2 · Owner: Data Architect + Backend Architecture Team · Version 2.0 · Status: Proposed (Under Review) · Date: 2026-10-25 · Closes: REVW-06 (budget and remainder), REVW-14(a) (storage part), REVW-45 · Database part of: REVW-12, REVW-19, REVW-20, REVW-25, REVW-41 · Relates: DB-02, DB-01 `CONCEPTUAL_AND_LOGICAL_MODEL.md`, BE-01-R2 `11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE_REV2.md`, SM-00-R2 `06_BUSINESS_PROCESSES/STATE_MACHINES_REV2.md`, BR-REG-R2

> **Folded into `PHYSICAL_DESIGN.md` on 2026-10-27.** Change record only; edit the original.

**Relationship (state of supersession only).** No original file was edited for this revision. Once governance accepts it, this file **supersedes** these parts of `PHYSICAL_DESIGN.md` (DB-02 v1.0): section 17 (the write-budget skeleton and its "Not resolved here" paragraph); the `idempotency_key` row of section 7 and, in DB-01, entity DATA-E2403 as the single `idempotency_key` table (replaced by the two-table form below); DB-01 entity DATA-E2408 `rate_limit_bucket` (UNLOGGED, replaced by `auth_throttle`). It **supplements** section 4 (adds the transition-edge table of section 5) and DB-01 (adds the columns, tables and CHECKs of sections 6 and 7). Everything else stands. Until accepted, DB-02 v1.0 and DB-01 remain the text of record. Governance should link this file from `12_DATA_AND_DATABASE/INDEX.md`.

All content is **[TARGET]**; DDL is illustrative and is applied through expand/contract migrations (MIGRATION_POLICY, DB-04): every change below is additive (new column, new table, `CHECK ... NOT VALID` then `VALIDATE`).

## 1. Rate-limit storage (REVW-41, REVW-06)

`rate_limit_bucket` (UNLOGGED, one upsert per request) is **removed**. Ordinary request limiting is in-process per replica and writes nothing (BE-01-R2 section 5). Only durable counters remain, in a **logged** table, written on auth-class routes only:

```sql
CREATE TABLE auth_throttle (
  scope        text        NOT NULL CHECK (scope IN ('login_account','login_ip_account','reset','challenge','token_consume','recipient_cap')),
  throttle_key bytea       NOT NULL,                 -- HMAC of the normalised key; never an email or ip in clear
  window_start timestamptz NOT NULL,
  attempts     int         NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  locked_until timestamptz NULL,
  PRIMARY KEY (scope, throttle_key, window_start)
);
```
Rules: written with `INSERT ... ON CONFLICT DO UPDATE SET attempts = auth_throttle.attempts + 1`; rows are disposable after their window plus a day and are removed by `retention.purge`; the table is logged, so a crash or failover does not reset a throttle; if a measured trigger fires (BE-01-R2 section 5) the same port is implemented on Redis and this table is retired.

## 2. Idempotency storage (REVW-14(a))

One logical store, two physical tables by retention class (CONST-S12: default 24 h, payment 7 d, queued-op routes 14 d = outbox TTL), so that a 24 h key does not occupy 14 days of storage:

```sql
CREATE TABLE idempotency_short  (LIKE idempotency_template INCLUDING ALL) PARTITION BY RANGE (expires_at);  -- daily; drop after 2 d (7 d payment routes: 8 d)
CREATE TABLE idempotency_queued (LIKE idempotency_template INCLUDING ALL) PARTITION BY RANGE (expires_at);  -- daily; drop after 15 d
-- idempotency_template columns = DATA-E2403 with these changes:
--   response_body    bytea NULL CHECK (octet_length(response_body) <= 8192)   -- was unbounded; larger responses store response_body_ref
--   response_body_ref text NULL                                               -- resource reference + hash for larger or binary responses
--   state            text  NOT NULL CHECK (state IN ('in_progress','completed')) -- 'in_progress' used only for operations with external effects
```
Write pattern: a DB-only operation inserts the **finished** row (`state = 'completed'`, status, body) inside the use-case transaction: one write, no update, no `in_progress` row. External-effect operations insert `in_progress` and complete after commit. The routing between the two tables is the route-registry flag `queuedOp`. Partition drop replaces `DELETE`; the "missing future partition" alert of section 7 covers both tables.

## 3. Outbox consumers and job coalescing (REVW-06)

`consumer_inbox` is unchanged (dedupe for every consumer, inline or job). Job-mode projection consumers are coalesced with an additive column and a partial unique index:

```sql
ALTER TABLE background_job ADD COLUMN coalesce_key text NULL;          -- 'search:evidence:<id>'; NULL for ordinary jobs
CREATE UNIQUE INDEX uq_background_job_coalesce ON background_job (kind, coalesce_key)
  WHERE coalesce_key IS NOT NULL AND status = 'queued';
-- enqueue:
INSERT INTO background_job (id, kind, payload, status, run_after, max_attempts, coalesce_key, ...)
VALUES (...) ON CONFLICT (kind, coalesce_key) WHERE coalesce_key IS NOT NULL AND status = 'queued'
DO UPDATE SET payload = jsonb_set(background_job.payload, '{upto_seq}', to_jsonb(GREATEST((background_job.payload->>'upto_seq')::bigint, $seq)));
```
Claiming flips `status` to `claimed`, which leaves the partial index, so an event that arrives while a job runs creates the next queued job (the running handler rebuilds from the owner's interface and the next job is idempotent). The existing `uq_background_job_idem (kind, idempotency_key)` still serves inline-failure fallbacks (`idempotency_key = event_id`) and cron ticks. The `background_job.status` CHECK, columns and fencing are unchanged and already equal the SM-BGJOB set (SM-00-R2 section 2.8); `max_attempts` is set per kind from the BE-01-R2 section 3.2 table.

## 4. Consent at read time (REVW-25)

`api/privacy` publishes two read-only views (the only sanctioned cross-module reads, table-ownership manifest type `published_view`): `pv_consent_current` (live, non-expired grants: subject, scope, target, grantee, field set, epoch) and `pv_consent_epoch` (account to `consent_epoch`). Search and matching join them on the **primary** in the same statement as the query. They are not materialised and not cached. `search_candidate_doc.consent_epoch` and `match_explanation.consent_epoch` remain, as rebuild and cleanup markers: a mismatch excludes the row from reads at once. `consent_current` (RLS inputs, section 6 of DB-02) is the same definition.

## 5. SQL transition rules: generated, and proven equal (REVW-45)

Problem: transition rules exist twice, in `packages/domain` and in the `SECURITY DEFINER` functions (`evidence_apply_transition`, and the same for attempt and application), with nothing tying them together.

**Decision: the SQL side contains no hand-written rules.** Two mechanisms, both mandatory:

1. **Generated edge table.** The machine-readable SM table in `packages/domain` (states, persisted flag, transitions; SM-00 vocabulary section) is compiled by `pnpm gen:sm` into a committed migration that fills:

```sql
CREATE TABLE sm_edge (
  machine      text NOT NULL,            -- 'SM-EVIDENCE'
  from_state   text NOT NULL,
  event        text NOT NULL,            -- 't3'
  to_state     text NOT NULL,
  requires_human boolean NOT NULL,       -- SM-00 U6
  PRIMARY KEY (machine, from_state, event)
);
CREATE TABLE sm_terminal (machine text NOT NULL, state text NOT NULL, PRIMARY KEY (machine, state));
```
`sm_edge` and `sm_terminal` are owned by `ts_migrator`, read-only for `ts_app`; the migration carries the SHA-256 of the source table, and CI fails when the committed hash differs from a fresh generation. Each transition function is generated from one template and only does what SQL must do for data integrity: verify `(machine, from_state, event, to_state)` exists in `sm_edge`, reject any change when the old state is in `sm_terminal`, check `version`, check `requires_human` against `app.actor_kind`, apply the protected column write, append the history row. Guards that need business data (entitlement, consent, independence checks, rung recompute) stay in `packages/domain` and run before the call.

2. **Parity test (`TEST` class integration, runs under `pnpm test:pg`).** For every machine that has a transition function, the test enumerates the full Cartesian product (state × event). For each pair it prepares a throwaway row in that state, calls the domain function and the SQL function, and asserts the same accept/reject outcome and the same target state; it also asserts that every persisted state appears in `sm_edge` or `sm_terminal`. A change to either side without the other fails CI. The same test supplies the SM-00 obligation "one test per forbidden pair expecting `409 state-transition-invalid`".

Functions generated at launch: evidence, attempt, application (as DB-02 section 4), plus `organization.verification_state`, `credential.state`, `first_contact_request.state`, `support_access_grant.state` and `verification_dispute.state`, whose protected columns need the same column-privilege guard (INV-T04, INV-T11). **FF-11 amendment wording** is in BE-01-R2 section 9.

## 6. Issuer class on the authority rung (REVW-12, database part)

```sql
ALTER TABLE evidence_attestation
  ADD COLUMN issuer_class text NULL CHECK (issuer_class IN ('platform','institution','employer_org','instructor')),
  ADD COLUMN issuer_ref uuid NULL,                       -- institution / employer org / instructor account; NULL for platform
  ADD COLUMN independence_result text NULL CHECK (independence_result IN ('passed','failed')),
  ADD COLUMN independence_checked_at timestamptz NULL,
  ADD COLUMN domain_binding text NULL CHECK (domain_binding IN ('bound','unbound'));   -- SM-VERIFICATION, REVW-22
ALTER TABLE evidence_attestation DROP CONSTRAINT evidence_attestation_method_check,
  ADD CONSTRAINT evidence_attestation_method_check CHECK (method IN
    ('artifact_scan','employer_email','reference','institution_issuer','assessment_runner','manual_review','instructor_signoff'));
ALTER TABLE evidence_attestation ADD CONSTRAINT ck_authority_has_issuer
  CHECK (rung <> 'authority_verified' OR issuer_class IS NOT NULL);
ALTER TABLE evidence_attestation ADD CONSTRAINT ck_issuer_class_by_method CHECK (
     (method IN ('assessment_runner','manual_review') AND (issuer_class = 'platform' OR issuer_class IS NULL))
  OR (method = 'institution_issuer' AND issuer_class = 'institution')
  OR (method = 'employer_email'     AND (issuer_class = 'employer_org' OR rung <> 'authority_verified'))
  OR (method = 'instructor_signoff' AND issuer_class = 'instructor')
  OR (method IN ('artifact_scan','reference') AND issuer_class IS NULL));
ALTER TABLE evidence_attestation ADD CONSTRAINT ck_platform_issuer_ref CHECK (issuer_class <> 'platform' OR issuer_ref IS NULL);
ALTER TABLE evidence_attestation ADD CONSTRAINT ck_instructor_independent
  CHECK (issuer_class <> 'instructor' OR independence_result = 'passed');
ALTER TABLE evidence_item ADD COLUMN top_issuer_class text NULL CHECK (top_issuer_class IN ('platform','institution','employer_org','instructor'));
ALTER TABLE credential ADD COLUMN issuer_class text NULL CHECK (issuer_class IN ('platform','institution','employer_org','instructor'));
-- backfill credential.issuer_class from issuer_kind (platform->platform, institution->institution, external->employer_org|instructor by issuer record), then SET NOT NULL, then drop issuer_kind in the contract phase
```
Rules: `issuer_class`, `issuer_ref` and `independence_*` are written only by `evidence_apply_transition` (column privileges, section 4 of DB-02; `ts_app` has no UPDATE on them); `evidence_item.top_issuer_class` is a denormalised read value of the highest valid `authority_verified` attestation, written in the same function as `rung` (INV-T04); the function rejects an `instructor` record when the issuer's `subject_ref` equals the owner's, or when a shared account, device or payment signal exists (INV-T47), and records `independence_result`. The `competency` and matching weights read `top_issuer_class`; instructor-issued records are revocable like any record (SM-EVIDENCE t8).

## 7. Columns, tables and CHECKs for the new and amended machines (REVW-20)

SM-00-R2 section 4 lists what the data owner must mirror; this is that change set. Column names follow DB-01. The enum-vs-SM manifest (FF-11) gains one line per row.

| Machine | Change | CHECK (persisted set from SM-00-R2) |
|---|---|---|
| SM-ORG status | none | `organization.status IN ('active','suspended','closed')` |
| SM-ORG verification | `ALTER TABLE organization ADD COLUMN verification_state text NOT NULL DEFAULT 'unverified'`; `verified_at` becomes derived (set by the transition function when state becomes `verified`, NULL otherwise); backfill: `verified_at IS NOT NULL` becomes `verified` | `verification_state IN ('unverified','pending','verified','rejected','revoked')` |
| SM-CREDENTIAL | `ALTER TABLE credential ADD COLUMN state text NOT NULL DEFAULT 'issued'`; `issuer_class` as section 6 | `state IN ('issued','suspended','revoked','expired')` |
| SM-DISPUTE | `verification_dispute.state` CHECK gains `withdrawn` (add constraint `NOT VALID`, validate, drop old) | `state IN ('open','under_review','upheld','dismissed','withdrawn')` |
| SM-WORKCLAIM | none | `work_claim.state IN ('draft','submitted','disputed','withdrawn')` |
| SM-COURSE | none | `course.state IN ('draft','in_review','published','unpublished','taken_down')` |
| SM-FILE | none (set confirmed) | `file_object.state IN ('intent','uploaded','verifying','scanning','clean','rejected','infected','deleted')` |
| SM-SUPPORTGRANT | `ALTER TABLE support_access_grant ADD COLUMN state text NOT NULL DEFAULT 'active'`; `approved_by uuid NULL`; CHECK `approved_by IS NULL OR approved_by <> requested_by` | `state IN ('pending_approval','active','expired','revoked','rejected')`; `expires_at <= created_at + interval '4 hours'` (BR-T041) |
| SM-EXPORT | none | `data_export.state`, `resume_export.state IN ('requested','building','ready','expired','failed')` |
| SM-FIRSTCONTACT | **new table** `first_contact_request` (below); block rows in `account_block` (BR-T083) | `state IN ('pending','accepted','declined','expired','withdrawn')` |
| SM-BGJOB | none | `background_job.status IN ('queued','claimed','running','retry_wait','succeeded','dead','cancelled')` (already) |

```sql
CREATE TABLE first_contact_request (
  id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  version bigint NOT NULL DEFAULT 1,
  org_id uuid NOT NULL REFERENCES organization(id), sender_account_id uuid NOT NULL REFERENCES account(id),
  candidate_account_id uuid NOT NULL REFERENCES account(id), job_id uuid NULL REFERENCES job(id),
  note_ref uuid NULL,                              -- message text lives in an erasable table, not here
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','accepted','declined','expired','withdrawn')),
  expires_at timestamptz NOT NULL,                 -- created_at + 14 days (SM-FIRSTCONTACT t4)
  answered_at timestamptz NULL, conversation_id uuid NULL REFERENCES conversation(id),
  CHECK (state <> 'accepted' OR conversation_id IS NOT NULL)
);
CREATE UNIQUE INDEX uq_first_contact_pending ON first_contact_request (org_id, candidate_account_id) WHERE state = 'pending';
CREATE TABLE account_block (blocker_account_id uuid NOT NULL REFERENCES account(id), blocked_account_id uuid NOT NULL REFERENCES account(id),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (blocker_account_id, blocked_account_id));
```
Further columns named in SM-00-R2 section 4: `application.reapplied_from uuid NULL REFERENCES application(id)` and `application.withdrawn_at timestamptz NULL`; `account.min_age_attested_at timestamptz NULL` (BR-T120) with `CHECK (status <> 'active' OR min_age_attested_at IS NOT NULL) NOT VALID` then `VALIDATE` after backfill (INV-T50; the `account` status column is named per DB-01); `reference_request.reminder_count int NOT NULL DEFAULT 0 CHECK (reminder_count BETWEEN 0 AND 2)` (BR-T121); `conversation.state` stays `open/closed/blocked` (it is a conversation flag, not the first-contact machine). The unique index `uq_application_active` keeps its predicate over active states, so a withdrawn application no longer blocks a new one (BR-T125 closes OPEN-B20); the 24 h cooldown is a domain guard, not an index.

**Message id for offline-safe sends.** The send route `PUT /conversations/{c}/messages/{messageId}` (APIC-02) takes a client-generated UUIDv7 as `message.id`; `message.client_msg_id` remains the dedupe column for messages created by `POST`, and for a `PUT` it equals the id. `UQ(conversation, sender, client_msg_id)` is unchanged.

## 8. Partitioning table (replaces the `idempotency_key` row)

| Table | Partitioning | Retention | Notes |
|---|---|---|---|
| `idempotency_short` | RANGE daily on `expires_at` | drop partitions older than 2 d (8 d for the 7-day payment class) | CONST-S12 |
| `idempotency_queued` | RANGE daily on `expires_at` | drop partitions older than 15 d | outbox TTL 14 d plus margin |
| `auth_throttle` | none | `retention.purge` removes rows whose window ended a day ago | small, attacker-bound |

A missing future partition on either idempotency table is a paging alert (inserts would fail).

## 9. Write budget per P0 use case (replaces DB-02 section 17; resolves the budget part of REVW-06)

Purpose: tie SLO class C3 (400 ms p95 write, OPS-SLO section 5) to what a mutating transaction writes and locks. **Counts are design-derived from the REV2 design and are not measurements**; the measured columns are filled under WP-LOADBASE (TEST-PER-010).

**Standard overhead of an unsafe request in REV2:** idempotency 1 insert for a Key route and 0 for a natural-key or `none` route (BE-01-R2 section 4, was 2); rate limiting **0** rows (was 1), except 1 `auth_throttle` upsert on auth-class routes; audit 1 insert (lock-free, DB-02 section 4.2) for audited actions only; outbox at least 1. Post-commit work (outside the request transaction): inline consumers write their own state plus one `consumer_inbox` row and **no job row**; job-mode projections write at most one coalesced job row per aggregate burst (BE-01-R2 section 1).

| UC | Use case (API class) | State rows | History rows | Outbox | Idem | Rate-limit | Audit | **Rows in request tx** | Row locks held | Global / shared locks | Post-commit: inline (state + inbox) | Post-commit: job rows |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| UC-01 | Register account (C4) | 3 (account, subject_identity_map, session) | 0 | 1 | 1 | 1 (`auth_throttle`) | 1 | **7** | none (unique indexes on email, handle) | 0 | notify delivery row + inbox | 1 (`email.send`) |
| UC-02a | Sign in (C4) | 2 (session family, refresh token) | 0 | 1 | 0 | 1 | 1 | **5** | none | 0 | notify (new-device notice) | 1 (`email.send`, only on a new device) |
| UC-02b | Refresh rotation (C4) | 2 (replace token) | 0 | 0 | 0 | 0 | 0 (audited on reuse only) | **2** | `session` row | 0 | 0 | 0 |
| UC-03 | Create evidence item (C3) | 1 + k artifacts | 1 | 1 | 1 | 0 | 1 | **5 + k** | none (new aggregate) | 0 | analytics counter | up to 2 (search.index, skill confidence; coalesced) |
| UC-04a | Referee response (token, C3) | 3 (reference_request, evidence_attestation, evidence_item) | 1 | 1 | 1 | 1 (`auth_throttle`, RL-TOKEN) | 1 | **8** | `evidence_item`, `reference_request` (guarded UPDATE) | 0 | notify | up to 3 (search, skills, match; coalesced) + 1 `email.send` |
| UC-04b | Attestation revoke by issuer (C3) | 2 | 1 | 1 | 1 | 0 | 1 | **6** | `evidence_item` | 0 | notify | up to 3 coalesced |
| UC-05 | Apply to job (C3) | 3 + k (application, consent snapshot, draft delete, application_evidence) | 1 | 1 | 1 (key required) | 0 | 1 | **7 + k** | none (partial unique index `uq_application_active`) | 0 | notify (2 delivery rows), analytics counter | up to 2 (`email.send`) |
| UC-06 | Application stage transition (C3) | 1 | 1 | 1 | 1 | 0 | 1 | **5** | `application` row | 0 | notify, analytics counter | up to 1 (`email.send`) |
| UC-07 | Consent change (C3) | 1 (`account.consent_epoch`) | 1 | 1 | 0 (natural PUT) | 0 | 1 | **4** | `account` row | 0 | search-doc removal (1 delete), notify | up to 1 (match.recompute; coalesced) |
| UC-08 | Publish job (C3) | 2 (job, organization slot counter) | 0 | 1 | 1 | 0 | 1 | **5** | `organization` row (slot reservation, per org) | 0 | notify | up to 2 (search.index; saved-search alert fan-out as one batching job) |
| UC-09 | Send message by id (C3) | 2 (message, conversation) | 0 | 1 | 0 (natural PUT) | 0 | 0 | **3** | `conversation` row (hot on busy threads: `last_message_at`) | 0 | notify (in-app) | 0 |
| UC-10 | Erasure step per module (worker) | n (module deletes) | 0 (never touches history, section 4.1) | 1 | 0 | 0 | 1 | **n + 2** | per-subject rows only | 0 | 0 | 0 |

Budget (design ceilings, replaced by measured values at WP-LOADBASE exit):

| Item | Ceiling [TARGET allocation] |
|---|---|
| Global / shared locks in any request-path use case | **0** (any non-zero blocks WP-DB-BASE exit; the month-wide audit lock is gone, section 4.2 of DB-02) |
| Rows written per request transaction | at most the **Rows in request tx** column plus 2; a PR adding a write or lock to a P0 use case updates this table |
| Statements per request transaction | at most 12 |
| Database time of a C3 write | at most 150 ms of the 400 ms p95 target, leaving the rest for validation, network and serialisation; to be confirmed or changed by measurement |
| Lock wait p95 on a row lock | at most 20 ms |
| Hot rows | UC-09 `conversation.last_message_at`: if lock wait exceeds the ceiling, update it through a coalesced 1 s write instead of per message |

Remaining single writer by design: the `audit.anchor` job (off the request path, DB-02 section 4.2). Request-path overhead fell from 4 fixed rows (idempotency 2, rate limit 1, audit 1) plus 1 + N job rows per event to 1 to 3 fixed rows plus at most one coalesced job row per aggregate burst.

## 10. Open items

| ID | Item |
|---|---|
| OPEN-B58 | Measured fill of section 9 and calibration of its ceilings (WP-LOADBASE, TEST-PER-010) |
| OPEN-B59 | Whether `top_issuer_class` stays a denormalised column or becomes a view; decided by the first matching-weight query plan |
| DATA ids | Proposed new entity ids for governance to assign: `auth_throttle`, `idempotency_short`/`idempotency_queued` (replacing DATA-E2403), `sm_edge`/`sm_terminal`, `first_contact_request`, `account_block` |

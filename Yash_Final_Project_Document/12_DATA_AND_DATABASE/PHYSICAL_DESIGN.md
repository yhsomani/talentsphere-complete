# Physical Database Design (Target)

Doc ID: DB-02 · Owner: Database Architecture (DBA) · Version 1.0 · Status: Under Review · Relates: ADR-T05, ADR-T09, ADR-T11, ADR-T21, INV-T03, INV-T04, INV-T10..T12, FF-02, FF-05, FF-10 · Companions: DB-01 `CONCEPTUAL_AND_LOGICAL_MODEL.md`, DB-03, DB-04, BE-01

Tags: **[TARGET]** decision · **[OPEN]** open · **[REF]** reference observation. The target is **plain PostgreSQL** (managed service vendor OPEN-B19); nothing here depends on Supabase Auth/PostgREST. No SQL below has been executed against any database; snippets are design illustrations. Numbers are starting values with rationale, not benchmarks.

## 1. Keys and identifiers
| Topic | Decision | Rationale |
|---|---|---|
| Primary keys | `uuid` UUIDv7, generated in the application (`packages/ids`) before insert | Time-ordered values keep B-tree inserts append-mostly (less page splitting than random v4); client-independent; ids can be created before the row (outbox, idempotent retries). PostgreSQL 18+ offers native `uuidv7()`; adopt as column default when the platform version allows (OPEN-B9) |
| Exposure | Ids are not secrets. Authorisation never relies on id unguessability (INV-T02). Time-ordering leaks creation time: accepted; where creation time is sensitive (credentials, referee/verification tokens) a separate random value is used | |
| Public codes | `credential.public_code`, tokens: >=128-bit CSPRNG, base32/base64url, UNIQUE; tokens stored as SHA-256 hash (high entropy -> fast hash is sufficient); short numeric codes (email challenge) stored as `HMAC(server_key, code)` with attempt limits | INV-T05 |
| Natural keys | Only composite PKs on pure join/projection tables (`evidence_skill`, `consumer_inbox`, `competency`) | |
| Business ordinals | `aggregate_seq`, `evidence_event.seq`: per-aggregate counters assigned under the aggregate's row lock; never global sequences | no hot sequence |
| Collation | `C`-like deterministic collation for keys/indexes; `citext` for emails/handles/slugs; ICU collation only in display sorting at query time | stable uniqueness semantics |

## 2. Referential integrity and naming
| Rule | Detail |
|---|---|
| Default `ON DELETE` | `RESTRICT` (no accidental cascades). `CASCADE` only for pure children owned by one aggregate and never relied on for erasure (e.g. `attempt_answer -> attempt`, `lesson_progress -> enrollment`). `SET NULL` only for optional back-references (e.g. `profile.avatar_file_id`) |
| Circular references | `application.consent_snapshot_id -> application_consent_snapshot` and the snapshot's `job_id` are created in one transaction; the FK is `DEFERRABLE INITIALLY DEFERRED` |
| Cross-module FKs | Permitted for integrity but recorded in the **table-ownership manifest** (`module -> tables`, `FK edges across modules`); CI lint fails on an undeclared cross-module FK or a cross-module read in repositories (FF-02) |
| Names | `pk_<table>`, `fk_<table>_<col>`, `uq_<table>_<cols>`, `ix_<table>_<cols>`, `ck_<table>_<rule>`, policies `rls_<table>_<role>_<op>`; snake_case; tables singular; time columns `*_at`; hashes `*_hash`; encrypted `*_enc`; derived tables suffixed `_doc`/`_snapshot` or documented `derived` |
| Every FK column | Indexed unless the table is tiny or the column is the leading PK column (justified in the migration note) |

## 3. Index design
Principle: an index exists because a documented query needs it; each migration that adds one names the query. `CREATE INDEX CONCURRENTLY` only (DB-04). Review monthly using `pg_stat_statements` and unused-index statistics; drop via contract migration.

### 3.1 Partial unique indexes (business rules enforced by the database)
```sql
-- BR-T001: one active application per (candidate, job). Terminal states free the slot (re-apply after rejection/withdrawal is [OPEN-B20]).
-- Terminal set = SM-APPLICATION terminals; `draft` is not in application.state (application_draft has UQ(account, job)); submit checks both.
CREATE UNIQUE INDEX CONCURRENTLY uq_application_active
  ON application (candidate_account_id, job_id)
  WHERE state NOT IN ('rejected','withdrawn','hired','offer_declined');

-- one in-flight verification request per (evidence, method)
CREATE UNIQUE INDEX CONCURRENTLY uq_verification_open
  ON verification_request (evidence_id, method)
  WHERE state IN ('created','awaiting_proof');

-- one pending reference request per (work claim, referee) -> anti-spam toward third parties
CREATE UNIQUE INDEX CONCURRENTLY uq_reference_pending
  ON reference_request (work_claim_id, referee_email_hash)
  WHERE state IN ('queued','sent','opened');

-- one valid attestation per (evidence, method)
CREATE UNIQUE INDEX CONCURRENTLY uq_attestation_valid
  ON evidence_attestation (evidence_id, method)
  WHERE status = 'valid';

-- one live membership per (account, tenant)
CREATE UNIQUE INDEX CONCURRENTLY uq_membership_org  ON membership (account_id, org_id)         WHERE org_id IS NOT NULL         AND status <> 'removed';
CREATE UNIQUE INDEX CONCURRENTLY uq_membership_inst ON membership (account_id, institution_id) WHERE institution_id IS NOT NULL AND status <> 'removed';
ALTER TABLE membership ADD CONSTRAINT ck_membership_one_tenant CHECK ((org_id IS NULL) <> (institution_id IS NULL));

-- at least one owner per org is enforced in the application under an org-row lock (a unique index cannot express "last owner")

-- idempotent job enqueue and consumer dedupe
CREATE UNIQUE INDEX uq_background_job_idem ON background_job (kind, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- one pending erasure per account
CREATE UNIQUE INDEX uq_erasure_open ON data_rights_request (account_id) WHERE kind='erasure' AND state NOT IN ('completed','completed_with_retention','rejected','cancelled');

-- one non-expired draft per (account, job)
ALTER TABLE application_draft ADD CONSTRAINT uq_application_draft UNIQUE (account_id, job_id);
```

### 3.2 Access-path indexes (selected; authoritative list lives with each module's migrations)
| Table | Index | Serves |
|---|---|---|
| `account` | `UNIQUE (email)` (citext) | login lookup |
| `session` | `UNIQUE (refresh_token_hash)`; `(family_id)`; `(account_id, revoked_at)` partial `WHERE revoked_at IS NULL` | refresh, family revoke, session list |
| `evidence_item` | `(owner_account_id, created_at DESC, id DESC)`; `(owner_account_id, rung) WHERE lifecycle='active'` | own list, rung filters |
| `evidence_attestation` | `(evidence_id) WHERE status='valid'`; `(expires_at) WHERE status='valid' AND expires_at IS NOT NULL` | rung recompute, expiry sweep |
| `reference_request` | `(expires_at) WHERE state IN ('sent','opened')`; `UNIQUE (token_hash)` | BR-T004 sweep, token lookup |
| `job` | `(state, published_at DESC, id DESC) WHERE state='published'`; `(org_id, state, created_at DESC)` | public feed, org list |
| `application` | `(org_id, job_id, state, submitted_at DESC, id DESC)`; `(candidate_account_id, submitted_at DESC)` | pipeline, own list |
| `stage_transition` | `(application_id, created_at)` | timeline |
| `message` | `(conversation_id, id DESC)`; `UNIQUE (conversation_id, sender_account_id, client_msg_id)` | thread paging, offline dedupe |
| `notification` | `(account_id, id DESC) WHERE read_at IS NULL`; `UNIQUE (account_id, dedupe_key)` | unread badge, dedupe |
| `consent_record` | `(subject_ref, scope, target_type, target_id, grantee_type, grantee_id, created_at DESC)` (subject_ref, not account id: §4.1) | `consent_current` DISTINCT ON the same six key columns, keeping rows where `granted AND (expires_at IS NULL OR expires_at > now())` (CSC section 5); the view maps back to `subject_account_id` through `subject_identity_map` |
| `outbox_event` | `(available_at, id) WHERE published_at IS NULL` | dispatcher scan |
| `background_job` | `(priority DESC, run_after) WHERE status IN ('queued','retry_wait')`; `(lease_expires_at) WHERE status IN ('claimed','running')`; `(kind, status)` | claim, reaper, admin views |
| `idempotency_key` | PK `(principal_id, idem_key)` | reserve/replay |
| `audit_event` | per partition: `(tenant_org_id, occurred_at DESC)`, `(actor_account_id, occurred_at DESC)`; `BRIN (occurred_at)` | admin queries, subject access log |
| `file_object` | `(owner_account_id, created_at DESC)`; `(state, created_at) WHERE state IN ('uploaded','verifying','scanning')` | own files, scan backlog |
| `search_job_doc` | `GIN (tsv)`; `GIN (title gin_trgm_ops)`; `HNSW (embedding vector_cosine_ops)` | FTS, fuzzy, semantic (ADR-T11) |
| `search_candidate_doc` | same trio + `(consent_epoch)` | recruiter search |
| `match_explanation` | PK `(job_id, account_id)`; `(account_id, score DESC)` | per-candidate recommendations |
| `webhook_delivery` | `(next_attempt_at) WHERE state='pending'` | delivery scheduler |

`INCLUDE` columns are used only to make hot list queries index-only (e.g. job feed). Vector index parameters (`m`, `ef_construction`) are set from recall/latency tests on a realistic corpus, not guessed (OPEN-B21).

## 4. Constraints, privileges and triggers
| Mechanism | Policy |
|---|---|
| NOT NULL / CHECK | Default NOT NULL; enumerations as `CHECK (col IN (...))`; length caps on every free-text column; date order checks; money non-negative |
| Column-level privileges (INV-T04) | `ts_app` is granted `UPDATE` only on non-protected columns of `evidence_item`; `rung`, `lifecycle`, `revoked_*` are updated only through the `SECURITY DEFINER` function `evidence_apply_transition(...)` owned by the migrator role, which the `evidence` module calls. A compromised handler therefore cannot set `rung='authority_verified'` with a plain `UPDATE`. Similar guard on `attempt.passed/verification_basis` and `application.state` (state set via transition function) |
| Append-only tables | `audit_event`, `consent_record`, `evidence_event`, `stage_transition`, `outbox_event` (except `published_at`), `integrity_signal`: `REVOKE UPDATE, DELETE` from app roles plus a `BEFORE UPDATE OR DELETE` trigger raising an exception (retention purge uses partition drop, or the whole-aggregate purge function of §4.2, by the migrator/retention role). **There is no erasure exemption**: erasure never updates or deletes these tables, because they hold no direct identifier (§4.1). Satisfies INV-T11 for history |
| Terminal-state immutability | `BEFORE UPDATE` trigger on `application`, `evidence_item` (terminal lifecycle: `revoked`, `withdrawn`, `expired`, `erased`), `verification_request` rejects changes when the old row is terminal (terminal sets per SM-00), except the erasure function (this exemption applies to these mutable aggregates only, never to the append-only tables above) |
| Triggers otherwise | Avoided for business logic (kept in `packages/domain`). Allowed: immutability guards, `updated_at/version` maintenance is done in SQL by repositories, not triggers |
| Integrity anchoring (replaces the inline chain, REVW-06) | Each history row carries `row_hash = SHA256(canonical(row))` computed in the application with **no lock and no read of a previous row**; aggregate histories also carry a per-aggregate `prev_hash` taken under the aggregate lock the use case already holds. A single off-path `audit.anchor` job seals closed windows into KMS-signed Merkle batches (`audit_anchor`); a verifier job re-checks them daily. Tamper evidence, not tamper proof (SEC-02). Detail in §4.2 |
| Encrypted columns | `*_enc` hold AES-256-GCM envelopes (key id + nonce + ciphertext) produced in the application; blind-index `*_hash` = HMAC(index key, normalised value). Keys in KMS (SEC-02). The database never sees keys |

### 4.1 Subject references: history never holds identifiers (resolves REVW-04)
Problem solved: erasure used to mean "pseudonymise identifiers in audit, consent and transition history". That is an UPDATE, which the append-only guard blocks and which would invalidate every later hash. Mechanism chosen: **history is never rewritten because it never contains an identifier.**

| Element | Decision |
|---|---|
| `subject_ref` | A random 128-bit opaque token (CSPRNG; not derived from account id, email or any key, so it cannot be recomputed), minted with the account. It is the only way a person appears in `audit_event`, `consent_record`, `evidence_event`, `stage_transition`, `outbox_event` payloads and `integrity_signal` |
| `subject_identity_map` (DATA-E2208) | The **only** table linking `subject_ref` to `account.id`; owner `api/privacy`; `ts_app` can SELECT/INSERT, only the erasure function can DELETE. `account` itself carries no `subject_ref` column, so a tombstoned account row cannot re-link to history |
| Erasure | Delete the map row. Hash chains and anchors stay valid because no history row is touched. Optional hardening **[TARGET]**: a per-subject data key (KMS-wrapped, stored in the map row) is used to HMAC subject-linkable values in history (e.g. `consent_record.ip_hash`); erasure deletes the wrapped key and schedules KMS key destruction (crypto-shredding), so even those values become unlinkable |
| Columns | `audit_event.actor_subject_ref`, `audit_event.subject_ref` (the person the event concerns); `consent_record.subject_ref`; `stage_transition.actor_subject_ref`; `evidence_event.actor_ref` (a `subject_ref`, or a random `referee_ref` minted per reference request for non-account actors); `outbox_event` payload `subject_ref`. If `resource_type='account'` then `resource_id` is NULL (CHECK) and `subject_ref` carries the person |
| Resolution | Repositories look up `subject_ref` by `account_id` (PK/unique lookup, immutable, cached per request). Consumers resolve ref to account through the map; no mapping means "subject erased": skip the work or render "Deleted user" |
| `consent_current` | The view joins the map and exposes `subject_account_id`, so RLS policies in §6 are unchanged; after erasure the rows join to nothing |
| Foreign keys | History tables hold **no FK** to `account`, `subject_identity_map` or erasable aggregates (a declared exception to §2, recorded in the table-ownership manifest as a "soft ref"). Deleting an erasable aggregate (e.g. `evidence_item`) therefore never blocks on history rows |
| Content allowlist | `details`, `payload`, `reason_code` and similar columns in history tables are validated against a registered schema of allowlisted keys and enum values; no user-entered strings, names, emails or free text. Narrative lives in erasable tables (e.g. `stage_transition.note` becomes `note_ref` to `application_note`) |
| Surviving rows | After erasure, history rows of the subject remain as unlinkable skeletons (timestamps, action ids, state names, tenant ids) and leave through ordinary retention (§4.2, §7). Whether skeletons count as anonymous data, whether truncated `ip_prefix` is personal data, and the retention length are **[OPEN-08]** |
| Backups | Backups still contain the map row until they age out. `erasure_ledger` stores `erased_subject_ref` only (never `account.id`, never both), so a restore replay deletes the restored map row without re-creating a durable link (DB-03 §5.6) |
| Post-erasure sweep (INV-T38) | Searches for account id, email, email hash, artefact hashes and referee contact data; **excludes** `subject_ref` and `referee_ref` values from the hit terms; additionally asserts that no `subject_identity_map` row or wrapped key exists for the subject. Allowlisted survivors: the tombstoned `account` row and the ledger row |

### 4.2 Integrity anchoring: batches instead of a lock (resolves the audit-lock part of REVW-06)
Problem solved: a per-partition advisory lock inside the business transaction made every mutating request serialise on one month-wide lock at commit.

| Element | Design **[TARGET, parameters calibrated in WP-LOADBASE]** |
|---|---|
| Row hash | `row_hash = SHA256(canonical(row))`, computed by the application before INSERT. No `prev_hash` read for `audit_event`, so inserts take no lock and never wait on each other |
| Per-aggregate chain | `evidence_event` (per `evidence_id`), `stage_transition` (per `application_id`), `consent_record` (per `subject_ref`) also store `prev_hash` = previous row hash of the same aggregate. The use case already holds that aggregate's row lock (§8), so no new lock is introduced |
| Window | A window is an id range (UUIDv7 order) of one source table. It may be sealed only after every transaction that could still insert into it has finished (`pg_snapshot_xmin` has passed the window end, plus a safety lag of 2 minutes) |
| Anchor job | `audit.anchor`: one runner at a time (lease, `UNIQUE (kind, idempotency_key = slot)`), outside any request transaction, every 5 minutes. For each of `audit_event`, `consent_record`, `evidence_event`, `stage_transition` it builds a Merkle tree over the window's `row_hash` leaves and inserts one `audit_anchor` row (DATA-E2004) with `merkle_root`, `row_count`, id range, `prev_anchor_root` (chain across anchors; single writer, so no contention) and a KMS asymmetric signature over the canonical anchor. `audit_anchor` is append-only |
| External copy | Anchors (root + signature only, no personal data) are exported at least daily to a write-once (object-lock) archive so a database administrator cannot rewrite rows and anchors together |
| Verifier | Daily: recompute row hashes, aggregate chains, Merkle roots, anchor chain and signatures; compare with the archive. Findings: modified row, removed row, row inside a sealed window that the anchor does not cover (late insert), truncated tail, missing anchor. Any finding is a Sev-2 integrity incident |
| Exposure window | Rows are unanchored for up to about 7 minutes; tamper evidence starts at sealing, not at insert. Tamper evidence, not tamper proof (SEC-02) |
| Retention | Partitioned tables leave by partition drop; `consent_record`, `evidence_event` and `stage_transition` leave only through a whole-aggregate purge function (never row-level inside a chain) that writes a receipt event. Anchors are kept after purge (hashes only, append-only); the purge receipt event tells the verifier which ranges are intentionally absent |
| Key rotation | The signing key id is stored per anchor; old public keys stay available to the verifier |


| Role | Purpose | Notes |
|---|---|---|
| `ts_migrator` | Owner; DDL; runs migrations; owns `SECURITY DEFINER` functions | No application connection; short-lived credentials via CI |
| `ts_app` | API runtime | DML via grants per module's tables; **no `BYPASSRLS`**; `FORCE ROW LEVEL SECURITY` on all personal/tenant tables so even the owner path is policed; default `statement_timeout=5s`, `idle_in_transaction_session_timeout=10s` |
| `ts_worker` | Worker runtime | Grants on job/outbox/inbox plus module tables needed by consumers; policies require `app.tenant_org()` match for tenant tables when processing tenant-scoped events (INV-T03 holds for background work); `statement_timeout=60s` |
| `ts_readonly` | Analytics/replica reporting | SELECT on derived/rollup tables and masked views only; no personal-data tables |
| `ts_breakglass` | Emergency access | No standing credentials; issued by two-person approval; every session logged (INV-T18) |

Per transaction the app layer runs:
```sql
SELECT set_config('app.account_id', $1, true),      -- uuid or ''
       set_config('app.org_ids',    $2, true),      -- '{uuid,...}' orgs where member
       set_config('app.org_roles',  $3, true),      -- jsonb {orgId:[roles]}
       set_config('app.inst_ids',   $4, true),
       set_config('app.platform_roles', $5, true),  -- '{moderator,...}'
       set_config('app.support_grant', $6, true),   -- grant id or ''
       set_config('app.actor_kind', $7, true);      -- user|service|system|referee
```
`set_config(..., true)` is transaction-local, therefore safe behind PgBouncer in transaction-pooling mode (no session state, no `SET` without `LOCAL`). Helper functions `app.account_id()`, `app.org_ids()`, `app.has_org_role(org uuid, roles text[])` are `STABLE`; policies reference them as `(SELECT app.account_id())` so the planner evaluates once per statement.

## 6. Row-level security patterns (ADR-T05 defence in depth; INV-T03; FF-05)
RLS is **not** the primary authorisation (that is `packages/policy` in the application). It is the net that catches a missed check or SQL bug. All policies are `PERMISSIVE` per role with explicit `USING`/`WITH CHECK`; tables with RLS but no matching policy deny by default.

```sql
ALTER TABLE evidence_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_item FORCE  ROW LEVEL SECURITY;

-- P1 owner
CREATE POLICY rls_evidence_item_owner ON evidence_item FOR ALL TO ts_app
  USING      (owner_account_id = (SELECT app.account_id()))
  WITH CHECK (owner_account_id = (SELECT app.account_id()));

-- P5 consent-gated cross-user read: only via an application the candidate submitted, with live consent
CREATE POLICY rls_evidence_item_shared ON evidence_item FOR SELECT TO ts_app
  USING (EXISTS (
    SELECT 1
    FROM application_evidence ae
    JOIN application a ON a.id = ae.application_id
    WHERE ae.evidence_id = evidence_item.id
      AND a.org_id = ANY ((SELECT app.org_ids()))
      AND (SELECT app.has_org_role(a.org_id, ARRAY['recruiter','hiring_manager','org_admin','org_owner']))
      AND EXISTS (SELECT 1 FROM consent_current c
                  WHERE c.subject_account_id = evidence_item.owner_account_id
                    AND c.scope = 'application.share_snapshot' AND c.granted
                    AND c.target_type = 'application' AND c.target_id = a.id
                    AND c.grantee_type = 'org' AND c.grantee_id = a.org_id)));

-- P5b consent-gated read by a granted employer outside an application (per-employer, optionally per-artefact grant)
CREATE POLICY rls_evidence_item_granted ON evidence_item FOR SELECT TO ts_app
  USING (EXISTS (SELECT 1 FROM consent_current c
                 WHERE c.subject_account_id = evidence_item.owner_account_id
                   AND c.scope = 'evidence.share_artefact' AND c.granted
                   AND c.grantee_type = 'org' AND c.grantee_id = ANY ((SELECT app.org_ids()))
                   AND (SELECT app.has_org_role(c.grantee_id, ARRAY['recruiter','hiring_manager','org_admin','org_owner']))
                   AND (c.target_id IS NULL OR c.target_id = evidence_item.id)));

-- P6 support access: live grant, scoped
CREATE POLICY rls_evidence_item_support ON evidence_item FOR SELECT TO ts_app
  USING (EXISTS (SELECT 1 FROM support_access_grant g
                 WHERE g.id = NULLIF((SELECT current_setting('app.support_grant', true)),'')::uuid
                   AND g.subject_account_id = evidence_item.owner_account_id
                   AND g.scope IN ('read_evidence_metadata')
                   AND g.starts_at <= now() AND g.expires_at > now() AND g.revoked_at IS NULL));
```
| Pattern | Used for | Policy shape |
|---|---|---|
| P1 Owner | profile, evidence_item, consent_record, notification, file_object, enrollment, attempt... | `owner_col = app.account_id()` |
| P2 Org member by role | job, pipeline, application (org side), webhook_endpoint, api_client, billing | `org_id = ANY(app.org_ids()) AND app.has_org_role(org_id, roles)`; institution analogue with `inst_ids` |
| P3 Participant | conversation, message, connection | `EXISTS (SELECT 1 FROM conversation_participant p WHERE p.conversation_id = ... AND p.account_id = app.account_id() AND p.left_at IS NULL)` backed by PK index; hot path denormalises `conversation_id` into `message` (already present) |
| P4 Public/published | skill, plan, published job/course, credential by code | `state = 'published'` / read-only; writes restricted to owner module role |
| P5 / P5b Consent-gated | evidence for recruiters/faculty: P5 via a submitted application (`application.share_snapshot`), P5b via a per-employer grant (`evidence.share_artefact`) | as above; also used in `search_candidate_doc` queries (`search.discoverable` and `evidence.share_summary`, with a query-time `consent_epoch` match) |
| P6 Support grant | personal-data reads by ROLE-SUP/ADM | live grant row, scope, unexpired |
| P7 Worker tenant pinning | tenant tables for `ts_worker` | `org_id = NULLIF(current_setting('app.tenant_org', true),'')::uuid OR current_setting('app.actor_kind', true) = 'system'` with `system` allowed only on listed tables via grants |
| P8 Internal | outbox, inbox, idempotency, job, rate-limit | no end-user path exists; RLS disabled but privileges limited to server roles (no policy surface to misconfigure); documented exception list reviewed in each migration |

Testing (FF-05): the canary suite seeds tenants A and B, runs every list/get endpoint as A and asserts zero B rows; a **database-level** variant runs `SELECT` as `ts_app` with A's context against every RLS table and asserts zero B rows. A migration adding a tenant/personal table without RLS or a documented P8 exemption fails the migration lint (FF-10). A cross-tenant read is Sev-1 (ADR-T21).

## 7. Partitioning candidates
Partition only append-heavy tables whose retention is time-based; core aggregates stay unpartitioned until a measured trigger.

| Table | Scheme | Retention action | Trigger / note |
|---|---|---|---|
| `outbox_event` | RANGE monthly on `occurred_at` | published partitions dropped after 14 d (all rows published); unpublished never dropped | PK includes `occurred_at`; dispatcher index per partition |
| `audit_event` | RANGE monthly | detach to cold storage per retention (OPEN-08); never UPDATE | per-row `row_hash`, batch-anchored (§4.2); no chain lock |
| `idempotency_key` | RANGE daily on `expires_at` day | drop expired daily partitions | cheaper than DELETE; TTL 24 h/7 d |
| `consumer_inbox` | RANGE monthly on `processed_at` | drop after outbox retention + margin | |
| `background_job_attempt` | RANGE monthly | 30 d | |
| `notification_delivery` | RANGE monthly | 90 d [TARGET] | provider ids for support |
| `ai_request` | RANGE monthly | per DB-03 | cost reconciliation |
| `integrity_signal` | RANGE monthly | 90 d after attempt closed | |
| `analytics_event` | RANGE daily | 13 months [OPEN] | consent-gated |
| `webhook_delivery` | RANGE monthly | 30 d | |
| `message` | none at launch; HASH(conversation_id) or RANGE if >~500M rows | n/a | measured trigger only |
Mechanics: partitions created 3 months ahead by `retention.purge` job (or `pg_partman` if available, OPEN-B19); unique keys must include the partition key; a missing future partition is a paging alert (inserts would fail).

## 8. Transaction isolation and locking per operation
Default **READ COMMITTED** with explicit constraints/locks; **SERIALIZABLE** only where stated; serialization failures retried up to 3 times with jitter. All multi-statement writes are single transactions including outbox/audit.

| Operation | Isolation | Concurrency control |
|---|---|---|
| Apply to job (BR-T001) | READ COMMITTED | `INSERT` guarded by `uq_application_active`; conflict -> `duplicate-application`; consent snapshot + evidence links + outbox in same tx |
| Application stage transition | READ COMMITTED | `SELECT ... FOR UPDATE` on application; `version` check (If-Match); transition function validates SM; writes `stage_transition` |
| Evidence attestation grant/revoke/expiry | READ COMMITTED | `FOR UPDATE` on `evidence_item`; recompute rung from valid attestations; write `evidence_event` + outbox |
| Verification decision | READ COMMITTED | `FOR UPDATE` on `verification_request`; state guard `WHERE state IN (...)`; idempotent via key |
| Referee response (single use) | READ COMMITTED | `UPDATE reference_request SET state='submitted', outcome=$2 ... WHERE token_hash=$1 AND state IN ('sent','opened') AND expires_at > now()` : rowcount 1 = win, 0 = replay/expired |
| Email challenge confirm | READ COMMITTED | attempts incremented and committed **before** comparison so failed guesses cannot be rolled back; row lock |
| Refresh rotation (BR-T050) | READ COMMITTED | `FOR UPDATE` on session; if presented token already replaced -> revoke whole `family_id` in same tx |
| Consent change | READ COMMITTED | append `consent_record`; `UPDATE account SET consent_epoch = consent_epoch + 1` (row lock orders concurrent changes); outbox |
| Entitlement recompute from Stripe event | READ COMMITTED | `pg_advisory_xact_lock(hash(subject))`; ignore events older than `provider_event_created_at` |
| Usage counter / AI budget reserve | READ COMMITTED | single atomic `UPDATE ... SET used = used + $n WHERE used + $n <= limit RETURNING`; zero rows = over quota |
| Idempotency reserve | READ COMMITTED | `INSERT ... ON CONFLICT DO NOTHING` |
| Job claim | READ COMMITTED | `FOR UPDATE SKIP LOCKED`; fencing generation |
| Org role change / last-owner protection | READ COMMITTED | `FOR UPDATE` on organization row, then count owners |
| Data export build | REPEATABLE READ, READ ONLY | consistent snapshot across tables; runs on primary or replica with replay-lag guard |
| Erasure orchestration | READ COMMITTED per module step | each step idempotent; `FOR UPDATE` on `erasure_request`; step rows record outcome; never writes to append-only tables (§4.1); the last step deletes the `subject_identity_map` row (and the wrapped subject key), after which the sweep runs |
| Skill merge | READ COMMITTED in batches | idempotent remap; `merged_into` set last; dual-read during window |
| Reporting rollups | REPEATABLE READ, READ ONLY on replica | snapshot per rollup |
| Billing reconcile | READ COMMITTED | compares to Stripe, writes corrections through the same entitlement function |
Long transactions are forbidden in request paths (`idle_in_transaction_session_timeout`); external calls are never made inside a transaction (outbox decouples).

## 9. JSONB use policy
| Allowed | Not allowed |
|---|---|
| Bounded, versioned documents not filtered on hot paths: assessment `spec`, `ratings`, `factors`, `provenance`, feature `rollout`, webhook/Stripe payload snapshots, outbox payloads, `visible_fields` | Identifiers, foreign keys, statuses, or anything in a `WHERE`/`JOIN` on a hot path (promote to columns) |
| Config/blob data with a registered Zod schema | Unclassified personal data (every JSONB column is listed in the data inventory with its class, DB-03) |
| Small arrays bounded by CHECK | Unbounded arrays (use child table) |
Rules: each JSONB column has `CHECK (jsonb_typeof(col) = 'object')` (or array) and a size cap (`pg_column_size(col) < N`), a `v` version key, and a schema registered in the column registry; GIN indexes only with a recorded query need; shape changes follow expand/contract (DB-04); `jsonb_path` queries on large tables require review.

## 10. Types and enumerations
| Topic | Decision |
|---|---|
| Enums | `text` + `CHECK` (not PG `ENUM`): adding a value is `ADD CONSTRAINT ... NOT VALID` then `VALIDATE` (no table rewrite, no `ALTER TYPE` ordering limits); removing a value is a contract-phase migration |
| Booleans | `bool NOT NULL DEFAULT` (never tri-state); optional facts use nullable timestamps (`verified_at`) |
| Money | `integer`/`bigint` minor units + `text` currency (ISO 4217, CHECK length 3) |
| Time | `timestamptz` only; UTC; application clock injected; `date` for calendar facts; never store local times without zone |
| Text | `text` with explicit CHECK length; no `varchar(n)` ladder; normalisation (NFC) at the API boundary |
| Arrays | Only small id/tag arrays (`uuid[]`, `text[]`) not used for joins at scale (e.g. `skill_ids` on assessment); otherwise child table |
| Vectors | `vector(n)` with `n` fixed per embedding model; `model_version` stored; re-embedding is a backfill job |

## 11. Cross-module integrity and reconciliation
FKs across modules are allowed in the monolith but must not block extraction (ADR-T04). Design rule: any cross-module reference that would have to become a network call after extraction is (a) declared in the manifest, (b) validated through the owner's interface at write time in addition to the FK, and (c) covered by a nightly reconciliation query (`orphans = 0`) reported as a metric. Derived tables (`competency`, `match_explanation`, `search_*_doc`, `entitlement`) have no inbound FKs from source-of-truth tables and are rebuildable by event replay or full-rebuild jobs; a rebuild never needs downtime.

## 12. Soft delete vs erasure
| Mechanism | Where | Meaning |
|---|---|---|
| Business lifecycle state | `evidence_item.lifecycle`, `job.state`, `application.state`, `organization.status` | History the business needs (withdrawn, closed, rejected). Row stays; visibility controlled by policy/partial indexes |
| `*_at` soft marker | `file_object.deleted_at`, `message.deleted_at`, `evidence_artifact.removed_at`, `membership.removed_at` | User-initiated removal pending purge; excluded by default in repositories; purged by `retention.purge` after the documented grace (DB-03) |
| Erasure (privacy right) | Orchestrated by `api/privacy` (DB-03 §Deletion) | **Not** a soft delete. Per entity: hard delete, or pseudonymise to a tombstone where a legal/business record must survive (mutable aggregates only). **Append-only history is never pseudonymised by UPDATE**: it carries `subject_ref` and erasure deletes the mapping (§4.1). Never relies on `ON DELETE CASCADE` |
| No global `deleted_at` | - | A single generic flag invites forgotten filters (data leak) and defeats erasure. Each table chooses one of the three mechanisms explicitly |
Tombstone for `account`: `email := 'erased-<id>@erased.invalid'`, `display_name := 'Deleted user'`, `password_hash := NULL`, `status := 'erased'`, `erased_at := now()`; dependent rows with legal/business retention keep the account id only (no personal fields). Unique/NN constraints stay satisfiable by construction.

## 13. Extensions
| Extension | Use | Risk / note |
|---|---|---|
| `citext` | emails, handles, slugs | collation-independent case-insensitivity |
| `pg_trgm` | fuzzy search/autocomplete | index size; limit to short columns |
| `vector` (pgvector) | semantic search (ADR-T11) | version/recall testing; HNSW memory (OPEN-B21) |
| `unaccent` | FTS normalisation | |
| `pgcrypto` | `digest`, `gen_random_bytes` in migrations/functions | app-level crypto preferred for field encryption |
| `pg_stat_statements` | workload review | restricted visibility (may expose literals; normalised) |
| `pg_partman` | partition automation | availability depends on host (OPEN-B19); fallback is `retention.purge` job |
| Not used | `uuid-ossp`, `plv8`/untrusted PLs, FDW, logical-decoding-as-integration at launch | smaller attack surface; outbox is the integration seam |

## 14. Connection management and operations
| Item | Design |
|---|---|
| Pooling | Connection pooler in **transaction mode**; app is compatible by construction (no session state; `set_config(...,true)` only; prepared statements via protocol-level named statements disabled or pooler-aware) |
| Pool sizing | Total app+worker connections must stay under the DB limit minus reserve for migrator/breakglass/monitoring; per-replica pool derived from DB cores and replica count (formula documented in the runbook, not a guessed constant) |
| Timeouts | Role-level `statement_timeout`, `lock_timeout` (2 s for app DDL-free paths), `idle_in_transaction_session_timeout` |
| Replicas | Optional read replica for analytics rollups/exports only; never for read-after-write product paths; lag guard on consumers |
| Backup / PITR | Continuous WAL archiving + base backups; PITR drills; retention windows in DB-03 (OPEN-08); restore re-applies the erasure ledger (DB-03) |
| Maintenance | Autovacuum tuned per hot table (outbox, job, idempotency are high-churn: aggressive scale factors); bloat monitoring; `REINDEX CONCURRENTLY` runbooks |
| Observability | Slow-query log, lock waits, queue depth (outbox/job age), partition horizon, replication lag, unused indexes, RLS-policy-count drift check |

## 15. Reference-schema contrast [REF]
The reference migrations (`supabase/migrations`, 55 files, ~113 `CREATE TABLE` statements) use `gen_random_uuid()` keys, `VARCHAR` enums with CHECKs, Supabase `auth.users` FKs (repointed to `public.users` in migration 54), RLS written per migration, a `background_jobs` table with `lock_expires_at` but no fencing token, and plaintext referee tokens/emails. The target keeps the good parts (CHECK-based enums, RLS everywhere, SKIP LOCKED claim) and replaces the rest as described above; data continuity is in MIG-DATA-01.

## 16. Open items
| ID | Item |
|---|---|
| OPEN-B19 | Managed PostgreSQL vendor/version and extension availability (pg_partman, pgvector version, uuidv7) |
| OPEN-B20 | May a candidate re-apply to the same job after a terminal state? (affects `uq_application_active` predicate) |
| OPEN-B21 | Vector dimension, HNSW parameters and recall target from evaluation on a realistic corpus |
| OPEN-B22 | Row count / size thresholds that trigger partitioning `message` and archiving `audit_event` |
| OPEN-08 (legal part) | Counsel questions left by the REVW-04 design: (1) are surviving history skeletons (timestamps, action ids, tenant ids, no identifier) anonymous data once the mapping is deleted; (2) is a truncated `ip_prefix` in `audit_event` personal data; (3) retention length of audit and consent proof; (4) may `subject_identity_map` rows be kept beyond erasure under a legal hold, and for what purpose; (5) does the `erasure_ledger` `erased_subject_ref` need its own retention limit; (6) backup age-out and whether KMS key destruction of a per-subject key is accepted as erasure of backed-up copies |
| OPEN-B56 | Anchor parameters (window length, safety lag, signing key type, archive target) and whether `outbox_event` payloads are also anchored; set from WP-LOADBASE and SEC-02 |

## 17. Write budget per P0 use case (resolves the budget part of REVW-06) **[skeleton — counts are design-derived, to be replaced by measured values]**
Purpose: tie SLO class C3 (400 ms p95 write, OPS-SLO §5) to what a mutating transaction actually writes and locks. Every unsafe request shares the same overhead rows: 1 `idempotency_key` insert + 1 completion update (BE-01 §8), 1 `rate_limit_bucket` upsert (UNLOGGED, no WAL; BE-01 §16), 1 `audit_event` insert (lock-free, §4.2) and at least 1 `outbox_event` insert. Rows written after commit by the dispatcher (1 `background_job` per subscriber of each event, `consumer_inbox` rows) are counted separately because they are outside the request transaction but inside the same database.

| UC | Use case (API class) | State rows | History rows | Outbox | Row locks held | Shared / global locks | Dispatcher jobs per event | Measured rows / lock wait p95 | Budget |
|---|---|---|---|---|---|---|---|---|---|
| UC-01 | Register account (C4) | account, subject_identity_map, session | - | 1 | none beyond unique indexes | 0 | N(notify, audit view) | TBD | TBD |
| UC-02 | Sign in / refresh rotation (C4) | session (1 update, 1 insert) | - | 0-1 | `session` row (FOR UPDATE) | 0 | 0 | TBD | TBD |
| UC-03 | Create evidence item (C3) | evidence_item, evidence_artifact (0..k) | evidence_event 1 | 1 | none (new aggregate) | 0 | N(search, skills) | TBD | TBD |
| UC-04 | Attestation grant / revoke (C3) | evidence_attestation 1, evidence_item 1 | evidence_event 1 (aggregate chain) | 1 | `evidence_item` row | 0 | N(search, skills, match, notify) | TBD | TBD |
| UC-05 | Apply to job (C3) | application, consent snapshot, application_evidence k, draft delete | stage_transition 1 | 1 | none (unique index `uq_application_active`) | 0 | N(notify, search, analytics) | TBD | TBD |
| UC-06 | Application stage transition (C3) | application 1 | stage_transition 1 (aggregate chain) | 1 | `application` row | 0 | N(notify, analytics) | TBD | TBD |
| UC-07 | Consent change (C3) | account 1 (`consent_epoch`) | consent_record 1 (aggregate chain) | 1 | `account` row | 0 | N(search, match, notify) | TBD | TBD |
| UC-08 | Publish job (C3) | job 1 | - | 1 | `organization` row (slot count) | 0 | N(search, notify) | TBD | TBD |
| UC-09 | Send message (C3) | message 1, conversation 1 | - | 0-1 | `conversation` row | 0 | N(notify) | TBD | TBD |
| UC-10 | Erasure step per module (worker) | module-specific deletes | none (never touches history, §4.1) | 1 | per-subject rows only | 0 | 0 | TBD | TBD |

Rules: (1) the "Shared / global locks" column budget is **0** for every request-path use case; any non-zero entry blocks WP-DB-BASE exit (the former month-wide audit lock is gone, §4.2); (2) the table is completed with measured rows, statements per transaction and lock-wait p95 under WP-LOADBASE (TEST-PER-010) and the budget column is then set from the C3 target, not guessed; (3) a PR adding a write or lock to a P0 use case updates this table; (4) the `audit.anchor` job is the only designed single writer and runs off the request path.
**Not resolved here (REVW-06 remainder):** one `background_job` row per event subscriber (BE-01 §6) and in-process consumers via `LISTEN/NOTIFY`, one idempotency row per unsafe request, and `rate_limit_bucket` write amplification remain open for the Backend Architecture Team; this table makes their cost visible.

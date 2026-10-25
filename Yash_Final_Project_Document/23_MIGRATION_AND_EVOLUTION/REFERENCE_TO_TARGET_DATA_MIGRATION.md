# Reference-to-Target Data Migration Note

Doc ID: MIG-DATA-01 · Owner: Data Architecture · Version 1.0 · Status: Under Review · Relates: DB-01..DB-04, ADR-T05, ADR-T14, INV-T04, INV-T05, INV-T15, BE-01 · Scope: **data continuity only**; code/UI migration is covered elsewhere in `23_*`

Tags: **[REF]** facts read from the reference repository (`supabase/migrations` 00001-00055 partially read, `packages/domain/src/auth.ts`, root `CLAUDE.md`; located with `graphify query` then targeted reads; `ARCHITECTURE.md` and `docs/engineering/DATABASE.md` were not read in full) · **[TARGET]** plan · **[OPEN]** unknown. This note changes nothing in the reference system; no migration or query was run against any database. Column-level facts come from migrations 00002, 00041 and 00042 (read) and `auth.ts` (password format); other table names come from a `CREATE TABLE` name scan of 00001, 00003, 00050-00052 only. All remaining migrations were **not** read column by column, so every mapping below is a hypothesis to be verified in the inventory step (§4 step 0).

## 1. Is there data to migrate? [OPEN-B33]
[REF] the reference repository's root `CLAUDE.md` states that the **core career loop is persisted** in PostgreSQL and other API modules are **in memory and labelled `ephemeral`**. Therefore: (a) only the persisted core loop (accounts, profiles, evidence, skills, work history/references, organizations/memberships, jobs, applications, background jobs, audit/admin audit, feature flags, billing, notifications) can carry real data; (b) tables created by the ephemeral-module migrations (00004-00040: challenges, LMS, messaging, gamification, etc.) should be empty or unused and need only a row-count check before decommission. **Whether any production users exist, and how many rows, is not known from the repository (OPEN-B33).** If there are no real users, the plan collapses to: seed taxonomy/plans in the target and discard the reference database.

## 2. Principles
1. **Conservative trust.** Anything imported lands at the lowest defensible evidence rung; the target must never inherit a "verified" it cannot justify (INV-T04, ADR-T14).
2. **Consent is not inferred broadly.** Legacy rows have no consent model; synthesized consent is narrow, labelled, and re-confirmed (INV-T15).
3. **Secrets are not carried forward in weaker form.** Tokens that were stored in plaintext are invalidated and reissued (INV-T05).
4. **Reversible until acceptance.** The reference database is left untouched and read-only; cutover is a switch, not an in-place conversion.
5. **Preserve identifiers** (UUIDs) where valid so external links, emails already sent, and Stripe metadata keep working; record provenance of every migrated row.

## 3. Mapping (reference -> target)
| Reference table [REF] | Target entity (DB-01) | Transformation / decision | Risk |
|---|---|---|---|
| `public.users` (+ Supabase `auth.users` FK, repointed by migration 00054) | `account` | Preserve id and email (case-fold; detect `citext` collisions and resolve manually); `status=active`; `terms_version='legacy'` and force acceptance of current terms at next login. Accounts without `public.users` row are dropped with a report | Duplicate emails differing by case; orphan auth rows |
| Password hash `pbkdf2-sha512$<iter>$<salt>$<hash>` or legacy `<salt>:<hash>` [REF auth.ts] | `account.password_hash` | Carry as-is with an explicit scheme prefix; **verify-then-rehash to Argon2id on next successful login**; accounts that never log in within the support window [TARGET 180 days] get a forced reset; legacy scheme verification code is removed after the window | Weak legacy parameters remain until login; keep window short |
| Self-issued HMAC session tokens, session revocation tables (00045/00046) | - | **Not migrated.** All sessions invalid at cutover; users sign in again (one-time notice) | Support load |
| `public.profiles` | `profile` | Preserve id/handle (ensure `^[a-z0-9-]{3,40}$`, resolve conflicts); visibility: map existing public to `public`, others `private`; fill missing handle deterministically | Public exposure continuity vs. consent: see consent row |
| Visibility/consent flags (none as such) | `consent_record` | Insert synthesized records `source='import'`, `policy_version='legacy-0'` for `profile.public_view` only where the profile was public. **Recruiter-facing scopes (`search.discoverable`, `evidence.share_summary`, `evidence.share_artefact`, `matching.recommend`, `outreach.recruiter_contact`) are NOT synthesized**; users are prompted at first login | Candidates temporarily absent from recruiter search until they opt in (intended) |
| `public.evidence` (+ `metadata` JSONB added in 00002) | `evidence_item` (+ `evidence_artifact`, `evidence_event`) | Map kind/title/summary/dates; **all items start `rung='claimed'`**; `source='self'` unless metadata proves course/assessment origin; write `evidence_event(event='created', actor_kind='system', details={migrated_from})`. Any legacy "verified" flag is **ignored**, never copied | Users see badges disappear: communicate and offer re-verification |
| Evidence derived from code-challenge/assessment "passes" [REF: simulated pass lesson, ADR-T13] | `evidence_item` | Import as `claimed`, `source='assessment'`, with `provenance={legacy:'unverified'}` and a visible "legacy, unverified" note; no attestation | Largest source of false-verified; must not be re-promoted without a runner/human proof |
| `evidence_skills`, `skills`, `skill_relationships` | `evidence_skill`, `skill`, `skill_relation` | Preserve slugs/ids; relation types map 1:1 (`prerequisite_of`, `subskill_of`, `supersedes`, `correlates_with`); run duplicate/alias detection | Taxonomy duplicates |
| `public.verified_work_histories` | `work_claim` + linked `evidence_item(kind=work_experience)` | Employer fields mapped; `corporate_email` -> `corporate_email_enc` + `_hash`. If `email_verified_at` is set -> one `evidence_attestation(method='employer_email', rung='artifact_backed', provenance={migrated})` (the code was legitimately mailbox-delivered). `verification_status='verified'` without a recorded basis -> **no attestation**. `verification_score`, `badge_tier` (gamified) dropped from the live model, preserved in the archive | Loss of badges; clear user messaging |
| `public.employment_references` | `reference_request` / `reference_response` | `referee_email`/`referee_name` field-encrypted; **plaintext `token` discarded**. `status=submitted` -> response row + `peer_attested` attestation (`provenance={migrated}`; only if `confirm_*`/ratings exist); `requested` older than 14 d -> `expired`; `requested` within 14 d -> `queued`, **new token generated (hash-only), email re-sent** (then `sent`) with notice, clock reset to remaining time; `declined/flagged` mapped to `submitted` with `outcome` `decline` / `dispute` | Referees may receive a second email; attestation integrity of old tokens unverifiable -> capped at `peer_attested` |
| `public.organizations`, `public.org_memberships` | `organization`, `membership` | Preserve ids; role mapping table old->new (`owner`->`org_owner`, `admin`->`org_admin`, recruiting roles->`recruiter`/`hiring_manager`, anything unknown -> `viewer`). **Least privilege on ambiguity**; org owners must confirm roles within 30 days (access review) | Privilege escalation if mapping is generous |
| `public.jobs`, `job_skills` | `job`, `job_skill_requirement` | State map to SM-JOB (reference `expired` -> `closed` + `close_reason='expired'`); missing pipeline -> default pipeline per org | Free-text fields may exceed new CHECK limits: truncate with report |
| `public.job_applications`, `application_drafts` (00019), `application_evidence` | `application`, `application_draft`, `application_evidence`, `application_consent_snapshot` | State map to SM-APPLICATION (reference `offer` -> `offer_extended`; reference drafts -> `application_draft`); duplicates violating BR-T001 -> keep newest active, mark older `withdrawn` (system, audited). Snapshot rows synthesized with `policy_version='legacy-application'`: the candidate's act of attaching that evidence to that application is the only consent recorded; recruiter access limited to the evidence attached | Overexposure if snapshot is generous |
| `public.background_jobs` (00042) | - | Not migrated. Drain before freeze; any pending business effect is re-enqueued by an explicit script that creates target jobs with idempotency keys | Lost reminders |
| `public.audit_logs`, `admin_audit_logs` (00050) | `audit_event` | Import as historical events with `actor_kind` mapped, actor and subject ids converted to `subject_ref` through `subject_identity_map` (DB-02 §4.1), `row_hash` computed per row and sealed by a **genesis `audit_anchor`** recording the legacy dump checksum (DB-02 §4.2); or retain as a read-only archive schema if the shape does not map cleanly | Chain discontinuity is explicit, not hidden |
| `public.feature_flags` (00051) | `feature_flag` | Recreate deliberately; do not copy flags blindly (target flags differ) | Behaviour drift |
| `stripe_customers`, subscription/billing tables (00052/00053) | `billing_customer`, `subscription`, `entitlement` | Preserve Stripe ids; **entitlements are recomputed** by `billing.reconcile` from live Stripe state, not copied (INV-T17) | Plan mismatch until reconcile |
| Notification tables (00007, 00044, 00048) | `notification`, `notification_preference` | Preferences migrated; notifications older than 90 days dropped | Minor |
| Ephemeral-module tables (00004-00040: challenges, LMS, messaging, gamification, networking, reputation, etc.) | - | Expect empty/unused. Check row counts; if non-empty, treat as a separate mini-migration with its own review; otherwise do not migrate | Surprise data |
| Reference-only concepts (XP ledger, reputation engines, talent segmentation, etc.) | - | Removed/merged per DOMAIN_ARCHITECTURE §6; not migrated | n/a |

## 4. Procedure [TARGET]
| Step | Action | Evidence |
|---|---|---|
| 0 Inventory | Row counts for all reference tables (about 113 `CREATE TABLE` statements across 55 files), column profile (nulls, max lengths, enum values actually used), duplicate-key analysis, orphan analysis, list of distinct status/role values to complete §3 maps | Inventory report; resolves OPEN-B33 |
| 1 Rehearse | Restore reference snapshot into an isolated environment; run the full pipeline end-to-end >= 2 times; measure duration; fix mappings | Rehearsal reports |
| 2 Freeze | Announce window; reference app put into read-only mode; drain `background_jobs`; final snapshot (this is the rollback point) | Snapshot id/checksum |
| 3 Extract | Load into restricted `legacy_ref` schema in the target database (role `ts_migrator`, no app access) | Counts match source |
| 4 Transform | Idempotent SQL/jobs write target entities, preserving ids, in dependency order (accounts -> profiles -> skills -> evidence -> work/verification -> orgs -> jobs -> applications -> billing -> audit); each row stamped in `migration_provenance(legacy_table, legacy_id, target_table, target_id, batch)` | Provenance table |
| 5 Validate | Reconciliation suite below; manual review of exceptions | Signed validation report |
| 6 Cutover | Enable target app, rebuild derived data (`competency`, search docs, embeddings) from source via events/rebuild jobs; force re-login; send user and referee communications | Smoke tests, FF-05 canary |
| 7 Observe | Heightened monitoring; reference DB stays read-only; fixes via `repair` migrations | Incident log |
| 8 Decommission | After the agreed observation period [OPEN-B36], archive legacy dump (encrypted, access-restricted) and drop `legacy_ref`; note erasure obligations for archived copies (DB-03 §5.6: archive follows backup rules, erasure ledger replay applies to any restore) | Decommission record |
**Rollback:** before step 6 completes, rollback = keep reference app and DB (untouched, read-only lifted). After acceptance, rollback to the reference stack is not supported (target writes would be lost); corrections are forward-fix.

## 5. Reconciliation checks
| Check | Pass condition |
|---|---|
| Row counts per mapped table | target = source - documented exclusions (each exclusion listed with ids) |
| Referential integrity | No orphans in target; all FKs validate |
| Uniqueness | `account.email` unique (citext), `profile.handle` unique, BR-T001 index holds |
| Evidence rung audit | Count of items with `rung <> 'claimed'` equals count of migrated attestations; **zero** items higher than their strongest attestation justifies; zero `source='ai'` |
| Secrets | `reference_request.token_hash` non-null only for newly issued tokens; no legacy plaintext token anywhere in target or logs |
| Password hashes | Every account has either a legacy-scheme hash flagged for rehash or none; none logged |
| Consent | No recruiter-facing consent (`search.discoverable`, `evidence.share_summary`, `evidence.share_artefact`, `matching.recommend`) exists with `source='import'` |
| Roles | No membership with a role stronger than the mapped legacy role; owners present for every org |
| Money | Subscriptions match Stripe (list vs. API) after reconcile job |
| Derived data | Rebuild produces competencies/search docs only from migrated evidence; no stale legacy aggregates |
| Sampling | N random accounts per cohort compared field-by-field by a human |

## 6. User and partner impact
- All users must sign in again; legacy-password users are told nothing unusual (rehash is silent) but forced to accept current terms.
- Candidates see previously "verified" items as `claimed` unless a recorded basis existed; a one-time explainer links to re-verification (ladder).
- Candidates are asked to (re)choose recruiter-facing consent scopes before appearing in search or sharing evidence with applications beyond what they already attached.
- Referees with in-flight requests get a clearly labelled new link; old links stop working.
- Org owners confirm member roles.

## 7. Open items
| ID | Item |
|---|---|
| OPEN-B33 | Existence and volume of production data in the reference system |
| OPEN-B36 | Observation period before decommissioning the reference database/archive |
| OPEN-B37 | Whether legacy audit logs are imported or archived read-only |
| OPEN-B38 | Final legacy->target role and state maps after the step-0 inventory of distinct values |

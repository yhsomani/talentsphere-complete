# Consent Scope Catalogue (CSC)

Doc ID: CC-CSC · Owner: Privacy Lead + Data Architect (co-owner: Product Director) · Version 1.0 · Status: Under Review · Date: 2026-10-25
Resolves: REVW-02 (Critical, two consent vocabularies); closes the timing half of REVW-25 and the consent-end half of REVW-26 (open parts in section 9).
Supersedes: nothing as a document. It consolidates, and is now the only authority for, the scope ids formerly written as `CS-*` in SPEC-G1 section 3.2, DT-01, SPEC-G2, SPEC-G5 and FEAT-22-01.4, and the dotted vocabulary in DB-01 section 4 / DATA-E2201. Those places keep their prose but must use the ids below.
Linked from: [MASTER_INDEX](MASTER_INDEX.md) · [ID_REGISTRY](ID_REGISTRY.md). Fitness function: FF-12 in [CANONICAL_INVARIANTS](CANONICAL_INVARIANTS.md).
Classification: all content is **[TARGET]** unless tagged **[OPEN]**. Nothing here is implemented. Store all generated artifacts under: Yash_Final_Project_Document.

## 1. Canonical id format (decision)

`<area>.<purpose>`: two lowercase segments, `snake_case` within a segment, regex `^[a-z]+\.[a-z_]+(\.[a-z_]+)?$`. The optional third segment exists for one id only, `ai.assist.process`, kept unchanged because the DB, BE-01 AI gateway flow and privacy design already use it; new scopes use two segments. Dotted ids are chosen because they already exist in the DB CHECK, the OpenAPI enum, the policy action registry style (`<module>.<resource>.<verb>`) and the consent API path (`/me/consents/{scope}`).

| Rule | Detail |
|---|---|
| Areas (closed list) | `profile`, `search`, `matching`, `outreach`, `evidence`, `application`, `alumni`, `ai`, `analytics`, `comms`, `data` |
| Immutable | An id is never renamed or reused. A scope whose meaning changes materially gets a new id, and the old id moves to section 4 as `retired` |
| Description change | Same id, new `policy_version`; the scope is treated as not granted until re-confirmed (privacy design section 3, re-consent) |
| Legacy `CS-*` | Retired as identifiers. They survive only in the crosswalk (section 4). Documents must not introduce new `CS-*` ids |
| One purpose per scope | Never bundled with terms acceptance, never pre-ticked (privacy design section 3) |
| Source of truth | The machine-readable block in section 8. Every other list of scope ids is derived from it (FF-12) |

## 2. Grain model

A grant is one append-only `consent_record` row (INV-T35). Three independent dimensions describe it. This replaces the earlier overloaded `target_type` that meant both "the object" and "the grantee".

| Column | Meaning | Values |
|---|---|---|
| `scope` | What purpose is consented | section 3 ids |
| `target_type` / `target_id` | The **data object** the grant is about | `evidence`, `application`, or NULL (whole account) |
| `grantee_type` / `grantee_id` | **Who** may use it | `all_verified_orgs` (no id), `org` (org id), `institution` (institution id), or NULL (no named grantee) |
| `field_set` | Field names the learner chose to share (alumni only) | text[] or NULL |
| `expires_at` | End of the grant, or NULL for "until revoked" | timestamptz |

Grain classes (a generated table CHECK `consent_grain_ck` enforces the class per scope, section 5):

| Grain | grantee | target | Used by |
|---|---|---|---|
| `account` | NULL | NULL | `profile.public_view`, `matching.recommend`, `ai.assist.process`, `analytics.product`, `comms.marketing_email`, `data.research_aggregate` |
| `audience` | `all_verified_orgs` | NULL | `search.discoverable`, `outreach.recruiter_contact`, `evidence.share_summary` |
| `grantee` | `org` or `institution`, id required | NULL | `profile.share_contact`, `evidence.share_institution`, `alumni.share_outcomes` |
| `grantee_object` | `org`, id required | `evidence` optional (NULL = all my evidence artefacts at read time) | `evidence.share_artefact` |
| `application` | `org` (the job's org), id required | `application`, id required | `application.share_snapshot` |

No separate grant table is needed: per-employer and per-artefact grants are rows of the same ledger, folded by the `consent_current` view (section 5). One source of truth, as SPEC-G1 section 3.3 rule 1 requires.

## 3. Catalogue

### 3.1 Identity, grain and defaults

| Scope id | Legacy id(s) | Purpose (user-facing text key, versioned) | PUR | Target | Grantee | Grain | Default | User toggle |
|---|---|---|---|---|---|---|---|---|
| `profile.public_view` | DB: same | "Make my profile visible to anyone with its public page" | PUR-02 | none | none (anyone) | account | off | yes |
| `search.discoverable` | `CS-DISCOVER` | "Let recruiters find my profile summary in search" | PUR-21 | none | all verified orgs | audience | off | yes |
| `matching.recommend` | DB: same | "Use my profile and evidence to recommend jobs and explain matches to me" | PUR-06 | none | none | account | off | yes |
| `outreach.recruiter_contact` | `CS-CONTACT`; DB: same | "Let recruiters send me first-contact requests" | PUR-07 | none | all verified orgs | audience | off | yes |
| `evidence.share_summary` | `CS-EVID-SUMMARY` | "Show evidence titles, skills and strength to recruiters who find me" | PUR-22 | none | all verified orgs | audience | off | yes |
| `evidence.share_artefact` | `CS-EVID-ARTEFACT`; DB: `evidence.share_recruiter` (org/evidence target) | "Let this employer open my evidence files" | PUR-22 | evidence (optional) | one org | grantee_object | off | yes |
| `profile.share_contact` | `CS-CONTACT-DETAILS` | "Share my email/phone with this employer" | PUR-22 | none | one org | grantee | off | yes |
| `application.share_snapshot` | `CS-APPLICATION`; DB: `evidence.share_recruiter` (application target) | Implicit: "This application shows exactly these items to this employer" | PUR-05 | application | the job's org | application | granted at submit | **no** (withdraw per application) |
| `evidence.share_institution` | DB: same | "Include my work in my institution's cohort reports" | PUR-18 | none | one institution | grantee | off | yes |
| `alumni.share_outcomes` | `CS-ALUMNI` | "Share chosen outcomes with my institution after I graduate" | PUR-23 | none | one institution | grantee | off | yes, offered at graduation (FEAT-18-07) |
| `ai.assist.process` | DB: same | "Send my content, redacted, to AI providers to get suggestions" | PUR-10 | none | none (processor) | account | off | yes |
| `analytics.product` | DB: same | "Help improve the product with usage analytics" | PUR-14 | none | none | account | off | yes |
| `comms.marketing_email` | DB: same | "Send me tips and product news by email" | PUR-13 | none | none | account | off | yes |
| `data.research_aggregate` | DB: same | "Include my data in anonymised research" | PUR-20 | none | none | account | off | **hidden until OPEN-B10 is decided** |

### 3.2 Expiry, revocation effect and links

"Immediate" = enforced at read time (section 6). Fuller wording and the "cannot be undone" column live in PRIVACY_AND_DATA_LIFECYCLE_DESIGN section 3, keyed by these ids.

| Scope id | Expiry | Revocation effect | Linked rules |
|---|---|---|---|
| `profile.public_view` | none; re-confirm prompt every {12 months} is not an expiry | Public page 404; caches purged; search docs removed | DT-01 row 2; INV-T15 |
| `search.discoverable` | none; re-confirm prompt every {12 months} (SPEC-G1 section 5) | Absent from recruiter results at next read; index entry removed <= 15 min (BR-T063) | DT-01 row 5; BR-T063, BR-T069 (restriction is a profile setting, not a scope); INV-T15, INV-T29; AC-22-01-01/02 |
| `matching.recommend` | none | No new recommendations; `match_explanation`, embeddings deleted (consent_epoch bump); candidate stays lexically searchable if `search.discoverable` is live (DEP-2) | INV-T15, INV-T19 |
| `outreach.recruiter_contact` | none | New first-contact requests denied; open threads remain but recruiter cannot continue | DT-08 rows 3 and 6; AC-13-02-01/02; INV-T40 blocklist is independent |
| `evidence.share_summary` | none | Summary fields dropped from results at next read; effective only while `search.discoverable` is live (DEP-1) | DT-01 row 5; INV-T15, INV-T29 |
| `evidence.share_artefact` | optional; default {12 months}; reminder 14 d before; ends automatically if the org is deleted | That org's reads and new signed-URL issuance denied; URLs already issued lapse within their <= 5 min life (BE-01) | DT-01 row 6; FEAT-22-01.4; AC-22-01-03; INV-T15, INV-T29; BR-T063 |
| `profile.share_contact` | optional; default {12 months} **[OPEN-CS-05]** (SPEC-G1 stated none) | Email/phone masked for that org at next read; a contact path that exists through an accepted conversation (DT-08) is separate and is not removed by this revocation | DT-01 row 7; INV-T15 |
| `application.share_snapshot` | `expires_at` = terminal state time + {12 months} **[OPEN-08]**, written by the applications module on the terminal transition; candidate may withdraw earlier | Snapshot kept; live items become tombstones; org-side identifiable data handled by rule R-RET (section 7) | DT-01 row 4; BR-T062, BR-T063; INV-T29, INV-T35; PUR-05 |
| `evidence.share_institution` | ends with the cohort sunset (graduation date + 24 h, SPEC-G5 section 3.7) | Learner excluded from cohort reads and aggregates; aggregates recomputed | DT-01 row 10; BR-T100, BR-T105; INV-T41; **[OPEN-CS-06]** |
| `alumni.share_outcomes` | none (until revoked) | Institution loses the chosen fields at next read | DT-01 row 10a; FEAT-18-07; AC-18-07-04; INV-T41 |
| `ai.assist.process` | none | AI endpoints return `403 consent-required`; queued AI jobs cancelled (R5) | BE-01 AI gateway section 13; INV-T06..T09; PUR-10 |
| `analytics.product` | none | Client stops sending; server rejects; subject key discarded | PUR-14; REVW-31 for the separate basis of operational telemetry |
| `comms.marketing_email` | none | Marketing sends suppressed at send time; provider list synced (R6) | DT-07 row 8; INTEGRATION_ARCHITECTURE email categories |
| `data.research_aggregate` | none | Subject excluded from the next aggregate run | PUR-20; OPEN-B10 |

## 4. Crosswalk (old to canonical)

Every id that appears or appeared in the specs, DT-01, the DB, the API, BE-01 or the privacy design maps to exactly one row, except `evidence.share_recruiter`, which is split by the target it carried.

| Old id | Where it was used | Canonical id | Note |
|---|---|---|---|
| `CS-DISCOVER` | SPEC-G1 3.2, 5, AC-22-01-01/02; DT-01 rows 5; SPEC-G5 AC-11-05-01; SPEC-G1 field visibility `discoverable` | `search.discoverable` | New to the DB list |
| `CS-CONTACT` | SPEC-G1 3.2; SPEC-G5 3 and AC-13-02-01/02; DT-08 | `outreach.recruiter_contact` | Existing DB id |
| `CS-EVID-SUMMARY` | SPEC-G1 3.2; SPEC-G2 section 3.2 rule 10; DT-01 row 5 | `evidence.share_summary` | New to the DB list |
| `CS-EVID-ARTEFACT` | SPEC-G1 3.2; SPEC-G2; FEAT-22-01.4; DT-01 row 6; AC-22-01-03 | `evidence.share_artefact` | New to the DB list; per-employer by `grantee_id` |
| `CS-CONTACT-DETAILS` | SPEC-G1 3.2; DT-01 row 7 | `profile.share_contact` | New to the DB list |
| `CS-ALUMNI` | SPEC-G1 3.2; SPEC-G5 3.7, AC-18-07-04 | `alumni.share_outcomes` | New to the DB list; uses `field_set` |
| `CS-APPLICATION` | SPEC-G1 3.2; DT-01 header; BR-T062 | `application.share_snapshot` | Written as a ledger row (`source='application'`), not a toggle |
| `evidence.share_recruiter` with `target_type=application` | DB-01 section 4; PUR-05; RLS P5; require_consent in BE-01 | `application.share_snapshot` | Retired id |
| `evidence.share_recruiter` with `target_type` `org` or `evidence` | DB-01 section 4; RLS P5; BE-01 | `evidence.share_artefact` | Retired id. An old `evidence`-only target with no grantee has no canonical equivalent: a grant to "any recruiter" is no longer expressible. No data exists (all [TARGET]), so nothing is migrated |
| `evidence.share_recruiter` used for search-result summaries | implicit in `matching.recommend` text | `evidence.share_summary` | Split out |
| `matching.recommend` as "search presence" | DB-01 section 4 purpose text | `search.discoverable` (presence) + `matching.recommend` (recommendations only) | `matching.recommend` is narrowed; its id is unchanged |
| `profile.public_view`, `evidence.share_institution`, `outreach.recruiter_contact`, `ai.assist.process`, `analytics.product`, `comms.marketing_email`, `data.research_aggregate` | DB, API, privacy design | same id | Unchanged |

Transition: every source is [TARGET], so there is no data to convert. The only imported consent is `profile.public_view` with `source='import'` (REFERENCE_TO_TARGET_DATA_MIGRATION). The retired `evidence.share_recruiter` is rejected by the CHECK and the OpenAPI enum from the first migration.

## 5. Record shape and generated artefacts

`consent_record` columns added or changed (DATA-E2201): `target_type` CHECK in (`evidence`, `application`); new `grantee_type` CHECK in (`all_verified_orgs`, `org`, `institution`); new `grantee_id` uuid; new `field_set` text[] (only `alumni.share_outcomes`); new `expires_at` timestamptz.

`consent_current` = latest row per `(subject_account_id, scope, target_type, target_id, grantee_type, grantee_id)`, exposed only where `granted AND (expires_at IS NULL OR expires_at > now())`. Expiry therefore needs no write at expiry time; the sweeper only notifies and bumps `consent_epoch`.

Generated table CHECK (template; the per-scope branches are produced from the section 8 block):

```sql
CONSTRAINT consent_grain_ck CHECK (
  CASE scope
    WHEN 'search.discoverable'        THEN grantee_type = 'all_verified_orgs' AND target_type IS NULL
    WHEN 'evidence.share_artefact'    THEN grantee_type = 'org' AND grantee_id IS NOT NULL AND (target_type IS NULL OR target_type = 'evidence')
    WHEN 'application.share_snapshot' THEN grantee_type = 'org' AND grantee_id IS NOT NULL AND target_type = 'application' AND target_id IS NOT NULL
    WHEN 'profile.public_view'        THEN grantee_type IS NULL AND target_type IS NULL
    -- ... one branch per scope, from the catalogue
  END)
```

`require_consent` obligation (BE-01): `require_consent(scope, { grantee, target })`. Examples that now resolve through `ConsentPort`:

| Read | Obligation |
|---|---|
| Recruiter opens a search result summary | `require_consent('search.discoverable', {grantee: {org: orgId}})` and `require_consent('evidence.share_summary', {grantee: {org: orgId}})` |
| Recruiter opens an evidence artefact outside an application | `require_consent('evidence.share_artefact', {grantee: {org: orgId}, target: {evidence: id}})` |
| Hiring team opens evidence inside an application | `require_consent('application.share_snapshot', {grantee: {org: orgId}, target: {application: id}})`, plus the live-item check in DT-01 row 4 |
| Recruiter requests contact details | `require_consent('profile.share_contact', {grantee: {org: orgId}})` or an accepted conversation (DT-08) |
| AI gateway call | `require_consent('ai.assist.process')` |

## 6. Revocation propagation (REVW-25)

Decision: **authorization at read time against `consent_current` on the primary database, with no consent cache.** The four earlier statements (instantly, within 1 minute, within a cache TTL, next API read) collapse to one: a revocation is effective for every read that starts after the revoking transaction commits. 60 s is kept only as the **test and monitoring timeout**, not as a tolerated stale window. Tags: the design is [TARGET]; every number marked [OPEN] has no measured evidence yet and is a placeholder bound to be confirmed by the named owner.

| Path | Mechanism | Bound | Status |
|---|---|---|---|
| R1 API and RLS reads (policy `can` plus `ConsentPort`, RLS P5/P5b) | Read-time lookup on the primary; consent reads never go to a replica | Effective on the first read after commit; test timeout 60 s | [TARGET]; replica-lag rule needs Backend Architect sign-off |
| R1-fallback | Only if profiling shows the lookup is too costly: a per-account decision cache keyed by `consent_epoch` | TTL <= 60 s, and any `consent_epoch` change invalidates it | [OPEN-CS-01] |
| R2 Search results | Query-time check that the candidate document's `consent_epoch` equals the account's current epoch, so a stale index entry is never returned | 0 s for visibility; physical index removal <= 15 min (BR-T063) | [TARGET] |
| R3 Signed download URLs already issued | Natural expiry | <= 5 min (BE-01 download row) | [TARGET] |
| R4 Derived data (embeddings, `match_explanation`, `search_candidate_doc`) | Event-driven deletion after `consent.changed` | <= 24 h | [OPEN-CS-02] |
| R5 Queued AI jobs | Worker cancels jobs for the subject | <= 5 min | [OPEN-CS-02] |
| R6 Marketing provider list sync | Sends re-check consent at send time (0 s); provider suppression list sync | <= 24 h | [OPEN-CS-02] |
| R7 Analytics clients | Server rejects at once; client reads the new state on next config fetch | next session start | [OPEN-CS-02] |
| R8 `consent.changed` consumers | Outbox, at-least-once, idempotent consumers | p95 <= 60 s | [OPEN-CS-02] |
| R9 Access-log entry | Written in the revoking transaction (BR-T063) | same transaction | [TARGET] |
| R10 Recruiter-device offline copies | Not revocable remotely; cache is non-authoritative (INV-T13) | bounded by PWA cache lifetime | [OPEN-CS-02] with 08_PWA |

Test alignment: TEST-SEC-009 asserts denial on the first read after the revoke response (not "within the cache TTL"). INV-T25's 60 s cache bound concerns the verified rung, not consent.

## 7. Rules

| ID | Rule |
|---|---|
| DEP-1 | `evidence.share_summary` has no effect unless `search.discoverable` is live for the same viewer org (DT-01 row 5). |
| DEP-2 | The recruiter search document is built lexically when `search.discoverable` is live. Embeddings and semantic ranking for that candidate require `matching.recommend` to be live as well. [OPEN-CS-03] confirm with the Search Architect. |
| DEP-3 | `evidence.share_artefact` and `profile.share_contact` are independent of `search.discoverable`: a candidate may grant an employer they applied to without being searchable. |
| DEP-4 | Org blocklist (INV-T40) and `BR-T069` restriction are checked in policy in addition to consent and are never represented as scopes. |
| R-APP | `application.share_snapshot` is written in the same transaction as the application and its `application_consent_snapshot.consent_record_ids`; the apply screen must show the exact items and org (privacy design section 3). |
| R-RET (REVW-26) | When `application.share_snapshot` expires, the org's identifiable copy of the candidate record is pseudonymised unless the org holds a documented basis. DATA-021's "platform max 24 months" then applies to the pseudonymised record only. Basis and wording to be set with counsel under OPEN-08; DATA-021 itself is not edited by this change. |
| R-EXP | Expiry sweeper notifies 14 d before expiry (SPEC-G1 section 5), then bumps `consent_epoch` once at expiry. |
| R-VER | Each grant stores `policy_version`. A version bump of a scope's text makes the earlier grant not live until re-confirmed. |

## 8. Machine-readable source (feeds FF-12)

```yaml
# consent-scopes v1.0 - the only list from which DB CHECK, OpenAPI enum, DT-01 header and privacy table ids are derived
scopes:
  - {id: profile.public_view,          legacy: [],                          pur: PUR-02, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: true}
  - {id: search.discoverable,          legacy: [CS-DISCOVER],               pur: PUR-21, grain: audience,       grantee: all_verified_orgs, target: null,        default: "off",     toggle: true,  offered: true}
  - {id: matching.recommend,           legacy: [],                          pur: PUR-06, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: true}
  - {id: outreach.recruiter_contact,   legacy: [CS-CONTACT],                pur: PUR-07, grain: audience,       grantee: all_verified_orgs, target: null,        default: "off",     toggle: true,  offered: true}
  - {id: evidence.share_summary,       legacy: [CS-EVID-SUMMARY],           pur: PUR-22, grain: audience,       grantee: all_verified_orgs, target: null,        default: "off",     toggle: true,  offered: true}
  - {id: evidence.share_artefact,      legacy: [CS-EVID-ARTEFACT],          pur: PUR-22, grain: grantee_object, grantee: org,               target: evidence, target_optional: true, default: "off",     toggle: true,  offered: true}
  - {id: profile.share_contact,        legacy: [CS-CONTACT-DETAILS],        pur: PUR-22, grain: grantee,        grantee: org,               target: null,        default: "off",     toggle: true,  offered: true}
  - {id: application.share_snapshot,   legacy: [CS-APPLICATION],            pur: PUR-05, grain: application,    grantee: org,               target: application, default: at_apply, toggle: false, offered: true}
  - {id: evidence.share_institution,   legacy: [],                          pur: PUR-18, grain: grantee,        grantee: institution,       target: null,        default: "off",     toggle: true,  offered: true}
  - {id: alumni.share_outcomes,        legacy: [CS-ALUMNI],                 pur: PUR-23, grain: grantee,        grantee: institution,       target: null,        default: "off",     toggle: true,  offered: true, field_set: true}
  - {id: ai.assist.process,            legacy: [],                          pur: PUR-10, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: true}
  - {id: analytics.product,            legacy: [],                          pur: PUR-14, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: true}
  - {id: comms.marketing_email,        legacy: [],                          pur: PUR-13, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: true}
  - {id: data.research_aggregate,      legacy: [],                          pur: PUR-20, grain: account,        grantee: null,              target: null,        default: "off",     toggle: true,  offered: false}
retired:
  - {id: evidence.share_recruiter, replaced_by: [application.share_snapshot, evidence.share_artefact, evidence.share_summary]}
```

## 9. Open items

| ID | Item | Owner |
|---|---|---|
| OPEN-CS-01 | Confirm "no consent cache" meets the read latency budget; otherwise adopt the R1-fallback cache. | Backend Architect |
| OPEN-CS-02 | Confirm the placeholder bounds R4 to R8 and R10 (no measured evidence yet). | Privacy Lead + SRE |
| OPEN-CS-03 | Confirm DEP-2 (embeddings need `matching.recommend`). | Search Architect |
| OPEN-CS-05 | Default expiry of `profile.share_contact` (SPEC-G1 stated none; {12 months} proposed). | Privacy Lead |
| OPEN-CS-06 | Whether institution cohort aggregates (k >= 5) are gated by `evidence.share_institution` or rest on the institution contract: PUR-18 says both, DT-01 row 10 names no scope. | Privacy Lead + Institutions PM |
| OPEN-08 | Retention window after consent end (R-RET); DATA-021 alignment. | Privacy Lead + counsel |
| OPEN-B10 | Whether `data.research_aggregate` is offered at all. | Counsel |

## 10. Generation and lint rule (FF-12)

FF-12 (in CANONICAL_INVARIANTS) fails CI when any of the following disagree with the section 8 block: (1) the DB `consent_record.scope` CHECK and `consent_grain_ck`; (2) the OpenAPI `ConsentScope` enum (single component, referenced by `ConsentState`, `ConsentRecord`, `ConsentGrantInput` and the `{scope}` path parameter); (3) the scope list in the DT-01 header; (4) the scope column of the PRIVACY processing-purposes register and the revocation table; (5) every backticked id matching the section 1 regex with an area in section 1 that appears in a `require_consent(` call; (6) any remaining legacy `CS-*` token or the retired `evidence.share_recruiter` outside this catalogue's crosswalk, explicit "was `CS-...`" / "retired" annotations and the review reports. Until the generator exists, the same check runs as a documentation lint over this folder.

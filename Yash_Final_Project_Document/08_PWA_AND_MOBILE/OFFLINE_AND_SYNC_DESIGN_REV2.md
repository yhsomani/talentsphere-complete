# Offline and Sync Design - Revision 2 (review fixes)

Doc ID: OFF-01-REV2 · Owner: Frontend/Platform Architecture (PWA engineering) · Version 2.0 · Status: Under Review

> **Folded into `OFFLINE_AND_SYNC_DESIGN.md` on 2026-10-27.** Change record only; edit the original.
Relates: ADR-T10 (amended by ADR-T10a, proposed), ADR-T08, INV-T10, INV-T13, INV-T15 · REVW-14, REVW-15, REVW-24 · REV-RES · OFF-01, PWA-01, PLT-01, HC-01, MFA-01, PROGRESSIVE_UX_AND_FEEDBACK (UX-07)

Tags: [CONF] [TARGET] [OPEN]. This file is **additive**. `OFFLINE_AND_SYNC_DESIGN.md` (OFF-01) is unchanged and remains the detailed design. Where this revision states a different rule, this revision governs and the superseded OFF-01 section is listed in section 8. Supersession here is a relationship between documents, not a deletion. Numbers are [TARGET] starting values; none is a benchmark.

## 0. Phase scope: what ships in Phase 1 (REVW-24)
OFF-01 specifies a large subsystem (IndexedDB schema, locks, three-way merge, purge, migration, Background Sync) for four operation types whose value is unevidenced: no research on low-connectivity use exists, personas are hypothetical (OPEN-07), and the platform facts the outbox works around are unverified on devices (OPEN-12). ADR-T10's own revisit trigger is "research shows low-connectivity core use".

| Capability | Phase 1 | After the ADR-T10 trigger fires |
|---|---|---|
| Offline app start from the service worker (class FO) | **Yes** | Yes |
| Read cache for the owner's own data (class RO, OFF-01 section 2 TTLs, "as of" labels) | **Yes** | Yes |
| **Local unsent drafts** (class LD, section 1) | **Yes** | Yes |
| Outbox, flusher, Web Locks election, Background Sync, Sync Center, three-way merge, `opSchema` translators (OFF-01 sections 4 OutboxRow, 8, 9, 11 translators) | **No (dormant, not built)** | Activate as specified, with the amendments in sections 2 to 5 |
| Purge on logout, account switch, forced purge (OFF-01 section 10) | **Yes** (applies to caches and drafts) | Yes |
| Downloadable video or media offline | **No** (out of Phase 1 and Phase 2) | Revisit by new ADR |

**Trigger to build the outbox** (ADR-T10 revisit): telemetry or research shows material core use under poor connectivity. Telemetry to collect from Phase 1 (names are proposals, no PII): `draft.saved_while_offline`, `draft.sent_after_reconnect`, `draft.discarded_unsent`, `draft.unsent_age_s` at send, `submit.failed_network_rate` by route, plus a research question in the user-research plan. The numeric threshold is **[OPEN]**: owner Product Director with Frontend Platform Lead; to be set before the Phase 1 exit review.

## 1. Class LD: local unsent draft (Phase 1)
Class legend addition: **LD** = the user's input is kept on this device as a draft and is sent by an explicit user action when online. Nothing is queued, retried or sent automatically.

| Aspect | Rule |
|---|---|
| Store | `DraftRow` in `ts-acct-<alias>` (OFF-01 section 4), kinds `application`, `profile`, `message`, `note`; account-bound; purged by OFF-01 section 10 |
| Label | Always "Unsent - saved on this device only". Never "Waiting to sync", never "Sent", because nothing will sync by itself |
| Send | User presses the normal action (Save, Send, Submit) while online; the request is an ordinary online write with one `Idempotency-Key` per user intent (UX-07 idempotency rule) stored with the draft |
| Offline press | Control shows "Needs connection to send"; the draft stays. No queue entry is created |
| Reconnect | The page shows "You're back online - send your changes?"; no automatic write |
| Server moved on | If the server `ETag` differs from the draft's `baseEtag`, show a two-way choice (Keep mine / Use theirs / Edit); there is no automatic merge in Phase 1 |
| Expiry | 14 days (section 2 table), warning at 5 days, evicted only with consent |
| Safari 7-day eviction, quota | Unchanged (OFF-01 section 6); a lost draft is the documented limitation |
| Consequential actions | Still online-only. A draft of an application is never a submission (BR-T001, SM-APPLICATION) |

Row-level effect on OFF-01 section 2: rows 6, 17, 25, 28 and 35 (class QW) are **LD** in Phase 1 and **QW** only after the trigger. Their server-side contracts (client-generated ids, `If-Match`) are unchanged and are still the target when the outbox activates.

## 2. One expiry and backoff table (REVW-15), cited by all UX documents
This is the single source of truth for queue and offline timing constants. UX documents cite it and must not restate numbers. Earlier figures (30-day expiry and 1/2/4/8/30 s backoff in UX-07; 2 s x 2^n in OFF-01 section 8.3 with the cap stated only there) are replaced by this table.

| Constant | Value [TARGET] | Applies to | Notes |
|---|---|---|---|
| Draft and queued-item lifetime | **14 days** from creation | LD drafts (Phase 1), queued items (after trigger) | Equals the Idempotency-Key retention required in section 4 |
| Warning before expiry | at **5 days** old: "Old unsynced change" with an explicit decision (send, keep, discard) | LD and QW | Replaces "older than 30 days flagged" in UX-07 and closes OPEN-UX-14 |
| Retry backoff | `delay = 2 s x 2^n`, +/-30% jitter, cap **5 min**; honour `Retry-After` | QW flush only (after trigger); LD has no retries | Replaces "1, 2, 4, 8, 30 s cap" in UX-07 |
| Attempts before "Needs attention" | 8 attempts; the item is never auto-deleted | QW | |
| Circuit breaker | 3 consecutive 5xx or timeouts on different aggregates: pause **60 s** | QW flush, and the online-only retry policy of `host.api` | OFF-01 section 8.3 |
| Flush triggers | App start, `online`, visible, after enqueue if online, 30 s timer while visible with pending items, "Sync now" | QW | Background Sync is an enhancement on Chromium only (PLT-01) |
| Offline read grace | **7 days** since last server session check | RO caches | PWA-01 section 10 |
| Locked data purge | **30 days** without reauthentication | all local data | OFF-01 section 10 (this is a purge limit, not a queue expiry; do not confuse with the 30-day figure above that is withdrawn) |
| Remote or chunk load retry | 2 automatic retries at 500 ms and 1500 ms, then fallback; 10 s bound | module load only ([FED] and lazy-chunk failure) | HC-01 section 7 governs; UX-07's "1/2/4 s, 3 auto-tries" is withdrawn |
| Idempotency-Key retention (server) | **>= 14 days** for any queued-op route that lacks a natural key | see section 4 | REVW-14 |
| Cache TTLs per data class | OFF-01 section 2 and section 5 tables | RO | unchanged |

## 3. Scope amendments (ADR-T10a, REVW-15)
| Item | Decision |
|---|---|
| Queued-write classes (after trigger) | Five: `profile.patch`, `application.draft.put`, `message.put`, `note.put`, **`lesson.progress.put`** (new) |
| `lesson.progress.put` | Progress checkpoints only (position, percent, "viewed"). Natural key: enrolment id + lesson id; server applies a monotonic upsert (max of position, never un-completes). The server alone derives lesson or course completion and any evidence that results (DOM-05); the client never displays "completed" or "evidence earned" until the server acknowledges. Until the outbox is active, lesson progress is **online-only** (the player keeps position in page memory; there is no persisted queue) |
| Assessment attempts and answers | **Online-only. Never queued, cached, persisted locally or replayed.** Assessment items and answers stay on OFF-01 section 7 "never persisted". This removes the SPEC-G3 "answers are kept on this device and sent when you reconnect" behaviour |
| Assessment connection loss (UX contract) | Banner: "You're offline. The timer keeps running on our server. Reconnect to keep working. Answers the server has not received yet may be lost if you close this page." While the page stays open it may retry in memory only. If the attempt expires while offline, the server grades what it received and the UI says so on reconnect (SM-ATTEMPT, SM-ENROLMENT recovery rows must follow this) |
| Downloadable video | Out of Phase 1 and Phase 2 |
| Instructor authoring, saved jobs | Unchanged: online-only; OPEN-FE-13 stays as a revisit item |

OFF-01 section 2 row 21 becomes: Lesson progress = **QW** after the trigger, **ON** before it. Row 22 stays **ON** and adds "answers never leave the page".

## 4. Idempotency admission rule for queued routes (REVW-14 b, c)
A queued write may be flushed up to 14 days after it was made. A route may appear in a remote's `queueableOps` only if **(a)** it declares a natural key, or **(b)** the server retains `Idempotency-Key` records for at least the queue lifetime (14 days). FF-07 is reworded to: "every unsafe operation accepts `Idempotency-Key` **or declares a natural key**"; the manifest validator rejects a `queueableOps` entry whose OpenAPI operation satisfies neither.

| opType | Route shape | Natural key | 14-day key needed |
|---|---|---|---|
| `application.draft.put` | `PUT /me/application-drafts/{jobId}` (client id) | Yes (id in URL; PUT replaces) | No |
| `message.put` | `PUT .../messages/{clientMessageId}` | Yes (create-by-id) | No |
| `note.put` create | `PUT .../notes/{clientNoteId}` | Yes | No |
| `note.put` edit with `If-Match` | same | Partly: a replay after a lost response hits `412` | **Yes** |
| `profile.patch` | `PATCH /me` with `If-Match` | **No** (a replay after success returns `412` and looks like a conflict) | **Yes** |
| `lesson.progress.put` | `PUT .../enrolments/{id}/lessons/{lessonId}/progress` | Yes (monotonic upsert) | No |

`host.api` and the outbox use a **mutation-scoped key**: one key per user intent (`api.intentKey()`, HC-01), identical on every retry of that intent, assigned at enqueue time, never at send time, and never regenerated per call. The previous `'auto'` per-call injection is withdrawn because it defeats retry safety. A resolved conflict is a new intent with a new key. Backend action: BE-01 section 8 retention for these routes must be >= 14 days or the routes must declare natural keys (owner Backend Architect; closes OPEN-FE-12 together with FF-07).

## 5. What is unchanged
OFF-01 sections 1 (principles 1, 3 to 6), 3, 5, 6, 7, 10 (purge), 12 (tests, with the dormant-outbox tests run only after activation) and 13. Phase 1 adds these tests: draft survives reload and offline restart; draft is purged on logout and account switch; offline press of Send creates no network request and no queue row; no assessment item or answer appears in any IndexedDB store or Cache Storage (storage scan after an attempt).

## 6. Session leftovers (REVW-05, frontend side)
The frontend session contract follows SEC-02 section 2.3 and API-STD: access cookie `__Host-ts_at` (`HttpOnly; Secure; SameSite=Lax; Path=/`), refresh cookie `__Secure-ts_rt` (`Path=/api/v1/auth/refresh`, `SameSite=Strict`), CSRF header `X-CSRF-Token`, logout `POST /api/v1/auth/logout`, session view `GET /api/v1/me`. The `/bff/*` namespace is not used. Remaining stale phrases in the originals are listed in section 7 so readers apply this rule.

## 7. Stale wording in unchanged originals (read as corrected)
| Document and place | Stale wording | Read as |
|---|---|---|
| OFF-01 section 1 principle 2; PWA-01 section 11 | queued writes for the four ADR-T10 classes | five classes after the trigger; Phase 1 = local drafts only |
| OFF-01 section 2 row 3 | "BFF cookies" | session cookies per SEC-02 section 2.3 |
| OFF-01 section 8.3 retry row | backoff as the only statement | section 2 table |
| OFF-01 section 8.4 | "retention >= outbox TTL" as a request | admission rule in section 4 |
| PWA-01 section 10 heading and FEA-01 section 12 "cookies via BFF ... SameSite=Lax" | BFF, single SameSite value | access cookie `SameSite=Lax`, refresh cookie `SameSite=Strict`, no BFF namespace |
| MOB-01 section on tokens | "BFF-cookie based" | session-cookie based |
| DESIGN_SYSTEM `host.fetch` row, NAV confirm-email row | "same-origin BFF" / "posts to BFF" | same-origin `/api/v1` |
| SPEC-G3 (folder 05, not edited here) | assessment answers replay | online-only (section 3) |

## 8. Supersession map (relationship only; originals unchanged)
| This revision | Supersedes (in OFF-01 unless stated) |
|---|---|
| section 0 | section 1 principle 2 and the scope implied by sections 4, 8, 9 for Phase 1 |
| section 1 | section 2 rows 6, 17, 25, 28, 35 (QW) for Phase 1 |
| section 2 | section 8.3 retry row; UX-07 sections on reconnect, expiry and remote retry; PWA-01 section 10 grace figures stay |
| section 3 | section 2 rows 21 and 22; section 4 `OutboxRow.opType`; HC-01 `OpType`; SCH-01 `opType` (see `REMOTE_MANIFEST.schema_REV2.json`) |
| section 4 | section 8.4 and OPEN-FE-12; FF-07 wording; FEA-01 section 7 Idempotency row; HC-01 `idempotencyKey` |

## 9. Items for the governance pass
ADR-T10a (this file, sections 0, 3, 4); FF-07 rewording; OPEN item for the outbox trigger threshold (owner Product Director); close OPEN-UX-14, OPEN-UX-13 stays open; SPEC-G3, SM-ATTEMPT, SM-ENROLMENT and BE-01 section 8 need matching edits by their owners.

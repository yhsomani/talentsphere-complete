# Progressive UX & Feedback — Loading, Lists, Bulk Work, Truthful Progress, Sync States, Failure & Conflict

Doc ID: UI-07 · Owner: Interaction Design Lead · Version 1.0 · Status: Under Review · Relates: ADR-T03, ADR-T08, ADR-T10, ADR-T18, INV-T09, INV-T10, INV-T13, BR-T003, FF-09, UI-05, UI-06

> **Revision 2 folded in (2026-10-27)** from `UX_REVIEW_FIXES.md`: appended under "Revision 2 additions"; where it differs from text above, the appended text governs. Status unchanged; proposals still need owner/ARB ratification.

Supersedes nothing; linked from the folder index and `MASTER_INDEX`. All rules **[TARGET]**. Numeric thresholds are design starting points to be tuned with telemetry; they are not measured results.

## 1. Loading states

| Situation | Pattern | Rules |
|---|---|---|
| Route shell → remote code loading | `RemoteSkeleton` (page-level) after **150 ms**; before that, keep previous page visible with `aria-busy` | Skeleton shows page chrome (title placeholder, 2–3 shape-matched blocks), never spinner-only; keeps shell nav interactive |
| Data load for known layout (lists, cards, tables) | Shape-matched `Skeleton` (rows/cards) | Appears after 150 ms, remains ≥ 300 ms once shown (no flash); same count as expected page size (max 6 rows placeholder); `aria-hidden`; region `aria-busy="true"` |
| Short action (< 1 s expected) | Button `loading` state (spinner inside, label kept, `aria-busy`) | Do not disable the control (keep focus); ignore repeat activation; reuse same `Idempotency-Key` on retry |
| Long wait (> 5 s) | Switch to labelled status: "Still working… this can take up to a minute" + Cancel if cancellable | Never show a time estimate unless the system has a measured one (see §5) |
| Background refresh (stale-while-revalidate) | Keep stale data visible, small "Updated 2 min ago" + refresh indicator; on change, no layout jump; changed rows flagged for screen readers only if user is in that list | Offline: "Showing saved copy from 14:02" (INV-T13: caches are never authoritative) |
| Skeleton under reduced motion | Static tone, no shimmer | UI-05 §5 |
| First visit / cold start (PWA) | App-shell from service worker, then skeleton | Never a blank white screen > 1 s: inline critical CSS + shell frame |
| Images / avatars | Reserved box (aspect ratio) + initials/blur placeholder | Prevent layout shift (CLS target < 0.1 [TARGET]) |

## 2. Empty, error and permission states (common vocabulary)

| State | Message pattern | Actions |
|---|---|---|
| First-use empty | "No evidence yet — add your first item" + why it helps | Primary CTA |
| Filtered-empty | "No jobs match these filters" + which filters | "Clear filters", "Save this search" |
| Permission-empty | "Ask your org admin for access" | Request access |
| Consent-hidden (recruiter) | "Hidden by candidate" | Request access (ACT-PIPE-14) |
| Error (retryable) | Plain cause + "Try again" + trace id | Retry, Report problem |
| Error (not retryable) | What to do instead | Back / Contact support |
| Offline, nothing cached | "You're offline and this page isn't saved on this device" | Retry when online, go to cached areas |

## 3. Pagination vs infinite scroll vs virtualization

| Surface | Choice | Why / rules |
|---|---|---|
| Job search results (SCR-OPP-01) | Cursor pagination with **"Load more"** (page size 20); URL keeps `cursor`/filters; position restored on back | Infinite scroll rejected: breaks footer access, keyboard, focus restore. Focus moves to first new item; count announced |
| Applications, notifications, messages | Load more (20) / reverse chronological with "Jump to unread" | |
| Admin tables (audit log, directory, queues) | Numbered cursor pager + page-size select (25/50/100); sticky header; export capped | Deterministic for support references |
| Pipeline board column | Each column lazy-loads 25 cards then "Load more in this column"; column counts from server; **virtualize a column only above 200 cards** (`react-window`-class) | Virtualization preserves `aria-setsize/posinset`; keyboard "move" works on unmounted cards by menu on the focused card; Find-in-page limitation noted → in-board search provided |
| Candidate table (hiring list view) | `role="grid"` + virtualization above 300 rows; `aria-rowcount`; keyboard roving; "select all N" explicit | List view is the accessible default; board view optional |
| Long static lists (<100) | Render all | Simpler, accessible |
| Messages thread | Windowed (last 50 + older on demand) with sticky date separators | New message live-announced only if composer focused elsewhere is **not** disrupted |
| Skills / tag pickers | Typeahead with server search, max 10 results | |
| Rule | Always show total (or "100+") only when server reports it; never guess totals | Truthfulness |

## 4. Bulk operations: per-item status, bounded concurrency

Applies to: bulk stage move, bulk message, bulk reject-with-reason (human-confirmed, INV-T09), bulk invite (org/institution), bulk shortlist add, institution credential issuance, bulk export of own data components.

### 4.1 Rules

| # | Rule |
|---|---|
| 1 | **Server-side job, client-visible ledger.** The client creates an *operation* (`op_id`) with a list of item ids (max **200** items per operation; beyond that, require filter-based operation with server snapshot). The server executes items with **bounded concurrency** (default 4 workers/op, 16/tenant) as background jobs; the UI polls/streams per-item state. Browser tab closing does not cancel the job; progress is resumable at `/hiring/jobs/:id/bulk/:opId` (SCR-HIR-12). |
| 2 | Every item carries its own idempotency key `opId:itemId` (INV-T10); retried items cannot double-send messages or double-move stages. |
| 3 | **Per-item states**: `queued · running · succeeded · failed(reason) · skipped(reason) · needs-attention`. `skipped` e.g. item changed meanwhile, no consent scope, already in target. Partial success is a normal outcome, not an error banner. |
| 4 | Preview before commit: the confirmation dialog lists count, a sample of first 5 names, any **ineligible** items with reasons, and consequence text (e.g. candidates will be notified, using which template). Destructive/adverse operations (reject-type) require a reason category and **explicit confirm per batch**, never auto-run from scores or AI (INV-T09); AI may suggest candidates for review but cannot pre-tick for reject. |
| 5 | Summary counters (`12 succeeded · 1 failed · 2 skipped · 25 queued`) come only from server-confirmed items; never from optimistic client counters. |
| 6 | Controls: **Cancel remaining** (stops queued items, running items finish, completed items are not rolled back — copy states this), **Retry failed**, **Download results (CSV)** (ids + status + reason, no PII beyond what the user could already see). |
| 7 | Notifications: completion notification to the initiator in-app; email only if > 2 min runtime and user opted in. |
| 8 | Rate limits: org-level outreach quotas (ROLE-REC outreach quota) pre-checked; quota shown in the dialog ("38 of 100 outreach messages left this month"). |
| 9 | Accessibility: polite status line "12 of 40 processed, 1 needs attention" updated at most every 5 items or 10 s; per-item list is a real table with status text + icon; focus is not stolen when states change. |
| 10 | Locking: items in a running op show a lock chip and cannot be edited by the same user in another op; others see "Being updated". |

### 4.2 Item state visual mapping

| State | Icon | Text | Colour token |
|---|---|---|---|
| queued | clock | Waiting | text-3 |
| running | spinner/static dot (reduced motion) | Working | info |
| succeeded | check | Done | success |
| failed | alert-triangle | Failed — `reason` + Retry | danger |
| skipped | minus-circle | Skipped — `reason` | warning |
| needs-attention | flag | Needs your decision | warning |

### 4.3 Bounded concurrency on the client

Client-side parallelism applies only to short, independent reads (e.g. prefetch candidate cards): max **4** concurrent requests per surface, **6** per origin for the whole page, AbortController on navigation. Mutations in bulk always go through the server op (§4.1.1), never a client `Promise.all` loop.

## 5. Truthful progress

| Case | Allowed display | Forbidden |
|---|---|---|
| File upload | Determinate bar from transport bytes (fetch upload progress / XHR); after 100 % bytes show **"Uploaded — scanning for safety"** (indeterminate, BR-T003); then "Ready" or "Blocked: reason". Artifact not visible to others until clean | Bar jumping to 100 % at start; "Processing 99 %" |
| Server job with known item counts (bulk, import) | Determinate by counts: "17 of 40" | Time-remaining estimates unless derived from ≥ 10 completed items **and** labelled "about"; not shown for variable-cost items |
| Server job with unknown work (resume parsing, report generation) | Indeterminate + status text + elapsed-time at 5 s + Cancel/"Notify me when done" | Fake staged percentages, rotating "Analysing… Optimising…" messages |
| Multi-step flows (onboarding, application) | "Step 2 of 5" because steps are fixed and enumerable; do not label as completion % of profile quality | A "profile 80 % complete" score implying quality; if used, define "sections filled" with link to what counts |
| Course progress | % of lessons the **server** has recorded as completed (lesson completion is server-confirmed, ACT-LRN-05) ; resume point | Auto-incrementing on video play without server confirmation |
| Assessment timer | Server-authoritative remaining time with clock-skew correction; local ticker only between syncs | Client-only timer as truth |
| Verification / reference status | State names (`Requested · Opened · Submitted · Expired`) with timestamps; "We'll tell you when Priya responds" | Percent bars, "almost verified" |
| Matching | "Based on 6 of 9 signals" showing which are missing | Confidence bar with false precision |
| AI generation | Indeterminate + "AI suggestion" label; can be cancelled; budget-exhausted state is explicit (INV-T07) | Pretending latency is work |
| Billing | After Stripe redirect: "We're confirming your payment…" until **webhook-derived** entitlement appears (INV-T17); poll with backoff to 60 s; then "Still confirming — we'll email you and your plan will update here" | Granting access on redirect success |

## 6. Optimistic vs confirmed vs pending-sync

### 6.1 Classification

| Class | Definition | UI behaviour | Examples (ACT ids) |
|---|---|---|---|
| **Optimistic** | Reversible, low-stakes, idempotent, server very likely to accept | Update UI immediately; subtle "saving" glyph; on failure revert with toast "Couldn't save — undone" and keep user input | save/unsave job (ACT-JOB-07), mark notification read (ACT-NTF-01), archive thread (ACT-MSG-04), toggle field visibility *draft* |
| **Confirmed** | Consequential, externally visible, irreversible, money, consent, or affects another person | Disable duplicate submit, show in-progress state, **update only after server confirms**; success is a persistent inline confirmation + toast | submit application (ACT-APP-03), publish job (ACT-HIRE-03), stage change (ACT-PIPE-01/02), send offer (ACT-PIPE-11), consent change (ACT-PRV-01/02), erasure (ACT-PRV-06), role change (ACT-ORG-02), support grant (ACT-SUP-01), billing |
| **Pending-sync (queued offline write)** | **Only** the ADR-T10 set: application drafts, profile edits, message compose, notes | Local save instantly; item shows **"Waiting to sync"** badge + time; global sync indicator; on reconnect server revalidates each write (INV-T13) | ACT-APP-02 (draft), ACT-PRO-01 (profile edit), ACT-MSG-01 (compose — queued, marked "Not sent yet"), ACT-PIPE-08 (note) |
| **Online-only** | Everything else | Control disabled with reason "Needs connection"; no queueing | submit application, upload evidence, stage change, consent |

Evidence creation is **online-only** in the target (not in the ADR-T10 set); the form keeps a **local, unsent draft** (not a queued write) so nothing is lost, and shows "Needs connection to save to your library" [OPEN-UX-13 asks whether evidence drafts should join the queue set; decision belongs to ADR owners].

### 6.2 Sync indicator and queue

| Element | Spec |
|---|---|
| Global indicator (TopBar) | `Synced` / `Waiting to sync (3)` / `Sync problem (1)`; icon + text; button opens Sync panel |
| Sync panel (`ACT-SYS-05`) | List of queued items with kind, summary, age, status (`waiting`, `sending`, `needs-attention`), **Retry now**, **Discard**, **Open item** |
| Ordering | FIFO per resource; independent resources parallel (max 2) |
| Reconnect | Auto-flush with backoff (1, 2, 4, 8, 30 s cap) while page visible; on iOS no background sync is assumed — flush on app open/foreground (RES-01 R2) |
| Server outcomes | `accepted` → item leaves queue, toast "3 changes synced"; `rejected` (policy, validation, stale) → `needs-attention` with reason + "Review"; `conflict` → conflict flow (§8) |
| Expiry | Queued items older than 30 days flagged "Old unsynced change" and require explicit decision [OPEN-UX-14] |
| Consequential guard | A queued **message** shows "Not sent yet" in thread until accepted; never shown as delivered |
| Draft application | Submit stays online-only; the draft syncs, final check re-validates job still open (BR-T001 one active application per job) |

## 7. Remote-load failure UX (federation) [ADR-T03/T18/T19]

| Failure | Detection | User experience | Recovery |
|---|---|---|---|
| Remote manifest/script fetch fails (network) | `loadRemote` rejects / timeout 10 s | `RemoteError` in `main`: "Couldn't load this part of TalentSphere" + Retry (exponential backoff 1/2/4 s, 3 auto-tries) + "Go to Home" + trace id; shell nav and other remotes stay usable | Auto-retry; if offline, show cached shell + "You're offline" |
| Remote throws at render | `RemoteBoundary` error boundary | Same panel, "Something went wrong here" ; no raw stack; unsaved form data preserved where possible (local draft) | Reload that remote only; report problem |
| Version incompatible with shell/API (`hostContract` mismatch) | Manifest check at registration (ADR-T18) | Shell silently uses **pinned last-known-good** build; shows `Banner` "You're using a previous version of this area while we update" only if feature parity is reduced; logs `remote.fallback` | Self-heals on next release |
| No last-known-good available | — | "This area is temporarily unavailable" + status link + alternative routes (e.g. mobile web link) | Support page; incident banner from platform flags |
| Signed-manifest/SRI mismatch (security) | Integrity check fails | Same generic unavailable panel (no technical detail to user); security event raised | Never auto-bypass |
| Slow remote (>2 s) | Timer | Skeleton, then after 5 s "Still loading… check your connection" | Cancel → go back |
| Chunk 404 after deploy (stale SW) | Load error with hash mismatch | Prompt "A new version is available — Refresh" with form-save safeguard; auto-refresh only on route boundary when no dirty forms | SW update flow |
| Cross-remote link target unavailable | Navigation to unloaded remote fails | Stay on current page with inline error toast + stay-put (do not blank) | Retry |

Rules: the failure of one remote never removes the shell or other remotes (GOAL-08 containment); error surfaces are in-page (not browser alerts); focus handling per UI-06 §6 step 5; every failure carries a trace id; error rates reported per remote and release.

## 8. Conflict resolution UX (ETag/`If-Match`, ADR-T08)

| Situation | UX | Resolution options |
|---|---|---|
| Edit of same record elsewhere (profile, job, template, note) → `412` | Non-modal `Callout` at top: "This was changed elsewhere at 14:12 by you on another device." Dialog **"Review changes"** with 3-column field diff (Your version / Latest / Result) | Per field choose mine/latest; "Keep latest and re-apply my text as a copy" for long text; Save merged (new ETag) |
| Offline queued profile edit vs newer server value | Item in Sync panel "Needs attention — conflict" with same diff | As above; no silent last-write-wins on fields users edited |
| Two recruiters move same application | Server rejects stale `from_stage`; board card snaps back to actual stage with inline notice "Moved to Interview by Dana 1 min ago" | Reapply my move (button) or dismiss; stage changes never auto-reapplied |
| Two people edit the same job | Soft presence hint "Dana is editing" (best-effort); on publish, 412 flow | Merge / duplicate as draft |
| Notes | Append-only model: concurrent notes both kept | No conflict |
| Messages | Append-only; ordering by server time | No conflict |
| Consent | Latest explicit action wins, but UI always reloads current state before showing a change confirmation (stale toggle prevented via `If-Match`) | Re-confirm against current state |
| Deleted underneath | "This item was removed" with option to restore draft text as new | Copy text / discard |
| Rule | Never discard user text without offering copy; never overwrite consequential state without showing the diff; conflict dialogs are keyboard- and screen-reader-complete (table with row headers). |

## 9. Offline and connectivity banners

| Level | Trigger | Banner (non-modal, below TopBar, not covering focus; counted in sticky inset) | Behaviour |
|---|---|---|---|
| Offline | `navigator.onLine=false` **and** failed health probe | "You're offline. You can read saved pages. Changes to drafts, profile, notes and messages will sync later." | Online-only controls disabled with reason; cached data labelled "Saved copy from `time`" |
| Poor connection | Probe latency > 3 s or ≥ 2 timeouts in 30 s | "Connection is slow. Some actions may take longer." (dismissible for session) | Increase timeouts; keep optimistic items |
| Reconnected | Online after offline | "Back online — syncing 3 changes…" then `status` toast "3 changes synced" ; or "1 needs your attention" linking to Sync panel | Auto-flush |
| Server degraded | Platform flag / 5xx burst | "Some features are slow or unavailable. Status: `link`" | Read-only mode for affected features |
| Maintenance | Flag | Scheduled notice ≥ 24 h ahead | |
| Rules | Banner `role="status"`, announced once per transition; never repeated; no colour-only; offline state also shown in Sync indicator; privacy: offline cache holds only owner data and is cleared on logout (ACT-ACC-07) |

PWA install and push prompts follow the platform matrix (FF-09): the in-app "Install" explainer appears after the user completes a meaningful action (e.g. first evidence), never on first load; iOS shows Add-to-Home-Screen instructions and offers push **only after** installation and an explicit tap (RES-01 R2).

## 10. Feedback catalogue

| Outcome | Channel | Persistence | Example |
|---|---|---|---|
| Saved / small success | Inline status + `host.toast` (polite) | toast 6 s | "Saved" next to field/section |
| Consequential success | Inline persistent confirmation panel + toast + notification entry | persistent | "Application submitted — you can withdraw until `date`" |
| Reversible destructive | Toast with Undo 8 s (server delays commit for the undo window or uses soft delete) | 8 s | "Evidence archived. Undo" |
| Irreversible | Confirm dialog before; after: persistent record | persistent | Erasure request receipt |
| Validation error | Field + summary | until fixed | |
| Recoverable system error | Inline `ErrorState` / banner with Retry | until resolved | |
| Blocking error | Assertive announce + inline | until resolved | |
| Long-running completion | In-app notification + (opt-in) email/push | persistent | "Your export is ready" |
| Waiting on others | State chip + timeline entry with dates | persistent | "Waiting for Priya (requested 3 Nov)" |

Anti-patterns: toast-only critical results; modal for success; auto-dismissing errors; confetti for L1–L3 events (celebratory motion allowed only for hire-outcome milestones the candidate sets, respecting reduced motion).

## 11. Idempotency and double-submit handling (UI contract)

Every unsafe mutation generates one `Idempotency-Key` per user intent when the form opens (not per click), reuses it across retries and page reloads (stored with the local draft), and discards it after a terminal response. A duplicate-response (`200` with `Idempotent-Replayed: true`) is rendered as normal success. Network timeout with unknown outcome shows "We're not sure this went through — checking…" then queries the resource/operation status before offering Retry (never an immediate blind resubmit).

## 12. Open items

| ID | Item |
|---|---|
| OPEN-UX-13 | Whether evidence drafts (metadata only) should be queueable offline (extends ADR-T10). |
| OPEN-UX-14 | Retention/expiry of unsynced local queue items (30-day proposal). |
| OPEN-UX-15 | Server support for undo-window soft commits (affects API design). |

# Revision 2 additions (folded 2026-10-27 from `UX_REVIEW_FIXES.md`)

## 1. Institution screens move to MOD-INS (REVW-08)
The platform back-office (MOD-ADM) and the institution workspace (MOD-INS) are different audiences and cadences. Screen IDs gain module-aligned IDs; the old IDs stay valid as aliases so existing citations (for example USER_JOURNEYS) still resolve.

| New ID | Alias (SCREEN_REGISTRY section 8) | Route | Roles | Purpose |
|---|---|---|---|---|
| SCR-INS-01 | SCR-ADM-17 | `/institution` | INSTADM, FAC, proctor | Institution home: aggregate activation, coverage, credentials |
| SCR-INS-02 | SCR-ADM-18 | `/institution/cohorts` | INSTADM, FAC (own) | Cohorts list |
| SCR-INS-03 | SCR-ADM-19 | `/institution/cohorts/:cohortId` | INSTADM, FAC | Cohort detail: members, aggregate skill coverage, consented evidence, notice wording |
| SCR-INS-04 | SCR-ADM-20 | `/institution/credentials` | INSTADM | Issue and revoke institution credentials (authority-verified; `issuer_class` shown, REVW-12) |
| SCR-INS-05 | SCR-ADM-21 | `/institution/members` | INSTADM | Faculty, proctor and staff management |
| SCR-INS-06 | SCR-ADM-22 | `/institution/reports` | INSTADM, FAC (aggregates) | Outcomes reports and exports (aggregate only, small-cell suppression) |

Columns not listed (primary and secondary actions, APIs, states, offline and a11y codes) are those of the aliased row. Updated counts: MOD-ADM **16** screens (SCR-ADM-01..16), MOD-INS **6**; total stays **130**. SCREEN_REGISTRY title "seven remotes" reads "eight remotes". The institution `Offline` mode stays **O-x** (no cache; consent must be immediate, INV-T15).

Action references (ACTION_REGISTRY section 19 and ACT-ORG-02) read as: ACT-INS-01 INS-01/02 · ACT-INS-02 INS-02/03 · ACT-INS-03 and ACT-INS-04 INS-04 · ACT-INS-05 INS-01/03 · ACT-INS-06 INS-03/06 · ACT-INS-07 INS-05 · ACT-INS-08 INS-03 · ACT-ORG-02 HIR-15 and INS-05. Section 19 is titled "INS - institution workspace (8)" and already has its own prefix; only the screen references change.

### 1.1 Navigation (NAVIGATION_ARCHITECTURE)
| Place | Read as |
|---|---|
| Section 2 workspace table, Institution row | Remotes: **MOD-INS**, MOD-LRN, MOD-MSG (not MOD-ADM) |
| Section 2, Platform row | MOD-ADM |
| Section 3.3 institution navigation | Unchanged (routes unchanged) |
| Section 4.8 route tree | Splits into 4.8 MOD-ADM (`/admin/*`, SCR-ADM-01..16) and 4.9 MOD-INS (`/institution/*`, SCR-INS-01..06 in the order above) |
| Route registration contract | Prefix `/institution` is owned by MOD-INS; `/admin` by MOD-ADM; in bundled mode the same ownership check runs at build time |
| Deep-link and redirect RD-03 | unchanged |

Delivery note for designers: a user with only an institution role never needs back-office chunks; back-office chunks are served only to sessions with `admin.console` (FD-14), so a user who holds both roles sees both workspaces in the switcher and loads each on first entry.

## 2. Offline UX for Phase 1 and the single constants table (REVW-15, REVW-24)
Phase 1 offline = read cache plus **local unsent drafts, no outbox** (OFF-01-REV2 section 0). UX consequences:

| UX-07 place | Read as |
|---|---|
| Section 6.1 "Pending-sync" row; section 6.2 sync indicator and panel; DESIGN_SYSTEM field state `pending-sync`; SCREEN_REGISTRY legend **O-q** | In **Phase 1** the badge is **"Unsent - saved on this device"** (not "Waiting to sync"), the TopBar indicator and Sync panel are not shown, and the screen sends only when the user presses the action while online. The "Waiting to sync" badge, global indicator, Sync panel (ACT-SYS-05) and auto-flush appear only after the outbox activates (ADR-T10 trigger) |
| Section 6.1 set "application drafts, profile edits, message compose, notes" | Five classes after the trigger: add **lesson progress checkpoints**. Assessment answers are never in the set |
| Section 6.2 Reconnect "backoff (1, 2, 4, 8, 30 s cap)" | OFF-01-REV2 section 2: `2 s x 2^n`, +/-30% jitter, cap 5 min; do not restate numbers in UX copy |
| Section 6.2 Expiry "older than 30 days" and OPEN-UX-14 | **14 days**, warning at 5 days (OFF-01-REV2 section 2); OPEN-UX-14 is closed |
| Section 7 remote-load retry "1/2/4 s, 3 auto-tries" | 2 automatic retries at 500 ms and 1500 ms, 10 s bound (HC-01 section 7 / OFF-01-REV2 section 2) |
| ACT-SYS-04 "Report a problem" offline "queued locally [OPEN]" | Phase 1: kept as an unsent local draft with "Needs connection to send"; it is not a queued class |
| SCR-LRN-04 course player "notes queue" | Phase 1: local unsent note; after the trigger `note.put` |
| SCR-CAND-02 onboarding "Steps 1, 2, 4 work (queued)" | Phase 1: steps work as local drafts; step 3 and finish need a connection |

Draft copy, in Phase 1: "Unsent - saved on this device only. Connect to send." On reconnect: "You're back online. Send your changes?" (no automatic send). Conflict (server version moved): two-way choice Keep mine / Use theirs / Edit (no auto-merge in Phase 1).

### 2.1 Assessment connection loss (supersedes SCR-LRN-09 behaviour)
SCREEN_SPECIFICATIONS_KEY section 13 "Connection loss" currently says answers are kept on this device and sent on reconnect, and "Autosave" says a failed save "keeps local buffer". Both are withdrawn: assessment answers are online-only and are not persisted or replayed (ADR-T10a; OFF-01 section 7 "never persisted"). New contract:

| State | Behaviour |
|---|---|
| Autosave failure | "Not saved - reconnect to keep working." The page may retry **in memory only** while it stays open; nothing is written to IndexedDB or Cache Storage |
| Connection loss | Banner: "You're offline. The timer keeps running on our server. Reconnect to keep working. Answers the server has not received yet may be lost if you close this page." |
| Expiry while offline | The server grades what it received; on reconnect the UI states this plainly (unchanged) |
| Technical interruption | Reported as such, never as an integrity anomaly (INV-T20) |
| Tests | After an attempt, a storage scan finds no item or answer in IndexedDB or Cache Storage |

SCR-LRN-09's registry cell "connection loss (autosave queue limited, ...)" reads "connection loss (online-only, in-memory retry while open)".

## 3. iOS push wording (REVW-37)
Wherever the install-gated iOS push behaviour is described (ACT-NTF-04 precondition, UX-07 section 9 install and push paragraph, SCR-ACC-04 and SCR-ACC-06 notes) cite the canonical marker from PWA-01-REV2 section 1: "(V(src), PLT-01; not device-verified)". RES-01 R2 is not the citation.

## 4. Idempotency (REVW-14 b)
UX-07 section 11 already says one `Idempotency-Key` per user intent, created when the form opens, reused across retries and reloads and stored with the local draft. That text stands and is the UI half of the rule; `host.api.intentKey()` implements it (HC-01 revised). ACTION_REGISTRY line 11 ("one key per user intent") is consistent; the earlier host behaviour of injecting a fresh key per call is withdrawn (MFA-01-REV2 section 3).

## 5. Bundled-mode wording (REVW-07)
UX-07 section 7 "Remote-load failure UX" applies to chunk-load failures in bundled mode (same screen, copy and retry) and to remote-load failures when federated. Copy must say "this part of TalentSphere", never "remote". The section 7 text "federation" in its title is read as "module load".

## 6. Supersession map (relationship only)
| This file | Supersedes |
|---|---|
| section 1 | SCREEN_REGISTRY section 8 heading and rows for SCR-ADM-17..22 (IDs become aliases), section 10 coverage table counts for MOD-ADM; NAVIGATION_ARCHITECTURE section 2 Institution row and section 4.8 route tree; ACTION_REGISTRY section 19 screen references |
| section 2 | UX-07 sections 6.1, 6.2, 7 (numbers), OPEN-UX-14; DESIGN_SYSTEM `pending-sync` state wording; SCREEN_REGISTRY offline legend O-q for Phase 1; ACT-SYS-04 offline note |
| section 2.1 | SCREEN_SPECIFICATIONS_KEY section 13 rows "Autosave", "Connection loss"; SCR-LRN-09 registry cell |
| section 3 | ACT-NTF-04 precondition citation; UX-07 section 9 wording |
| section 4 | Nothing; confirms UX-07 section 11 |

## 7. Items for the governance pass
ID_REGISTRY: SCR-INS prefix and aliases; USER_JOURNEYS (folder 02) cites SCR-ADM-17..22 (resolved by aliases, edit optional); OPEN-UX-13 (evidence drafts) remains open; renumber OPEN-UX-* into the global register (REVW-33). Registry totals: MOD-ADM 16, MOD-INS 6, sum 130.



# Patch 2026-10-27: Interaction hazards (UXH-01..UXH-08)

**[TARGET]**, thresholds marked PROPOSED are unmeasured. Each hazard names the rule the UI follows and the action contracts that exercise it ([ACTION_REGISTRY](ACTION_REGISTRY.md) ACT-ATOM-*). Platform mechanisms (idempotency key and status-query endpoint, queue and multi-tab leader election, service-worker update flow) are owned by [13_API_EVENTS_AND_INTEGRATIONS](../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md) and [08_PWA_AND_MOBILE](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2) (pending patch); this section defines only what the person sees.

| ID | Hazard | Rule | Exercised by |
|---|---|---|---|
| UXH-01 | Late response after navigation | Every request is tied to a screen-instance token. A response that arrives after the screen unmounted updates the shared cache only: no toast, no focus move, no announcement. Mutations are NOT cancelled by navigation (the server may already have committed); the outcome appears where the person is now only if it needs attention (failure or conflict) via the notification centre, with a link back. Reads may be aborted with `AbortSignal`. | ATOM-06, 08 |
| UXH-02 | Workspace switch mid-operation | Each mutation carries its origin workspace id. Switching with a dirty form or in-flight mutation shows a guard dialog (Finish here / Switch and keep draft / Cancel). Queued writes keep their origin workspace and flush under it; if the grant was lost meanwhile, the item becomes `needs-attention` with reason, never silently re-targeted to the new workspace. Cached data is keyed by workspace id; no cross-workspace cache reads. | ATOM-05 |
| UXH-03 | Multi-tab | One tab flushes the write queue (leader chosen by the platform mechanism); other tabs show queue state read-only and never flush. Leader tab closing hands over without duplicating sends (mutation ids make replay a no-op). Sign-out, workspace switch and role change broadcast to all tabs; a non-leader tab shows a banner "Signed out in another tab" and clears its drafts according to ACT-AUTH-09. Two tabs editing one record use ETag conflict flow, not last-write-wins. | ATOM-03, 05 |
| UXH-04 | Remote reload / version skew | A new remote or shell version is never applied while the page holds a dirty form, a running attempt (SCR-LRN-09), an open upload or a non-empty queue. Show a status banner "Update ready" and apply at the next route change with a clean state. Forced reload only when the compatibility check fails (ADR-T18) and then only after saving local drafts. | ATOM-09 |
| UXH-05 | Low bandwidth / low memory | Honour `saveData` and the Network Information API where present (progressive enhancement, not a gate): no prefetch, no autoplay, smaller image variants, list pages of 20 not 50 (PROPOSED). Skeletons are fixed height to prevent layout shift. Large lists virtualise (DESIGN_SYSTEM 7.4); evidence previews load on demand; a screen that fails to render for memory reasons falls back to the plain list view, never a blank page. Budgets are owned by 15_RELIABILITY_AND_PERFORMANCE. | all list screens |
| UXH-06 | Announcement noise limits | Live regions: at most one polite announcement per user action; batched results (sync flush, bulk operation, upload set) produce ONE summary, not one per item; progress announcements at most every 5 s or 10 items (PROPOSED); `assertive` only for session expiry and data-loss risk; timers never announce each second (use fixed warning thresholds); repeated identical messages are suppressed for 10 s (PROPOSED). Toasts that carry only an announcement are not also focusable. | ATOM-03, 07, 08 |
| UXH-07 | Retry scope must not duplicate mutations | Retry reuses the SAME idempotency key (one per intent, created at form open). After a timeout or lost response the UI first asks the status query ("Checking...") and only re-sends when the server confirms it never saw the key. "Retry failed" in a batch re-sends only failed item keys. Editing the form after a failure creates a NEW intent and key. Automatic retry applies only to reads and `N`/`K` actions; never to a click on a consequential action without the person's confirmation. | ATOM-02, 07, 11 |
| UXH-08 | Success with lost response | If the response is lost but the server committed, the status query returns the committed result and the UI shows success once. If status cannot be reached, show "We could not confirm this. Check your applications before trying again" with a link to the list; do not offer a plain "Submit again". | ATOM-02, 11 |

## Interaction-hazard acceptance (PROPOSED test hooks)

| Test | Check |
|---|---|
| TEST-UXH-001 | Navigate away during a pending mutation: no toast on the new screen; outcome visible in notifications. |
| TEST-UXH-002 | Two tabs, offline then online: each queued mutation id sent exactly once. |
| TEST-UXH-003 | Screen reader run of a 50-item bulk move produces at most 2 announcements besides the final summary. |
| TEST-UXH-004 | Simulate lost response on submit: exactly one application exists afterwards. |

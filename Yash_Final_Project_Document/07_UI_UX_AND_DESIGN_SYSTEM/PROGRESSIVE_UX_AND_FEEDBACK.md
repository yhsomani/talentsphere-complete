# Progressive UX & Feedback — Loading, Lists, Bulk Work, Truthful Progress, Sync States, Failure & Conflict

Doc ID: UI-07 · Owner: Interaction Design Lead · Version 1.0 · Status: Under Review · Relates: ADR-T03, ADR-T08, ADR-T10, ADR-T18, INV-T09, INV-T10, INV-T13, BR-T003, FF-09, UI-05, UI-06

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

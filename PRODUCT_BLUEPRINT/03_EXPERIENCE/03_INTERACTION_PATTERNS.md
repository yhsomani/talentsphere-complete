# 03 Interaction Patterns

Status: intended design. This file fixes how the product behaves in response to the user, so that two modules never invent different behavior for the same situation. Components are in `02_DESIGN_SYSTEM.md`, routes in `01_INFORMATION_ARCHITECTURE.md`, copy in `06_CONTENT_AND_MICROCOPY_GUIDE.md`, accessibility in `04_ACCESSIBILITY_AND_INCLUSION.md`. Rule ids use area code `IXP` (`NFR-IXP-nnn`); a consolidated list with tests is in section 17.

Legacy input: the 100-pattern micro-interaction register is canonical in `SSOT.md` Appendix D and the contract in `docs/experience/UI_UX_DESIGN_SYSTEM.md` §6 (trigger, user action, state change, immediate feedback, result, next best action). This file keeps that contract and adds the numeric thresholds. [SRC: SSOT.md Appendix D; docs/experience/UI_UX_DESIGN_SYSTEM.md §6]

## 1. The interaction contract

Every interaction specification answers six questions: Trigger, User action, State change, Immediate feedback, Result, Next best action.

### 1.1 Response-time budgets

| Time since user action | Required UI behavior |
|---|---|
| 0 to 100 ms | The control shows its pressed or toggled state. No spinner |
| 100 to 300 ms | Nothing extra (avoid flicker). Optimistic update allowed where section 8.4 permits |
| 300 ms to 2 s | Show an in-place progress cue: button loading state, or skeleton for a region |
| 2 s to 10 s | Skeleton or progress bar plus a text status naming what is happening ("Checking your document") |
| 10 s to 15 s | Add "This is taking longer than usual" and keep Cancel available where cancellation is possible |
| Over 15 s (request timeout default) | Stop waiting: show the error state with Retry; the operation may continue on the server, so the retry uses an idempotency key and the system reconciles |
| Operations over 30 s by design (import, export, report, media processing) | Run as a background task: confirm start, show in the task tray, notify on completion (section 10) |

`NFR-IXP-001` Every user-initiated asynchronous action has exactly one visible pending state, one success outcome and one failure outcome that the user can see without navigating away. Test: for each action in a screen spec, simulate success, failure and 12 s latency.

### 1.2 Next best action

After every completed task the UI offers the most probable next step (after saving a work history item: "Add evidence for this role" and "Done"; after applying: "View application" and "Find similar jobs"). Next best actions are suggestions: at most two, never auto-executed, never blocking.

### 1.3 Idempotency and double submission

Mutating requests carry an idempotency key generated when the form opens (not on click). A second activation within the pending state is ignored; a retry after a network failure reuses the key. Buttons show loading and ignore clicks; `Enter` in a text field does not submit twice. The server returns the original result for a repeated key within 24 hours. `NFR-IXP-002`.

## 2. Onboarding

Principles: value before paperwork; ask only what the next step needs (progressive profiling); every step skippable unless legally or technically required; resumable (`01` `NFR-IAX-026`); show progress honestly; never a modal tour on first load.

### 2.1 Onboarding anatomy

1. **Entry** (`01` section 11) and account creation (IDN): email or SSO, password or passkey, consent to terms (unchecked checkbox with link text, not pre-ticked), email verification can be deferred for browsing but is required before applying, messaging or publishing.
2. **Role intent** (only when the entry did not set it): "What do you want to do first?" single choice cards: Find a job, Learn a skill, Prove my skills, Hire people, Teach or mentor, Manage an institution. Choice sets the first-run checklist, not permanent role; "I'm not sure" is an option and leads to the candidate path.
3. **Setup steps** per path (below), each a full-width step in the `focus` shell with Stepper (`CMP-Stepper`), Back, Skip (where allowed), and Save and continue later.
4. **First-run checklist** on the dashboard (5 items maximum, progress bar, dismissible after 3 are done or manually, reappears on the profile page if incomplete; never blocks).
5. **Contextual coachmarks**: single-use popovers, at most one per session, only on first use of a feature (see 2.6).

### 2.2 Candidate path

| Step | Content | Required | Skip effect |
|---|---|---|---|
| 1 Basics | Name, headline (suggestions), location, work-mode preference | Name, location | None for headline |
| 2 Import | Upload resume (PDF, DOCX), import from LinkedIn export file, or start blank | No | Blank profile |
| 3 Review imported data | Table of parsed roles, education, skills with per-item accept, edit, discard; confidence marks low-confidence fields ("Check this date") | Only if import done | Nothing saved until accepted |
| 4 Skills | Pick 5 or more skills (SkillPicker) with suggestions from step 3 | No (5 recommended: "Profiles with 5 skills get better matches" only if evidence-based) | Empty skills; checklist item remains |
| 5 Goals | Target roles, availability, salary expectation (optional, private by default), job types | No | Defaults: not set |
| 6 Visibility | Choose profile visibility (Private, Visible to recruiters, Public) with plain-language previews of what each shows | Yes: a choice is required, default Private | Cannot skip; default selected |
| 7 Done | Summary and three next steps (Add evidence, Find jobs, Take a skill assessment) | | |

The checklist items afterward: Add one work-history item with evidence, Verify an email or credential, Set job alerts, Take one assessment, Connect with 3 people (shown only when NET enabled). Each item links to the screen and shows estimated time.

### 2.3 Employer path

| Step | Content | Required |
|---|---|---|
| 1 Account | Work email (domain checked against free-mail list: free-mail addresses go to manual verification) | Yes |
| 2 Organization | Company name, website, size band, industry, country; match against existing organizations to avoid duplicates ("Is this your company? Request access") | Yes |
| 3 Verification | Domain email verification or document upload; unverified orgs are labeled "Not yet verified" on job posts and have posting limits (limits set in `OD-UX-12` [PROP]) | Start required, completion later |
| 4 Hiring need | "Do you have an open role?" Yes starts the job wizard; No goes to Brand step | No |
| 5 Team | Invite colleagues (email list, role selection per invite), skip allowed | No |
| 6 Brand | Logo, banner, about, benefits | No |

Checklist afterward: Verify organization, Post first job, Invite a teammate, Set up hiring pipeline stages, Connect calendar, Complete company page.

### 2.4 Institution, mentor and instructor paths

- **Institution admin:** request or provisioned invitation, institution profile, academic structure (departments, programs), import students (CSV template download, preview with row-level errors, dry-run), invite faculty, set placement preferences. Imports follow section 13.5.
- **Student (from institution invite):** confirm institution link (shown plainly: "Your institution will be able to see your course progress and placement status. They cannot see private messages or your job search."), candidate basics, campus tour of three items (assigned courses, upcoming deadlines, placement drives).
- **Mentor application:** profile, expertise and topics, availability preferences, pricing (free or paid), sample answers (2 questions), identity verification, review pending state with expected response window shown as a parameter (`OD-UX-13` [PROP]); the application is saved and resumable.
- **Instructor application:** profile, teaching experience and credentials, first course outline (optional), payout setup (deferred until first paid sale), agreement to content policy; pending-approval state with access to a draft sandbox.

### 2.5 Rules

- `NFR-IXP-003` A required step is required because the product cannot function without it or the law demands it; every required step states why in one sentence under its heading.
- `NFR-IXP-004` No onboarding step collects data that is not used within the same session or documented on the screen. Sensitive categories (demographics, disability, government id) are never collected in onboarding; they are requested in context with purpose text (`06` section 6).
- `NFR-IXP-005` Progress is saved on every step; closing the browser returns the user to the same step with entered data present. Step count shown is real and does not grow after start.
- `NFR-IXP-006` Dismissed onboarding elements stay dismissed (stored per account). A "Show setup guide" item lives under Help to bring them back.
- `NFR-IXP-007` A user who arrived to perform an action (apply, accept an invitation, take an assessment) completes that action first; onboarding resumes after.

### 2.6 Coachmarks and empty-state first use

- Coachmark: a popover anchored to a control with title (max 6 words), body (max 20 words), "Got it" and "Skip tips". Shown once per feature per account, at most one per session, never during a task in progress (form with data, assessment, interview), never on phone for desktop-only controls. Keyboard accessible: focus moves into the popover only if it contains the action; otherwise it is announced politely and dismissible with `Esc`.
- First-use empty states carry the teaching: they explain what the feature is for, show an example (annotated mock or sample data labeled "Sample") and one action. Sample data is always labeled "Sample" and is excluded from metrics.
- Product tours (multi-step overlays) are not used. A "What's new" list in Help covers releases.

### 2.7 Onboarding states

| State | Behavior |
|---|---|
| Loading import parse | Progress with status ("Reading your resume", "Finding skills"), cancel allowed, 60 s limit then "We couldn't read this file. Try a PDF or fill in manually." |
| Import partial | Reviews screen with counts ("We found 4 roles and 12 skills. 2 items need a check.") |
| Email not verified | Banner on dashboard with Resend (cooldown 60 s) and Change email; apply, message and publish actions open a dialog explaining verification is needed |
| Invitation invalid or expired | State per `01` section 10.2 |
| Abandoned | After 3 days with incomplete required steps, one reminder email (opt-out class `onboarding`), none after |

## 3. Forms and validation timing

### 3.1 Principles

Validate when the user can act on the message; never interrupt typing; never block valid users; explain how to fix, not what is wrong; preserve input on every error.

### 3.2 Timing table

| Event | Behavior |
|---|---|
| While typing | No error is shown for the field being typed in. Exceptions: character counters; password rules that tick off as met (a checklist with text "Met"/"Not met", polite announce only on first met-all); username or handle availability after 500 ms idle |
| On blur (leaving the field) | Validate that field's format rules and show the error under it. A required field that was never entered is not flagged on blur (so tabbing through a form is not punished); it is flagged on submit. A required field the user typed into and then cleared is flagged on blur |
| After first error is shown | The field re-validates on every change. The error is removed the moment the value becomes valid (no announcement of the removal); if the value is still invalid the message updates silently and the field keeps `aria-invalid="true"` |
| On submit | Validate all fields client-side; if any invalid: do not send; show error summary; move focus to the summary; first invalid field is the second Tab stop |
| Server validation | Returned errors map to fields by name; unmapped errors show in a notice above the action bar; focus goes to the summary |
| Cross-field rules (end date after start, passwords match) | Evaluated on blur of the later field and on submit; the error attaches to the later field and mentions the earlier |
| Async checks (email taken, handle available, duplicate organization) | Run on blur or 500 ms idle; show "Checking" text with spinner inline; result never blocks typing; submit waits for pending checks up to 3 s then proceeds and lets the server decide |
| Paste | Validate on paste as on blur; trim whitespace; never strip characters silently unless they are known invisible/formatting characters, in which case a note says "We removed extra spaces" |

### 3.3 Submit behavior

- The submit button is enabled whenever the form is not pending, even with errors (`3.4`). Pressing it with errors reveals all errors. When the form is valid, the submit button enters the loading state and the fields become read-only while the request is pending (`aria-busy="true"` on the form) so what is sent matches what is shown; focus stays on the button.
- On success: depends on context: dialogs close and return focus; page forms navigate to the object or show an inline success state with next actions; settings forms show a toast "Saved" and a SaveIndicator.
- On failure: input preserved; focus to summary; button returns to enabled; a network failure shows a notice with Retry (same idempotency key).
- Enter key: in single-line inputs submits only when the form has a single primary action and no multi-line control focused; in Textarea and RichTextEditor, `Enter` is newline and `Ctrl Enter` (`Cmd Enter`) submits where the form is a message or comment.

### 3.4 Disabled submit buttons

`NFR-IXP-008` A submit button is not disabled to signal invalid input. It is disabled only when the form is pending or the user lacks permission (then `aria-disabled` with the reason in text). Rationale: disabled buttons give no reason and are unreachable to keyboard users in some implementations; revealing errors is clearer. Exception: wizard "Next" may be `aria-disabled` while a required async check runs, with status text.

### 3.5 Error summary

- Appears at the top of the form after a failed submit: `CMP-Notice` danger, heading "There is a problem" with count ("2 things need fixing"), a list of links: each link text is the error message with the field label, and activating it moves focus to the field (and scrolls it into view, accounting for sticky headers by 80 px offset).
- Focus moves to the summary heading (`tabindex="-1"`); the summary has `role="alert"` once at insertion.
- The summary replaces itself on the next submit; it is not kept in sync live (avoid churn); fixed fields leave the list only on next submit.
- Fields with errors show their message inline as well (same text).

### 3.6 Field-specific rules

| Field | Rules |
|---|---|
| Email | Syntactic check only (no regex over-strictness: one `@`, a dot in domain, max 254); typo hints for common domains ("Did you mean gmail.com?" as a suggestion button, never auto-corrected); lowercase for comparison, preserved for display; plus-addressing allowed |
| Password | Min 12 characters, no composition rules (no forced symbols), blocked if in breach list or contains email local part, strength meter by length and entropy estimate; show/hide; paste allowed; messages say what to do ("Use at least 12 characters"). Final policy owned by IDN |
| Phone | Country selector plus number; format as typed using the country; stored E.164; accept spaces, dashes, parentheses; error "Enter a phone number for {Country}" |
| Name | Single "Full name" field plus optional "Preferred name"; no max beyond 100; no rejection of apostrophes, hyphens, single names, non-Latin scripts, titles; no "first/last" split unless a downstream system needs it (then derive with an "Edit" option) |
| URL | Accept missing scheme and add `https://`; show normalized form; reject non-http(s) |
| Dates | Typed in locale format; calendar optional; work history end can be "Present"; future dates allowed only for expected graduation or scheduled events; error text states the allowed range |
| Money | Currency selector, decimal by locale; min/max with currency; stores integer minor units; the input reformats by locale on blur (grouping separators are accepted when typed and removed from the stored value) |
| Free text | Trim; max length with counter; no HTML; newlines preserved; emoji allowed |
| Address | Structured with country-driven fields; autocomplete; optional second line; never require a state or postal code where the country has none |
| Uploads | Section 13 |
| Consent checkboxes | Unticked by default; required consent blocks only the feature that needs it, not the whole form; errors say "Tick the box to continue" only when the consent is truly required |

### 3.7 Prevent loss

- Input is never cleared on error, session expiry or navigation within the app. Unsaved changes trigger section 9.3. Browser autofill is allowed.
- Long forms autosave per section 8; short forms (login, invite) do not.

## 4. Search, filter and sort

### 4.1 Search

| Aspect | Rule |
|---|---|
| Entry | Search field is `role="search"`; submit on `Enter`; live results (debounced 400 ms) only where results are cheap and the screen is a list of the same type; otherwise submit-on-enter |
| Query in URL | `q` updates on submit and after 400 ms idle; back button restores earlier queries |
| Minimum characters | 1 for local filters, 2 for remote search; shorter shows nothing and no error |
| Suggestions | On focus with empty field: recent searches (up to 5, clearable) and popular or saved searches. While typing: up to 8 type-ahead suggestions (queries and entities), as Combobox |
| Highlighting | Matched terms highlighted with `<mark>` (also visible in HC) in titles and snippets |
| Zero results | "No results for "{query}"." plus: check spelling suggestion (did you mean), remove the most restrictive filter (button per filter, with the count it would return), broaden (related terms), and for jobs "Create an alert for this search" |
| Typos and synonyms | Server-side fuzzy match and synonym expansion; the UI states when a synonym or corrected term was used ("Showing results for "javascript". Search instead for "javascipt"") |
| Result count | Always shown, exact up to 1,000 and "1,000+" above; announced politely after update |
| Saved searches | "Save search" button after a query or filters are applied (names default to a summary, editable), manageable under the screen's "Saved" menu; alerts optional with frequency (instant, daily, weekly) and channel |
| Search scope | Visible chips for scope (All, Jobs, People...). Global palette rules in `01` section 7 |
| Privacy | Search history is per user, deletable, and off by switch in `/settings/privacy`. Employer candidate searches are logged for audit (see ATS) and the user is told |

### 4.2 Filters

- **Placement:** desktop list pages: left filter panel 280 px (collapsible) or a top filter bar with chips, per screen spec; phone: a "Filters" button (with applied count) opens a full-height sheet; bottom of the sheet has "Show N results" (live count, primary) and "Clear all".
- **Applied filters** are shown as removable chips above results (`aria-label="Remove filter {name}: {value}"`), plus a "Clear all" button when 2 or more.
- **Apply timing:** desktop: filters apply immediately on change (checkboxes, chips, selects), debounced 300 ms for text and sliders; results region is `aria-busy` while updating and keeps old results (dimmed 60 percent opacity is not used; a thin progress bar instead) to prevent layout jump. Phone sheet: applies on "Show N results" (batch) because each change would redraw behind the sheet.
- **Facet counts:** each option shows the result count it would produce when known; zero-count options are disabled with `aria-disabled` not hidden (so users learn the option exists), except in lists over 20 options where zero-count options are hidden under "Show all".
- **Filter groups:** collapsible (open by default for the first 3), at most 8 groups visible; long option lists show 5 with "Show more" and an inline search at 10+; the order is by importance not alphabet.
- **Persistence:** filters live in the URL; "Remember my filters" is implicit per screen for saved defaults only on screens flagged `persistFilters` (job search, candidate search); a visible "Filters from your last visit" notice with Reset appears when restored.
- **Range filters** (salary, experience): slider with numeric inputs; "Include jobs without salary" checkbox where missing data excludes items, so users know.
- **Date filters:** presets plus custom range.
- **Location filters:** location Combobox, radius selector, "Include remote" toggle.
- **Invalid or unknown URL filter values** are ignored without an error and removed from the URL on next change.
- **Boolean logic:** within a group values are OR; across groups AND; stated in help text ("Match any of these"); advanced boolean query (employer candidate search) is a separate "Advanced" panel with a query builder (rows of field, operator, value) and a text view; no raw boolean text as the only option.

### 4.3 Sort

- A single "Sort by" select (or column header sort in tables). Options per screen spec; default stated; "Relevance" only exists when there is a query. Sort changes the URL and keeps the filters. Stable secondary sort by id. Sort labels are plain ("Newest first", "Salary: high to low", "Best match").
- Personalized sort ("Best match") is labeled and explains on hover or help ("Based on your skills and preferences"); user can switch to a deterministic sort at any time.
- Sorting never changes pages beyond the first without notice: changing sort resets to the first page and moves focus to the results heading.

### 4.4 Results region behavior

- Focus: after a filter or sort change that was made via keyboard, focus stays on the control; the results heading's live count updates ("48 jobs"). After "Apply" in the phone sheet, focus goes to the results heading.
- Scroll: the page scrolls to the top of results after page changes, not after filter changes.
- Selection state clears when filters change (with notice if items were selected: "Selection cleared because filters changed").

## 5. Bulk actions

- **Selection model:** checkbox per row/card; header checkbox selects visible page (indeterminate when partial); after selecting a whole page, the bulk bar offers "Select all {N} results" which switches to filter-scoped selection (an explicit `all matching filters` mode; the count shown is the count at the time and re-confirmed server-side before executing). Shift-click selects a range; `Space` toggles on focused row; `Ctrl A` in a table (not in an input) selects the page.
- **Bulk bar:** appears sticky at the top of the table (desktop) or bottom above the tab bar (phone); content: "{n} selected", up to 4 actions as buttons, "More" menu, "Clear selection" button. Announced via polite live region ("3 selected"). Focus is not moved when it appears.
- **Eligible and ineligible items:** an action applies to the eligible subset; before executing, if some are ineligible, the confirmation states exactly ("Move 12 candidates to Interview. 3 can't be moved because they are already hired."), with a link to the list of excluded items.
- **Confirmation tiers:** same as 9.2: reversible bulk actions (move stage, tag, add to pool) run immediately with an Undo toast; irreversible or outward-facing bulk actions (reject with email, send message, delete) use a confirmation dialog stating the count and effect, and for more than 50 items the dialog also requires ticking a box "I understand this will notify {n} people" [PROP].
- **Execution:** up to 50 items run synchronously with a progress indicator; more run as a background task with a tray entry, partial progress and a result summary ("48 moved. 2 failed. View failures") with downloadable failure CSV; each item succeeds or fails independently; the operation is idempotent per item.
- **Undo:** within 8 s for reversible operations via toast; background tasks can be reverted from the result summary within 24 hours for supported actions ("Undo for 48 items").
- **Limits:** maximum selection scope 10,000 items; beyond that the UI asks the user to narrow filters.
- **Phone:** long-press a row enters selection mode (visible alternative: a "Select" button in the toolbar); selection mode replaces the app bar with count, Close and actions.
- **Permissions:** a bulk action is shown only if the user has the permission for every item class in scope; otherwise it is disabled with reason ("You don't have permission to reject candidates in this job").
- **Accessibility:** selection state is conveyed by checkbox state, not row color alone; the bulk bar is a `role="toolbar"` with label "Actions for selected items"; result summary is announced.

## 6. Drag and drop

Scope: reorder (lists, sections, lessons, questions, resume sections, pipeline stages), move between containers (kanban cards, files to folders), upload dropping (section 13).

- `NFR-IXP-009` Every drag operation has a non-drag equivalent that is as available: a "Move to" menu or Move up/Move down buttons or an Edit position field.
- **Pointer:** grab handle (6-dot icon, 44 px target on touch) with `cursor: grab`; drag starts after 4 px movement (mouse) or a 250 ms long press (touch, to preserve scroll); the dragged item lifts (elevation 3, 4 percent scale unless reduced motion) and a placeholder (dashed `--ts-border-control` outline with the item's size) shows the drop position; auto-scroll near viewport edges (48 px zone, speed proportional); valid drop targets highlight (2 px `--ts-action-bg` outline plus the label "Drop here"), invalid targets show not-allowed cursor and an explanation on drop ("Hired candidates can't be moved back").
- **Keyboard:** focus the handle or the item; `Space` or `Enter` picks up (announce: "Picked up {name}, position 3 of 8. Use arrow keys to move, Space to drop, Escape to cancel."); `Up/Down` (lists) or `Left/Right/Up/Down` (boards) move one step with an announcement of the new position ("Moved to Interview, position 2 of 6"); `Space` drops (announce "Dropped {name} in Interview, position 2"); `Esc` cancels and returns to the original position (announce "Cancelled").
- **Screen readers:** each draggable item has `aria-roledescription="sortable item"` (or "draggable item"), instructions available via `aria-describedby`; announcements through a dedicated polite live region.
- **Commit:** a move is committed on drop and saved immediately (optimistic with rollback, section 8.4); a failure returns the item to its origin with a toast "Couldn't move {name}. It's back in {column}. Retry"; conflicting concurrent change (item moved by another user) refreshes the board and shows "{Name} was moved by {user}".
- **Undo:** toast Undo for 8 s for moves.
- **Multi-item drag:** if several are selected, drag moves all (badge with count on the ghost); keyboard moves use the bulk "Move to".
- **Constraints:** server rules (stage transitions that need data, e.g. "Rejected" requires a reason) intercept the drop: the card stays in the target and a dialog asks for the reason; cancel returns the card.
- **Touch:** scrolling is not hijacked: dragging starts only from the handle or after long press; horizontal scrolling of boards remains available via edge drag and visible scroll controls.
- **Reduced motion:** no scale and no animated settling; position updates instantly.

## 7. Pagination versus infinite scroll

| Content | Pattern | Reason |
|---|---|---|
| Searchable catalogs where position matters and users share links (jobs, courses, candidates) | Pagination (numbered where total is known, else cursor Previous/Next) with page size 25 default (10, 25, 50, 100 for tables) | Place keeping, footer reachability, back-button restore |
| Admin and operational tables (audit, tickets, users) | Pagination with page size select; cursor above 10,000 rows | Precision, export, counts |
| Feeds and streams (network feed, notifications, activity) | Infinite scroll with a "Load more" button after every 3 loads on desktop; automatic loading on phone | Low stakes browsing; the button guarantees footer access and keyboard access |
| Messages | Reverse infinite scroll (older loaded on scroll up) | Chat convention |
| Short lists (under 50 items known) | No pagination: render all (virtualized above 200) | Simplicity |
| Mobile job search results | "Load more" button (not auto) with page size 20 | Predictable data usage, accessibility |

Rules:

- `NFR-IXP-010` Infinite scroll must meet all of: footer reachable (use "Load more" after threshold or a sticky "Back to top" and footer links duplicated in the menu), keyboard users can reach every item and the end, position restoration after navigating to an item and back (scroll and loaded pages restored from cache for at least 10 minutes), a visible count of loaded and total where known, a status message when more loads ("20 more items loaded") politely announced, an end-of-list message ("You've reached the end"), and a visible loading failure with Retry.
- Pagination: preserves filters; page in URL (`page=` or `cursor=`); changing page moves focus to the results heading and announces "Page 3 of 13, 25 results"; Previous disabled on page 1 with `aria-disabled`; deep pages above 100 pages switch to cursor with "Jump to date" or narrow filters.
- Counts: "1,000+" cap for total counts in search (performance); tables over 1,000,000 rows show approximate counts labeled "about".
- Prefetch the next page when the user is at 70 percent scroll (desktop with good connection only; never under Data Saver or `saveData`).
- Page size changes persist per screen per user.

## 8. Autosave and conflict

### 8.1 What autosaves

| Class | Autosave | Examples |
|---|---|---|
| Drafts of long-form creation | Yes | Job post, course lesson, resume, application answers, post, assignment submission draft, profile section edit |
| Settings with immediate effect | Yes, per control | Switches, theme, notification toggles |
| Transactional or irreversible submissions | No (explicit submit) | Submit application, send offer, submit assessment, pay, publish course |
| Short forms | No | Login, invite, report |
| Messages | Draft saved locally and server side | Composer |

### 8.2 Cadence

- Changes are saved 2 seconds after the last keystroke (debounced) and on blur of the field, on step change, on visibility hidden (`pagehide`/`visibilitychange` with `sendBeacon`), and at most every 30 seconds during continuous typing.
- Each save sends a revision number (the version the client last saw). The SaveIndicator shows states: Saved, Saving, Couldn't save (Retry), Saved on this device only (offline), Conflict.
- A local copy (IndexedDB) is written on every change (throttled 500 ms) so a crash or offline period never loses text; on next open, if the local copy is newer than the server copy, a notice offers "Restore unsaved changes from {time}" or "Discard".
- Network failure: retry with backoff (2 s, 5 s, 15 s, 30 s) then pause with a persistent "Couldn't save. Your changes are safe on this device. Retry" notice. Connectivity back resumes automatically.

### 8.3 Conflict handling

A conflict occurs when the server revision differs from the client's base revision.

1. **Different fields changed, no overlap:** the server merges field-level changes (structured data) and returns the merged result; the client updates silently and shows a toast "Updated with changes from {user}" only if a field the user is viewing changed.
2. **Same field changed, structured data:** dialog "{User} changed this while you were editing" with a two-column compare (Yours, Theirs) per conflicting field, choices per field (Keep mine, Use theirs), default none selected, "Apply choices" disabled until each conflict is chosen.
3. **Rich text documents (job description, course lesson):** compare view with inline diff (additions underlined and green plus "+" mark, deletions strikethrough plus "-" mark: not color only), choices: Keep mine (overwrites), Use theirs (discards mine after copying mine to clipboard offer), Merge manually (opens both in editor with markers) [PROP]. A real-time collaborative editing mode (operational transform or CRDT) is out of scope until `OD-UX-14`.
4. **Soft locks:** for documents where overlapping edits are costly (job post in review, scorecard, offer), the second editor sees "{User} is editing this. You can view it; Ask to take over" with a request flow; locks expire after 5 minutes of inactivity and a heartbeat every 30 s.
5. **Delete versus edit:** if the object was deleted, the editor shows "This item was deleted by {user}. Your changes are kept below. Copy them or Restore the item" (restore only if permissions allow).
6. **Versions:** documents that matter (job, resume, course, policy) keep a version history (last 30 versions or 90 days) with restore; restoring creates a new version.

### 8.4 Optimistic updates

Allowed only when all hold: the action is reversible, the failure rate is low and the user would not be misled by a transient wrong state, no money, legal or messaging effect, and the server will confirm within 3 s. Allowed: bookmark, reorder, tag, mark as read, kanban move (internal), toggle switches. Not allowed: submit application, send message (shows "Sending" state instead), publish, payment, anything that notifies another person, verification, assessment submission. On failure: revert to the previous state within 150 ms, show the error toast with Retry, and announce assertively. Optimistic UI is visually indistinguishable from confirmed except after 3 s pending, where a subtle "Saving..." marker appears.

### 8.5 Offline drafts

Edits made offline are queued in order with their base revisions and replayed on reconnect; conflicts then follow 8.3. The SyncStatus component shows the number queued. Only classes marked "queueable" in the module spec queue; others show "You need to be online to {action}".

## 9. Undo and confirmations

### 9.1 Undo

- Preferred for: delete of a user-owned item that is soft-deletable (resume, post, saved search, note, message in own drafts), archive, move, unpublish, bulk reversible actions.
- Pattern: perform immediately, show toast "{Object} deleted" with Undo (8 s, pause on hover/focus); Undo restores in place with the same id; after the timeout the item is retained in Trash for 30 days where applicable [PROP] (retention classes per module), then purged. Trash is reachable at `/settings/data` and the relevant list.
- Keyboard: Undo toast is reachable by `Alt T` (see CMP-Toast); `Ctrl Z` undoes the last undoable action on the screen when focus is not in a text field (stack depth 1 per screen).
- Not undoable: sending a message externally (a 10 s "Undo send" window is allowed for email-like messages [PROP]), payments, published certificates, notifications already delivered, verification submissions.

### 9.2 Confirmation tiers

| Tier | When | Pattern | Example |
|---|---|---|---|
| 0 None | Reversible, own data, undo available | Immediate with Undo toast | Remove a skill, archive a job |
| 1 Simple confirm | Irreversible, own data, low blast radius | AlertDialog: object named, consequence, Cancel (focused) and Verb-object button | Delete an uploaded document with no dependents; withdraw an application |
| 2 Impact confirm | Affects other people, or many items, or has dependents | AlertDialog listing the impact ("This job has 38 applicants. They will be told the job is closed.") with a checkbox "I understand" for counts over 50 | Close a job with applicants, remove a teammate, reject 20 candidates with email |
| 3 Typed confirm | Destroys a large or regulated body of data, or locks the user out | AlertDialog plus typed object name or word, plus re-authentication if the last strong authentication is older than the window | Delete account, delete organization, revoke API key in use, purge data, delete a course with enrollments |
| 4 Two-person | Operational high risk (admin) | Request goes to a second approver with reason; first user sees "Awaiting approval" | Platform-wide config change, bulk refund over a threshold, impersonation (if allowed), break-glass |

Rules:

- `NFR-IXP-011` Confirmation buttons name the verb and object ("Delete resume"), never "OK" or "Yes". The default focus is Cancel for tiers 1 to 3.
- `NFR-IXP-012` The confirmation states what will happen, what will not, and whether it can be undone, in at most 3 short sentences.
- `NFR-IXP-013` Confirmations are never used for non-destructive actions (Save, Close, Continue) and never repeat (no "Are you sure?" after a confirmed dialog).
- Cooling-off: for account deletion, a 14-day pending-deletion period [PROP] with a banner and a one-click cancel; the dialog states it.
- Fail safe: if the server cannot confirm the action, the item stays and the user is told.

### 9.3 Leave-page confirmation (unsaved changes)

- A form is dirty when any field differs from its last saved or loaded value. Dirty forms (non-autosaving) protect against: in-app navigation (router blocker showing a dialog "Leave without saving? Your changes will be lost." with "Stay" (focused) and "Leave"), closing the tab or reload (`beforeunload` browser prompt), workspace switch (`01` section 6.1), browser back.
- Autosaving forms never prompt; they show SaveIndicator, and if a save is pending they flush before leaving (up to 2 s, then prompt).
- Dialogs with dirty forms intercept `Esc` and close actions with the same prompt; clean dialogs close silently.
- Prompts offer a third option "Save and leave" when a valid save is possible.
- Wizards treat step changes as saves when the step is valid (section 15).

## 10. Notifications UX

Domain: NTF owns channels, templates and preferences. This section fixes the interaction.

### 10.1 Surfaces

| Surface | Purpose | Rules |
|---|---|---|
| Bell and unread badge | Ambient awareness | Count of unread items (max 99+); updates in real time; cleared per item, not by opening the popover |
| Bell popover | Latest 8 items, mark all read, Settings link, "See all" | Opens on click; items are links; `Esc` closes; focus returns to bell |
| Notification center `/notifications` | Full history (90 days default [PROP]), tabs All, Unread, Mentions and actions needed | Filters by type; bulk mark read; infinite scroll with Load more |
| Toast | Result of own action only | Section 7.5 of the design system |
| Banner | Account-level conditions | Priority rules in the design system |
| Inline pill | New content in the current view | "3 new applications. Show" |
| Push (web push, mobile PWA) | Time-sensitive items | Section 10.3 |
| Email | Records, digests, off-platform reach | Opt-out classes in NTF |
| SMS | Only security codes, interview day-of reminders where opted in | Opt-in explicit |
| In-product message center (announcements) | Product news | Separate "What's new"; never in the bell as unread count unless actionable |

### 10.2 Item design

Each notification: type icon, title (who did what, max 90 chars), optional one-line context, relative time, unread marker (dot plus visually hidden "Unread"), and its primary action link. Actionable items (approve, confirm, respond) show a button inline (Confirm interview time) so the user can act without leaving; the action result replaces the item's state ("Confirmed"). Grouping: same type, same object within 1 hour collapse ("5 people viewed your profile" expands). Never group items about different objects. Time is absolute on hover (`<time>`).

### 10.3 Push permission and channels

- The browser permission prompt is never triggered on first load. Pre-permission "soft ask" is a card in context, shown after a moment of value (after applying to a job: "Get a notification when the employer responds?"), with Yes, Not now (snooze 14 days) and Never. Only after "Yes" is the browser prompt shown. If the browser permission is denied, the settings screen explains how to re-enable per browser and offers email.
- Push content is generic on lock screens when the user selects "Hide details" (default for messages and applications: "You have a new message", no names) [PROP]; setting under `/settings/notifications`.
- Frequency caps: per type per user defaults (no more than 3 push per hour, 8 per day non-critical [PROP]); security and interview-time notifications are exempt. Quiet hours (default 21:00 to 08:00 local, user editable) hold non-critical push and email to the morning digest.
- Digest: users choose Instant, Daily, Weekly per category.

### 10.4 Preferences UX

`/settings/notifications` is a matrix: rows are categories (Messages, Applications, Interviews, Jobs for you, Learning, Mentoring, Network, Product updates, Security), columns are channels (In-app, Email, Push, SMS). Required security and account notifications show a locked cell with reason ("Required for account safety"). Changes apply immediately with SaveIndicator; "Pause all non-essential for..." (1 hour, 1 day, 1 week, until I turn on). Each email has a one-click unsubscribe per category (no login needed, confirmation page that offers resubscribe and preferences). Opt-outs honored within 1 minute for in-app and push, 24 hours for email batches [PROP].

### 10.5 Notification rules

- `NFR-IXP-014` No notification is sent for something the user caused in the last 5 seconds (no echo).
- `NFR-IXP-015` No red or numeric badge for non-actionable counts; no badge shows a number the user cannot clear by acting or reading.
- `NFR-IXP-016` Notification language follows the copy guide, uses names and objects, never urgency tricks, and carries no personal data beyond what the channel is allowed to show.
- `NFR-IXP-017` Notification delivery is rate limited, deduplicated by (type, object, window) and never repeated after the user acted.

## 11. Real-time updates

| Aspect | Rule |
|---|---|
| Transport states | Connected, Reconnecting (after 3 s of failure: subtle indicator in the footer of the thread or list "Reconnecting..."), Offline (banner). Exponential backoff with jitter: 1, 2, 4, 8, 15, 30 s cap; resync (fetch missed items since last id) on reconnect; page visible only (pause when hidden after 60 s) |
| Messages | New message appends at the bottom; if the user is within 80 px of the bottom, scroll follows; otherwise a "New messages" pill (count) appears and does not move the scroll; incoming messages announced politely with sender and the first 100 characters only if the thread is focused and the user enabled message announcements (default on in focused thread, off otherwise) |
| Lists and tables | New items do not reorder or insert into the viewport unprompted; an inline pill "N new. Show" above the list inserts them on click; row updates (status change) update in place with a 2 s highlight (outline plus background, no animation under reduced motion) |
| Counters | Update silently except live-region summary every 30 s at most |
| Presence | Shown only inside a conversation or a collaboration object, only to participants, with opt-out (`/settings/privacy`); text alternative "Online"/"Last seen {time}"; candidates' presence is never shown to employers |
| Typing indicator | Text "{Name} is typing", shown within a conversation, expires after 5 s, not announced to screen readers |
| Live status (interview waiting room, assessment proctoring check) | A single status line with `role="status"`; transitions announced once |
| Stale data | Data older than the screen's freshness limit shows "Updated {time}. Refresh" instead of silently refreshing under the user's cursor |
| Collisions | Real-time updates never replace the content of a field the user is editing; they surface through the conflict flow (8.3) |
| Throttle | UI updates coalesce to at most 1 per second per region; high-frequency feeds (leaderboards, live scores) update at most every 5 s |
| Battery and data | On `saveData` or low battery mode, real-time reduces to polling every 60 s |

`NFR-IXP-018` Real-time must degrade to correct behavior via polling or manual refresh; no feature depends on a socket being open to be correct.

## 12. State catalogue and copy rules

Every screen declares which of these states apply (`07` checklist). Each state has a layout, an announcement, and a copy formula (`06` sections 3 and 4). Copy shown here is the exact pattern; module screens substitute the nouns.

### 12.1 Catalogue

| State | Trigger | Layout | Announcement | Copy pattern | Actions |
|---|---|---|---|---|---|
| Loading (initial) | First request in flight | Skeleton of the final layout (design system section 12) | `aria-busy`, status "Loading {region}" | none in skeleton | none; Cancel only for long tasks |
| Loading (refresh) | Re-request with data present | Existing content stays, thin top progress, "Updating" | None | none | none |
| Empty, first use | The user has never created any of this | `CMP-EmptyState` with illustration, heading, explanation of value, one primary action | none | Heading: what this is for ("Show your work"). Body: why it matters, one sentence. Action: verb plus object ("Add work history") | Primary; optional "Learn more" |
| Empty, no results | Filters or search return zero | Compact empty state inside the results area, filters stay | Count live region "0 results" | "No {things} match your filters." | "Clear filters", remove-most-restrictive buttons, "Save this search" where relevant |
| Empty, cleared | User completed or cleared all (inbox zero) | Positive empty state | none | "You're all caught up." plus what is next | Optional link |
| Empty, permission | The list exists but the user may see none | As empty, no hint of hidden items | none | "No {things} to show." | Request access if applicable |
| Success (inline) | Action done, user still on screen | Notice success or inline confirmation card | Polite | "{Object} {past tense verb}." ("Resume saved.") | Next best action |
| Success (page) | Wizard or large task completes | Full success page: check icon, heading, summary, next steps | Heading focus | "You've applied to {Job}." | Up to 2 next actions |
| Partial | Some regions failed or part of an operation failed | Working regions render; failed region shows compact error with Retry; operation summary lists failures | Polite | "We couldn't load {region}." / "{n} of {m} {things} {verb}. {k} didn't." | Retry; View failures |
| Error, recoverable | Network or server failure that retry can solve | `CMP-ErrorState` in region (or Notice in form) | Polite (assertive when blocking submit) | Formula `06` section 3 | Retry; Report a problem after 2 failures |
| Error, not recoverable | Object gone, invalid state | Error state without Retry | Polite | What happened, what it means, where to go | Go to {parent}; Contact support |
| Offline | `navigator.onLine` false or requests failing with network error | Banner (global) plus per-screen indication: cached content marked "Saved on this device" with timestamp; actions that need network are `aria-disabled` with reason | Polite once on change | "You're offline. {What still works.}" | Retry now; View saved items |
| Permission denied | 403 | In-shell state (nav visible) | Polite | "You don't have access to this {object}." + why where safe + who can grant | Request access; Switch workspace; Go home |
| Not found / unavailable | 404, 410 | In-shell state | Polite | "We can't find that {object}. It may have been removed or you may not have access." (private resources use this single sentence by `NFR-IAX-021`) | Go home, Search |
| Session expired | 401 mid-session | Modal "Sign in again" that preserves the page | Alert | "Your session ended. Sign in to continue where you left off." | Sign in; Cancel (leaves, with unsaved prompt) |
| Rate limited | 429 | Notice (inline) near the control, or banner for global | Polite | "You're doing that a lot. Try again in {n} seconds." with a countdown text updated every 10 s (not per second) | Retry becomes enabled at expiry; no auto retry loops |
| Maintenance (planned) | Scheduled window announced | Banner 24 hours ahead with local time window | Polite | "Planned maintenance on {date}, {start} to {end} ({time zone}). {What is unavailable}." | Details link |
| Maintenance (active) | 503 or flag | Static maintenance page from edge; in-app read-only mode when partial | Heading focus | "We're updating TalentSphere. Back by {time}." (no time if unknown: "We'll be back soon.") | Status page link; Subscribe to updates |
| Degraded | Dependency down (payments, video) | Banner plus inline disabling of affected actions with reason | Polite | "{Feature} is temporarily unavailable. {Alternative}." | Status link |
| Restricted account | Suspended or banned | Shell with limited nav | Polite | "Your account is restricted. {Reason class}. You can still {allowed actions}." | Appeal; Export data; Contact support |
| Entitlement locked | Plan lacks feature | `CMP-EntitlementGate` inline | none | "{Feature} is part of {Plan}." plus what it gives | Upgrade; Ask your admin |
| Region unavailable | Legal or availability | Inline notice | none | "{Feature} isn't available in {Country} yet." | Notify me |
| Conflict | Revision mismatch | Dialog (8.3) | Alert | "{User} changed this while you were editing." | Keep mine; Use theirs; Compare |
| Stale | Data older than freshness limit | Inline "Updated {time}" with Refresh | none | "Updated 12 minutes ago." | Refresh |
| In progress (async task) | Background task running | Progress in place and tray entry | Polite at steps | "Importing 240 students. 40 percent done." | Cancel; Continue working |
| Verification pending | Waiting on third party | Status pill and timeline | none | "Checking with {issuer}. Usually done within {time}." (time from observed data, not invented) | Resend; Cancel |
| Read-only | Archived or locked object | Banner in the object | none | "This {object} is archived. You can view it but not change it." | Restore (if permitted) |
| Disabled feature (flag) | Feature flag off | Not shown | n/a | n/a | n/a |

### 12.2 Copy rules for states

1. Say what happened, then what it means for the user, then what to do (three parts, each at most one sentence; omit the middle if obvious).
2. Use the user's nouns ("application", not "record"); no codes in the main sentence; include a reference id in a collapsible "Details" for support (`Ref: 7F3K-92QA`).
3. Never blame the user ("You entered an invalid..."): say "Enter a valid..."; never apologize repeatedly: one "Sorry" at most, for platform faults only.
4. Never promise times the system does not know. Use measured typical durations or no time.
5. No humor in error, permission or legal states.
6. Every state in a list or table region is height-stable with the loaded state (minimum height equals 8 skeleton rows or the empty card height).
7. Retry re-runs the failed request only and focuses the first changed content; after the second failure show "Report a problem".

### 12.3 Retry policy

Automatic retries for idempotent GETs: 2 retries with 1 s and 3 s delay, invisible unless the total exceeds 2 s. No automatic retry for mutating requests (manual Retry with the same idempotency key). 429 and 503 honor `Retry-After`. After a connectivity change from offline to online the failed requests of the current screen retry once automatically.

## 13. File upload

### 13.1 Flow

1. Selection: drop area, "Choose files" button, paste (images in composers), camera capture on mobile (`capture` attribute option), OS share target.
2. Client checks (instant): type by extension and MIME, size, count, image dimensions where relevant; rejected files list with reason, others continue.
3. Upload: direct to storage via signed URL with chunking (5 MB chunks) and resume; per-file ProgressBar with percent and speed-independent text ("Uploading 42 percent"); Cancel per file; up to 3 concurrent.
4. Server processing: virus and content scan, type sniffing, thumbnailing, transcoding (video) or text extraction; file state "Checking" (`PROCESSING`), then "Ready" or "Rejected: {reason}".
5. Completion: file appears with name, size, type icon, preview where possible, Remove, Replace.

### 13.2 Limits and types (defaults [PROP], owned by PLT)

| Use | Types | Max size | Max count |
|---|---|---|---|
| Resume | PDF, DOCX | 10 MB | 1 per import |
| Evidence document | PDF, PNG, JPG, DOCX | 20 MB | 10 per item |
| Profile photo | JPG, PNG, WebP | 5 MB | 1 (crop dialog 1:1) |
| Company banner | JPG, PNG, WebP | 5 MB | 1 (crop 4:1) |
| Message attachment | Common docs, images, archives except executables | 25 MB | 10 |
| Assignment submission | As set by instructor | up to 100 MB | as set |
| Video (course, intro) | MP4, MOV, WebM | 2 GB resumable | 1 |
| Bulk import | CSV, XLSX | 20 MB | 1 |

### 13.3 States and copy

| State | Visual | Text |
|---|---|---|
| Queued | Neutral | "Waiting" |
| Uploading | ProgressBar | "Uploading, 42 percent" |
| Paused (offline) | Warning icon | "Paused. Resumes when you're online." |
| Checking | Info, static icon | "Checking file" |
| Ready | Success icon | "Ready" |
| Rejected: type | Danger | "This file type isn't supported. Use PDF, PNG or JPG." |
| Rejected: size | Danger | "This file is {size}. The limit is {limit}." |
| Rejected: infected | Danger | "We couldn't accept this file because it failed a safety check." |
| Failed (network) | Danger with Retry | "Upload failed. Retry" |

### 13.4 Rules

- `NFR-IXP-019` Uploads are resumable and never lose progress on a flaky connection; leaving the page during an upload prompts (9.3) unless the upload continues in the background through the service worker task tray (supported file classes).
- Previews: images inline (with required alt text field for portfolio and course media where used publicly), PDFs in a viewer (first page thumbnail), others as icon; never auto-open a downloaded file.
- Privacy: filenames are shown but not trusted; EXIF location removed from images on upload by default; the user is told when a file will be visible to others ("Visible to recruiters who view this item").
- Camera and microphone capture require a permission rationale before the browser prompt (in-context card).
- Replace keeps the id and creates a new version when the file is attached to evidence already verified; verification is re-evaluated and the user is told ("Replacing this file will require verification again").
- Scanning delay: files in `PROCESSING` can be attached to a draft but not submitted until Ready.

### 13.5 Bulk import (CSV and spreadsheets)

Download template, upload, parse, **preview with row-level validation** (table: row number, values, status OK/Warning/Error with message; counts: "220 ready, 8 warnings, 12 errors"), options (skip errors, update existing by key, dry run default on), run as background task, result report downloadable (CSV with the error per row). Never import partially without the user having seen the counts and chosen. Duplicates detected by a stated key (email) with the policy shown.

## 14. Media player UX conventions

Applies to course video, interview recordings, mentor session recordings, product demos, audio.

### 14.1 Controls and layout

- Controls bar (visible on hover, on focus within, on pause, on tap; auto-hides 3 s after play start on pointer and touch, never hides while keyboard focus is inside): Play/Pause, Previous/Next lesson (course), Seek bar with chapter markers and buffer, elapsed and total time, Volume and mute, Captions toggle, Settings (speed, quality, caption style, audio track), Picture in picture, Fullscreen, Transcript toggle, Notes (course), Bookmark.
- Seek bar is a slider (`role="slider"`, `aria-valuetext` "2 minutes 10 seconds of 12 minutes"), with chapters listed in a side list as links.
- Layout: video 16:9 with a side panel (outline and transcript) at 1024 and up; on phone the video is pinned at top (sticky) with tabs (Outline, Transcript, Notes, Q&A) below.
- Sizes: controls 44 px targets on touch; controls contrast 4.5:1 over any frame (controls sit on a gradient scrim of 60 percent black).

### 14.2 Keyboard (player focused)

`Space` or `K` play/pause; `Left/Right` back/forward 5 s; `J` and `L` 10 s; `Up/Down` volume 5 percent; `M` mute; `C` captions; `F` fullscreen; `Shift ,` and `Shift .` slower and faster speed; `0` to `9` jump to 0 to 90 percent; `Home/End`; `N` next lesson; `T` transcript; `B` bookmark; `?` shortcuts. Keys apply only when the player has focus; no hijacking page keys. Native controls fallback exists for browsers with their own accessibility.

### 14.3 Behavior rules

- `NFR-IXP-020` No media autoplays with sound. Autoplay of the next lesson is off by default; when on it shows a 10 s countdown card "Next lesson starts in 10. Cancel" with visible text and a Cancel button (pausable, 2.2.2).
- Resume position is stored per user per media (server, 5 s granularity) and offered as "Resume from 12:30" (auto-resumes in the player; "Start over" link). Completion at 90 percent watched or end reached and required checks passed, per LRN rules.
- Speed 0.5 to 2 in 0.25 steps, remembered per user; pitch preserved.
- Quality: Auto default, manual list; on `saveData` or cellular with Data Saver the default is the lowest acceptable; a "Audio only" option for course videos where audio suffices [PROP].
- Captions: on by default if the user's setting says so (`/settings/accessibility`); caption style (size 75 to 200 percent, color, background opacity) saved; every media item must have captions before publish (STU rule); live interview captions (auto) offered with accuracy note.
- Transcript: synchronized, searchable, current line highlighted (outline and background), click to seek, downloadable; screen reader users can read it as text without the player.
- Audio description: where a track exists, a toggle; STU requires description or a text alternative for visual-only content.
- Error states: Loading (poster plus spinner), Buffering (spinner over frame after 1 s stall), Network lost (inline "Connection lost. Retrying..." plus Retry), Unsupported (link to download), Access denied (enrollment needed), DRM or region blocked, Processing (instructor video still transcoding: "This video is still being prepared").
- Offline: downloaded lessons play offline in the PWA where licensed (`05` section 8).
- Analytics: watch time and completion only; no raw interaction keystrokes.
- Focus: opening fullscreen keeps focus on the player; `Esc` exits.
- Reduced motion: no animated thumbnails or auto previews; hover previews on the seek bar are still frames.
- Live sessions (webinars, interviews): joins muted with camera off by default; pre-join check screen (devices, network, level meter); raise hand, chat, captions; reconnect state.

## 15. Wizards

### 15.1 When to use

A wizard is used for tasks with more than 7 fields across 3 or more logical stages, dependent steps, or tasks that must be completable in sessions (apply, create job, create course, import, checkout, KYC). Otherwise a single page form with sections.

### 15.2 Structure

- Full-page `focus` shell: header (exit control "Save and exit" / "Cancel", title), Stepper (desktop left or top; phone compact "Step 2 of 5"), content region (max width 720), sticky footer with Back, Save and continue later (text button), and Continue (primary). The final step's primary is the verb of the task ("Submit application"). A Review step precedes submit: summary of all answers grouped by step with "Edit" links returning to that step and coming back to Review.
- URL per step: `/…/new/{step}` (see `01` section 5); direct access to a later step before earlier required ones are complete redirects to the first incomplete step with a notice.
- Steps are validated on Continue (section 3 timing); Continue with errors does not advance; saving draft saves invalid data without validating.
- Progress persists to the server per step (autosave 8.2); the wizard resumes where left; drafts are listed on the entry screen ("Continue your draft").
- Back never loses data. Jumping to a previous step via Stepper is allowed; jumping ahead only to steps already visited and valid.
- Conditional steps appear or disappear based on answers, and the step count updates with an announcement ("Now 6 steps"); the number never shrinks below completed steps.
- Exit: "Save and exit" saves and returns to the entry list; "Cancel" asks confirmation if dirty and offers delete draft vs keep.
- Completion: success page with summary and next best actions; the draft is converted to the object.
- Accessibility: on each step change focus moves to the step heading (h1 or h2 `tabindex="-1"`), step change announced ("Step 3 of 5: Experience"), Stepper marks `aria-current="step"`, errors summary applies per step.
- Time-limited wizards (checkout, assessment-linked) show the deadline in text, extend on activity where allowed, and warn at 5 minutes and 1 minute (polite, then assertive at 1 minute), never expiring silently with data loss.
- Phone: one question per screen allowed for sensitive or complex steps; bottom sticky action bar; native input types.

## 16. AI interaction patterns

Applies to assistants, recommendations, résumé suggestions, match explanations, summaries (AIC and other consumers).

- `NFR-IXP-021` AI output is always labeled (sparkles icon plus "AI" text) and distinguishable from user-authored and verified content. AI never produces a verification seal.
- Streaming: tokens stream into a single message; `aria-busy` on the message while streaming; the live region announces only start ("Assistant is replying") and completion ("Reply complete"), not each token; a Stop button is visible during streaming and `Esc` stops; after Stop the partial message remains with a "Stopped" note.
- Input: multiline composer, `Enter` newline on desktop with `Ctrl/Cmd Enter` send, or `Enter` send per user setting; suggested prompts (max 4) as chips; attachments only where specified.
- Grounding and sources: claims drawn from platform data link to the source object (job, evidence, course); no invented sources; unknown answers say so ("I don't have enough information about X"); confidence words, not percentages, unless calibrated.
- Actions: AI proposes, user disposes. Any change to user data (edit a profile summary, add skills) appears as a suggestion diff with Accept, Edit and Dismiss; nothing is written without an explicit accept. Bulk suggestions can be accepted individually.
- Feedback: "Helpful / Not helpful" with optional reason; "Report" for harmful content; feedback never blocks.
- Safety and boundaries: the assistant states its scope; refuses out-of-scope (legal, medical) with a pointer; never reveals other users' data; hiring-related automated scoring is advisory only and always shows explanation and a human decision step (compliance by design, see TSF and AIC).
- Transparency: "Why am I seeing this?" on every recommendation; control to turn off personalization; data used listed in plain language.
- Errors: model failure shows retry and keeps the user's prompt; rate or quota reached shows plan limit with reset time; latency over 8 s adds "Still working".
- History: conversation history is per user, deletable per conversation and all, with retention in settings; a "Temporary chat" mode stores nothing [PROP].
- Accessibility: new content is reachable by keyboard; streaming does not steal focus; code and tables in responses are navigable; copy button for each block.

## 17. Consolidated interaction rules

| Id | Rule | Test |
|---|---|---|
| NFR-IXP-001 | Every async action has one pending, one success, one failure state | Latency and failure simulation per action |
| NFR-IXP-002 | Mutations carry idempotency keys; double activation ignored | Double click test |
| NFR-IXP-003 | Required onboarding steps state why | Review |
| NFR-IXP-004 | Onboarding collects only data used in session; no sensitive categories | Data inventory review |
| NFR-IXP-005 | Onboarding progress saved each step and real step count | Close and return test |
| NFR-IXP-006 | Dismissed onboarding stays dismissed | Persistence test |
| NFR-IXP-007 | User's task completes before onboarding resumes | Journey test |
| NFR-IXP-008 | Submit buttons are not disabled for invalid input | Form test |
| NFR-IXP-009 | Every drag has a non-drag equivalent | Keyboard test |
| NFR-IXP-010 | Infinite scroll meets the eight conditions | Keyboard and screen reader test |
| NFR-IXP-011 | Confirmation buttons name verb and object; Cancel focused first | Dialog test |
| NFR-IXP-012 | Confirmations state what, what not, undoability in 3 sentences | Copy review |
| NFR-IXP-013 | No confirmations for non-destructive actions; no double confirms | Review |
| NFR-IXP-014 | No notification for the user's own action within 5 s | Event test |
| NFR-IXP-015 | No badges for non-actionable counts | Review |
| NFR-IXP-016 | Notification copy follows the guide and channel privacy | Copy lint |
| NFR-IXP-017 | Notifications deduplicated and rate limited | Load test |
| NFR-IXP-018 | Real-time degrades to polling; correctness without sockets | Disable sockets test |
| NFR-IXP-019 | Uploads resumable without loss | Network throttle test |
| NFR-IXP-020 | No autoplay with sound; autoplay-next is pausable and off by default | Player test |
| NFR-IXP-021 | AI output labeled and never shown as verified | Visual review |

## 18. Open decisions and risks

| Id | Question | Options | Default proposal | Decides | Blocks |
|---|---|---|---|---|---|
| OD-UX-12 | Posting limits for unverified employer organizations | None; low cap; manual approval | Manual approval for first job, low cap after | Product owner and TSF | Employer onboarding |
| OD-UX-13 | Mentor application response window | Parameter | Shown as a parameter, no number promised | Product owner | MEN |
| OD-UX-14 | Real-time collaborative editing | Not offered; offered for documents | Not offered; soft locks only | Engineering | STU, ATS |
| OD-UX-15 | Trash retention and undo-send window | 7, 30, 90 days; 10 s undo send | 30 days; 10 s | Privacy officer | SET |

### 18.1 Risks

| Id | Risk | Mitigation |
|---|---|---|
| RSK-UX-08 | Autosave and conflict rules differ per module | Section 8 is the single rule; module specs may only choose the class |
| RSK-UX-09 | Notification fatigue | Frequency caps, quiet hours, digest defaults, preference matrix |
| RSK-UX-10 | Optimistic updates showing false state | Section 8.4 allow-list; rollback within 150 ms |

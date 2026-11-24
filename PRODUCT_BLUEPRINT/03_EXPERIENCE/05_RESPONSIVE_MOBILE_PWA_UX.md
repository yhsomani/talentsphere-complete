# 05 Responsive, Mobile and PWA UX

Status: intended design. The product is PWA-first [SRC: CLAUDE.md "A PWA-first career platform"; docs/experience/UI_UX_DESIGN_SYSTEM.md §2 "Mobile-first PWA composition", §8 "Do not simply scale a desktop layout down"]. As-built, the app registers PWA capability checks (`apps/web/src/pwa.ts` is referenced by `Layout.tsx`) and the web app is one top-nav layout; nothing in this file claims offline behavior is built. Rule ids use area code `RWD` (`NFR-RWD-nnn`). Module-level PWA requirements (service worker, sync engine, extension) are owned by PWA; this file fixes the experience.

## 1. Principles

1. **Mobile is a primary device, not a reduced one.** Candidates search, apply, message and learn on phones; recruiters review and approve on phones. Every route works at 320 px.
2. **One product, adapted layouts.** Same routes, same data, different composition (`01` `NFR-IAX-007`).
3. **Thumb first.** Primary actions sit in the lower 60 percent of the screen on phones; destructive actions are away from the thumb's natural arc.
4. **Honest connectivity.** The UI states what works offline, what is queued and what needs a connection, and never fakes success.
5. **Light by default.** Initial content must arrive fast on mid-range phones over congested networks; heavy features load on demand.
6. **Respect the device.** Honor OS settings (dark, text size, reduced motion, Data Saver, silent mode, safe areas) before the app's own.

## 2. Breakpoint behavior

Widths and class names are in `01` section 3.1 and `02` section 3.11. Below is how patterns change.

| Pattern | Phone (0 to 767) | Tablet (768 to 1023) | Desktop (1024 and up) |
|---|---|---|---|
| Primary navigation | Bottom tab bar (5), Me screen | Rail 72 px | Sidebar 248 px |
| Top bar | App bar 56: back or logo, title, search, bell | 56: switcher, search, bell, avatar | 64: breadcrumbs, palette field, New, help, bell, avatar |
| Page layout | Single column; sections stack | Single or two-pane (list and detail) where `md` panes fit 320 + 400 | Multi-column; optional right panel at 1280 |
| Page header | Title, status, primary action as full-width button below or sticky bottom bar; overflow menu | Title and actions inline | Title and actions inline |
| Lists and cards | 1 column (2 for compact thumbnails from 640) | 2 columns | 3 to 4 columns |
| Data tables | Card list per row (default) or horizontal scroll with frozen first column | Table with fewer columns (column priority) | Full table |
| Filters | Full-height sheet, "Show N results" | Side sheet 360 px | Left panel 280 or filter bar |
| Detail view next to list | Separate full screen (push) | Two-pane (list 40 percent, detail 60 percent) | Two-pane or drawer |
| Dialogs | Bottom sheet or full screen for forms | Centered dialog 480 to 640 | Centered dialog |
| Menus and popovers | Bottom sheet list | Anchored | Anchored |
| Forms | Single column; sticky bottom primary; native input types | Single column max 640 | Single column max 640; optional section nav |
| Wizard | One stage per screen; compact stepper; sticky action bar | Stepper left or top | Stepper left |
| Kanban board | One column per screen with a column switcher (tabs of stage names with counts) and swipe between columns; "Move to" menu; list alternative | Two to three columns visible, horizontal scroll | All columns, horizontal scroll if more than fit |
| Calendar | Agenda list by day with month strip | Week view | Month, week, day |
| Charts | Simplified (fewer series, direct labels, tap for tooltip); table alternative one tap away | Standard | Standard |
| Command palette | Full-screen sheet | Dialog | Dialog |
| Toasts | Bottom, above tab bar and above the keyboard | Bottom start | Bottom start |
| Media player | Pinned top, tabs below, fullscreen on rotate (opt-in) | Side panel at landscape | Side panel |
| Rich text editor | Reduced toolbar (bold, italic, list, link) scrollable; full toolbar behind "More" | Full | Full |

Rules:

- `NFR-RWD-001` No horizontal page scroll at 320 px for any route except inside labeled containers (tables, code, charts, boards) per `04` `NFR-AXS-015`.
- `NFR-RWD-002` Content reorders for priority, not DOM-reversal tricks: DOM order equals reading order at all widths; reordering uses CSS grid placement only when reading order remains logical.
- `NFR-RWD-003` Hiding content on small screens is allowed only for supplementary content with a path to it (a "Details" expander or tab). Primary data and primary actions are never removed.
- `NFR-RWD-004` Layout uses container queries for components and media queries for shell; no device sniffing (user-agent) for layout.
- `NFR-RWD-005` Supported viewport range 320 to 2560 CSS px, any orientation; text zoom to 200 percent; browser minimum supported versions follow the support matrix in `OD-RWD-01`.
- Maximum content width: content area centered at `--ts-content-max` 1280; at 1536 and up whitespace grows; no stretched text lines.
- Safe areas: `env(safe-area-inset-*)` applied to bottom bars, sheets and full-bleed media; bottom tab bar height 56 plus inset.
- Dynamic viewport: use `dvh/svh` for full-height sheets; fixed bars survive URL bar collapse.
- Foldables and split view: layout responds to available width (container), not device type; content is not placed across a fold hinge (`env(viewport-segment-*)` considered for two-pane [PROP]).

## 3. Touch targets and spacing

| Element | Minimum | Standard |
|---|---|---|
| Any interactive target (coarse pointer) | 44 by 44 CSS px (including padding), 8 px gap between adjacent targets | Same |
| Any interactive target (fine pointer) | 24 by 24 CSS px (WCAG 2.5.8) | 32 to 40 |
| Bottom tab slot | 48 height, full width / 5 | 56 height |
| List row | 44 | 56 |
| Icon button | 44 hit area even if icon is 20 | 44 |
| Checkbox, radio, switch | Control 20 to 24, hit area 44 (with label) | |
| Inline text links | Exempt from size, but at least 8 px vertical separation in lists; link lists use full-row targets | |
| Table row actions | 44 button | |
| Slider thumb | 44 | |
| Close button on sheets | 44, top end corner and also reachable at the bottom as "Close" action when content is long | |

Rules:

- `NFR-RWD-006` Adjacent destructive and non-destructive targets are separated by at least 16 px; destructive buttons are never directly below the primary button without a gap and different emphasis.
- `NFR-RWD-007` Hover-only affordances (tooltips, hover actions, hover cards) have tap or focus equivalents; row actions visible on hover on desktop are always visible (kebab) on touch.
- `NFR-RWD-008` Primary action reach: on phone detail and form screens, the primary action is in a sticky bottom bar (within 60 percent lower screen), with 16 px margin and the safe-area inset.
- Press feedback within 100 ms (pressed state); no 300 ms tap delay (use `touch-action: manipulation`).
- Text fields use font size 16 px or larger on iOS to prevent focus-zoom.

## 4. Gesture rules

| Gesture | Use | Rule |
|---|---|---|
| Tap | Primary activation | |
| Long press | Enter selection mode, open context menu | Always paired with a visible alternative (checkbox, menu button); threshold 500 ms; haptic tick if enabled |
| Swipe horizontally on list rows | Reveal actions (archive, mark read) | Enhancement only: every action also exists in the row menu; actions are reversible (Undo) or confirm; swipe never deletes without Undo; threshold 40 percent width; RTL mirrors |
| Swipe between board columns or tabs | Navigation within a view | Does not conflict with system back swipe (do not capture edge gestures within 20 px of screen edges); visible tab controls remain |
| Pull to refresh | Refresh a list or feed | Optional; a Refresh button exists in the page menu; disabled where it conflicts with scroll in editors, chats (older messages load by scroll), maps |
| Drag and drop | Reorder, move | Handle-initiated, long press start, `03` section 6 alternatives |
| Pinch and double-tap zoom | Images, documents, maps | Page zoom is never disabled; in-app image viewer allows pinch |
| Edge swipe back | System navigation | Respected; in-app back is a visible control |
| Bottom sheet drag | Resize or dismiss | Close button visible; snap points; `Esc` and Close for non-touch |
| Shake, tilt | Not used | `04` `NFR-AXS-035` |

Rules:

- `NFR-RWD-009` No functionality is available only through a gesture (WCAG 2.5.1, 2.5.7).
- `NFR-RWD-010` Gestures that start destructive or outward-facing effects (send, delete, reject) always require an explicit button tap or a confirmation.
- `NFR-RWD-011` Scrolling is never hijacked: no horizontal capture by carousels beyond their own bounds; vertical scroll chaining inside sheets prevents background scroll (`overscroll-behavior: contain`).

## 5. Mobile input and device features

- **Input types:** `type=email`, `tel`, `url`, `inputmode=numeric|decimal|search`, `enterkeyhint` (next, done, search, send) on every field; `autocomplete` tokens; `autocapitalize` off for emails and handles, sentences for text; `spellcheck` appropriate.
- **Virtual keyboard:** when it opens, the focused field scrolls into view with 16 px padding above the sticky action bar; the bottom tab bar and sticky bars hide or sit above the keyboard (use `visualViewport`); forms never lose the focused field behind the keyboard; the keyboard "Next" moves to the next field and the last field's key is "Done" or "Send".
- **Pickers:** native date and time pickers on touch where accessible; custom pickers only when native cannot express the need (date range) and then meeting `02` specs; native `select` on touch for up to 30 options.
- **Camera and scanner:** document capture for evidence: guide frame, auto-crop and perspective correction, retake, multi-page, compress to the limit; fallback to file picker; QR scan for credential verification and event check-in with a manual code entry fallback; permissions requested in context with a rationale first.
- **Location:** requested only when the user taps "Use my location" (jobs near me); never on load; coarse location default; the stored location is the city, not coordinates.
- **Contacts and calendar:** no contact access; calendar export via ICS links and "Add to calendar" (Google, Apple, Outlook).
- **Biometrics and passkeys:** WebAuthn passkeys as a first-class sign-in and as the way to unlock the installed app after inactivity (setting); fallback always exists (`04` `NFR-AXS-045`).
- **Share:** Web Share API for sharing jobs, profiles, certificates; copy link fallback; the Share Target receives links, text and files (`01` section 10.2).
- **Clipboard:** "Copy" confirmations by toast "Copied"; paste of images into composers.
- **Haptics:** optional, light, never the only feedback.
- **Orientation:** portrait default; landscape supported for media, boards and tablets; no lock except full-screen video and the assessment camera check (declared).
- **Dark mode and text size:** follow OS by default; in-app overrides.
- **Status bar and theme color:** `theme-color` meta follows theme (light `#f4f5f1`, dark `#0c110e`); standalone display uses the surface color for the app bar so the status bar blends.

## 6. Mobile layout patterns

- **Sticky action bar:** bottom, 56 to 72 px, contains at most 2 actions (primary and secondary/overflow), elevation 2 with top border; hides under the keyboard unless the form needs it; content region has bottom padding equal to its height plus inset.
- **Bottom sheets:** for filters, pickers, menus, quick forms; heights: content-sized up to 90 percent; headers sticky with title and Close; scrim; focus trap; drag handle decorative.
- **Full-screen flows (`Chrome: focus`):** apply, assessment, interview, checkout, wizards; top bar shows title and Exit; no tab bar; confirmation on exit if dirty.
- **App bar behavior:** stays visible; title truncates with ellipsis; scroll-collapse large titles are not used (consistency, focus clarity).
- **Lists:** row-based with 56 px rows; section headers sticky; pull to refresh optional; empty and loading states as per catalog.
- **Tables to cards:** key fields (max 4) per card, status pill, primary action; tap card opens detail; filter and sort in a sheet; sticky "N results" header.
- **Tabs overflow:** horizontal scroll tabs with edge fades and the selected tab scrolled into view; or a segmented control for up to 4.
- **Typography on phone:** H1 24 px, H2 20, body 16, table text 14; no line shorter than 30 characters per line (avoid narrow nested columns).
- **Density:** Comfortable only on coarse pointers.
- **Images:** responsive `srcset` and `sizes`, WebP/AVIF; max 2x DPR variants.
- **Back behavior:** in-app Back goes to the logical parent (`01` `NFR-IAX-023`); hardware/browser back pops the last pushed view or closes the topmost sheet first.
- **Scroll restoration:** per tab stack (`01` section 3.4).

## 7. PWA install flow and app shell

### 7.1 Installability

Manifest: name "TalentSphere", short name "TalentSphere", `display: standalone`, `start_url: /dashboard?source=pwa`, `scope: /`, `theme_color` and `background_color` per default theme, maskable and monochrome icons (192, 512), screenshots (phone and desktop) for rich install UI, `shortcuts` (Find jobs, Messages, My learning, Applications) [PROP], `share_target`, `launch_handler` focusing an existing window, `categories`. Served over HTTPS with a service worker providing offline fallback (installability requirement).

### 7.2 When to prompt

| Rule | Detail |
|---|---|
| Eligibility | Browser fired `beforeinstallprompt` (Chromium) or platform is iOS Safari (manual instructions) |
| Timing | After the user has visited at least twice, on different days, and completed one meaningful action (applied, saved a job, completed a lesson, sent a message) |
| Never during | Forms in progress, assessments, interviews, checkout, onboarding steps, first minute of a session, and within 30 days after the user dismissed the prompt twice |
| Placement | A small dismissible card in the dashboard region (not a modal) and a permanent "Install app" item in Help and the account menu |
| Copy | "Install TalentSphere to open it from your home screen and keep your applications and lessons available offline." Buttons "Install" and "Not now". A "Never ask again" link under the Not now (stored) |
| Dismiss memory | "Not now" snoozes 14 days; after two dismissals: 90 days; "Never ask again" is permanent for the account and device; Help menu item remains |
| iOS | Card with three steps and icons: Share, Add to Home Screen, Add; shown only in Safari; explains that notifications on iOS require the installed app |
| Desktop | Chromium shows install icon in the address bar; our card is offered at the same timing, within the page |
| After install | Standalone launch shows a one-time "You're using the app" tip: notifications opt-in soft ask, offline readiness status ("Your applications and 3 lessons are ready offline") |
| Analytics | Prompt shown, accepted, dismissed, installed, launched from standalone (no personal data) |

### 7.3 Standalone behavior

- App bar and bottom tabs form the chrome; there is no browser UI, so the app provides: visible Back, Reload (pull to refresh or menu item "Refresh"), Share, "Open in browser" for external links (external links open in an in-app browser sheet or system browser per platform, with a clear "Opening outside the app" cue), current URL copy (in the menu), and "Copy link".
- Deep links from email, push and the web open in the installed app via `launch_handler`/link capture where supported; otherwise in the browser with a banner "Open in app".
- App badge (`navigator.setAppBadge`) shows the unread actionable count (messages plus actions), subject to the notification preference; cleared when zero.
- Window title and history behave as normal navigation.
- Session persistence: sign-in persists for the configured session length (IDN) with biometric/passkey re-unlock after inactivity (default 15 minutes [PROP], setting).

### 7.4 Updates

- The service worker updates in the background. When a new version is ready, a non-blocking banner "A new version is ready. Refresh" appears on the next navigation; applying it reloads at a safe moment: never during forms with unsaved changes, assessments, interviews, or uploads. If a version is flagged "required" (security fix) the banner changes to "Update needed" and blocks only creation of new data after 24 hours, giving time to finish current work.
- Schema migrations of local data run silently with a version check; failures clear caches (not drafts) and re-sync.

### 7.5 Storage and privacy

- Cached personal data is encrypted at rest on device when the platform allows (WebCrypto with a key bound to the session) [PROP]; sign out clears caches and local data except drafts the user chooses to keep; shared-device mode ("This is a shared computer") on sign-in disables offline storage and persistence.
- Quota management: the app reports usage in `/settings/data` ("Offline storage: 38 MB") with "Clear offline data"; eviction order: media downloads, cached lists, then drafts last (drafts are protected with persistent storage request `navigator.storage.persist()` after install).

## 8. Offline UX

### 8.1 Offline capability classes

| Class | Meaning | Examples |
|---|---|---|
| R: Read offline | Last-viewed data is cached and viewable, marked with "Saved on this device, {time}" | Dashboard summary, profile, evidence list, applications and statuses, saved jobs, job details viewed, enrolled course outline and notes, downloaded lessons, messages recently opened, interview details and schedule, certificates, upcoming events, mentor sessions |
| W: Queue writes | Changes are stored locally and sent when online, in order, idempotent | Draft edits (profile, evidence draft, application draft, resume), bookmarks, mark as read, notes, lesson progress, message drafts and sends ("Waiting to send"), settings toggles, checklist items |
| O: Online only | Requires live server | Submitting an application (draft is saved, submission waits: "Ready to submit when you're online" with explicit manual submit after reconnect), payments, assessment start (an attempt in progress can continue offline only where the format allows and the module declares sync-on-submit), video interviews, search beyond cached, AI assistant, verifications, publishing, sensitive admin actions |
| D: Download for offline | Explicit download by user | Course lessons (video, PDF, quizzes where permitted), reading materials, certificates PDFs |

Rule `NFR-RWD-012` Each module's screen spec declares the class per action (R, W, O, D). An action in class O is `aria-disabled` offline with the reason; a class W action works and shows a queued state.

### 8.2 Offline indicators and states

- Global: banner "You're offline. You can view saved items and make changes that will sync later." appears 3 seconds after connectivity loss (avoids flapping), cleared on recovery with a polite "Back online. Syncing."
- Item level: queued changes show "Waiting to sync" (clock icon plus text); synced shows nothing; failed shows "Couldn't sync. Review"; conflict shows "Needs your choice".
- SyncStatus component in the app bar or a status area lists the queue with per-item status and retry; accessible via the banner's "View".
- Lists show cached content with a header chip "Saved {time}" and Refresh disabled with tooltip "Offline".
- Search offline: searches cached items only with explicit label "Searching saved items".
- Navigation to uncached routes: the offline fallback page `/offline` lists what is available offline (saved applications, downloaded lessons, drafts) rather than a dead end, with a Retry button.
- Time-sensitive information (interview in 10 minutes) is cached with its join link and instructions, and the app warns "You need a connection to join".

### 8.3 Sync behavior

- Order preserved per object; independent objects sync in parallel up to 3; exponential backoff on failures; Background Sync used where supported, otherwise on app focus and every 60 s while online.
- Conflicts follow `03` section 8.3. A queued write whose target changed server-side is moved to "Needs your choice" with the compare view.
- Queue limits: 200 items or 20 MB; beyond that, new queueable actions fail with "Too many changes waiting. Connect to sync first."
- Server rejects (validation, permission removed) are shown per item with the reason and an Edit or Discard choice; nothing is silently dropped.
- Idempotency keys generated at queue time (`03` section 1.3).
- Clock skew: timestamps on queued changes are from the device but ordering uses a client sequence; the server records both.
- Sign-out with unsynced items: warns "You have 3 changes waiting. Sign out anyway? They will be lost" (or keep drafts locally if the user chooses).

### 8.4 Downloads for offline (learning)

- Per lesson and per course "Download" (with size shown and storage free), progress, pause, resume, and "Downloaded" badge; Wi-Fi only default on cellular (setting); downloads expire per license rules (7 to 30 days offline validity, parameter `OD-RWD-02` [PROP]) with the expiry date visible; offline progress syncs on reconnect; quizzes marked graded online only unless the module allows offline grading.
- Space management list under `/settings/data`.

### 8.5 Offline rules

- `NFR-RWD-013` No data the user created is lost because of a connectivity failure; local copy persists until server confirmation.
- `NFR-RWD-014` Offline state is never silent: every screen shows if data is cached and its age, and every disabled action says why.
- `NFR-RWD-015` Sensitive classes (messages with attachments, verification documents, identity data) are not cached unless the user opts in per class; assessment content is never cached beyond the active attempt.

## 9. Low-bandwidth and constrained devices

- **Detection:** `Save-Data` header and `navigator.connection.saveData`, `effectiveType` (`2g`, `slow-2g`, `3g`), `deviceMemory`, `hardwareConcurrency`, battery saver where exposed; plus a manual setting "Data saver" (`/settings/accessibility`): Auto (default), On, Off.
- **Data saver behavior (On or Auto-detected):**
  1. Images load as low-quality placeholders; full images on tap ("Load image, 240 KB").
  2. No video autoplay, no preview loops; video default quality lowest; audio-only option for lessons.
  3. No prefetching of next pages or routes; real-time falls back to polling every 60 s (`03` section 11).
  4. Lists show text-first compact cards (thumbnails hidden for job and course cards, company logos small).
  5. Animations off (same as reduced motion), skeletons simplified.
  6. Uploads: compress images client-side (max 1600 px long edge, quality 0.8) with consent; resumable chunking.
  7. Charts render from compact data; fonts use system fallback if web fonts not yet cached.
  8. A subtle "Data saver is on" chip in the Settings and a banner at first activation.
- **Network quality UX:** requests slower than 3 s show the "taking longer than usual" status; slow-network detected shows "Slow connection. Some content may take time." once per session with a "Turn on Data saver" action.
- **Budget statements (proposals, owned by NFR-PERF in `06_QUALITY_AND_PERFORMANCE`) [PROP]:** first meaningful content on a mid-range phone over a simulated 4G connection within 2.5 s (LCP), interaction response under 200 ms (INP), cumulative layout shift under 0.1; initial critical-route JavaScript under a stated KB budget set by engineering; every route works with JavaScript parse time under a mid-range CPU 4x slowdown test; route-based code splitting; heavy components (editor, chart, player, calendar) lazy loaded when needed with a skeleton.
- **Older devices:** progressive enhancement; core flows work in the last 2 major versions of Chrome, Safari, Firefox, Edge, Samsung Internet (`OD-RWD-01`); features requiring newer APIs degrade (no `inert` fallback via polyfill, no WebGPU).
- **Rules:** `NFR-RWD-016` Data saver never removes functionality, only fidelity. `NFR-RWD-017` The user can see and change data saver status in one tap from the offline or slow-network banner.

## 10. Mobile-specific journeys

Each journey states the phone path, constraints and states. Modules reference these when writing screens.

### MJ-01 Apply from a phone (links to `JRN-CAN-*` journeys in module files)

1. Entry: shared job link (messaging app), search result, notification. Link opens in browser or installed PWA.
2. Job detail at 320 px: title, company, location, pay, "Apply" sticky bottom bar and Save icon in app bar.
3. Tap Apply: if signed out, sign in with passkey, email link or SSO with `returnTo`; the apply wizard opens full-screen.
4. Steps: contact (prefilled), resume (choose saved, upload from files or camera scan, or import), screening questions (one per screen if more than 3), documents, review, submit. Autosave each step; the `Save and exit` action present.
5. Submit: success page with next steps and "Add to calendar" reminders; offline mid-wizard: stays editable, Submit shows "Ready to submit when you're online".
6. Constraints: typing long answers uses the rich text light editor; file attach from camera with crop; character counters; no horizontal scroll; keyboard-safe action bar.
7. States: network failure on submit (queue and ask manually), duplicate application (explain existing application), job closed (410 state with similar jobs), missing required profile data (inline blocking step with the specific field).

### MJ-02 Triage notifications into action

Push arrives (generic text if hidden details). Tap opens the exact target (`01` section 10.2). Actionable notifications (interview slot, offer) open a minimal "Respond" screen with two or three choices and one-tap confirm; result shown with calendar add. Silent failure not allowed: if the app cannot open the target (permission lost) it shows the denied state with options.

### MJ-03 Learn on the commute

Open Learn tab → continue card shows next lesson and resume position; one-tap Continue; player pinned at top; transcript tab; download for offline over Wi-Fi earlier; lesson completion sync when online; interruptions (call, app switch) pause playback and save position; headphone controls via Media Session API (play, pause, seek, next track); picture in picture on leaving the app where supported; quizzes at small screens with large answer targets; notes via voice dictation (OS) supported by plain textarea.

### MJ-04 Take an assessment on a phone (where the format allows)

Invitation states the device requirements ahead (screen size, camera, connection); the pre-check screen tests camera, mic, network and battery (warn under 20 percent), instructs to plug in; runs in `focus` shell with timer at top, question navigator in a bottom sheet, flag, review screen; leaving the app triggers a visible warning ("Leaving the test will be recorded" if policy; no penalty for incoming calls: the timer policy states pause rules); coding assessments on phone are not offered unless the module supports; on rejection by device, the invitation offers "Continue on a computer" via a link/QR and emails the link. Accommodations follow `04` section 11.

### MJ-05 Recruiter on the go

Home shows "Needs your action" (new applications to review, interviews to confirm, offers to approve). Review queue: swipe-less card stack: candidate summary card (name, headline, match explanation, key evidence, resume opens in a sheet), actions Advance, Hold, Reject (with reason sheet) as full-width buttons; undo toast; scorecard entry per criterion with large rating controls; approve offers with biometric/passkey confirmation; reply to messages with templates; the pipeline column-per-screen view; all list equivalents; heavy admin (team, billing, integrations) shows desktop recommended notice.

### MJ-06 Capture evidence with the camera

Add evidence → "Scan a document": permission rationale card → camera with guide frame → auto-capture or tap → crop/perspective → multiple pages → enhance (contrast) → PDF → details (type, issuer, dates) → submit for verification. Offline: saved as draft with images stored locally; upload when online with progress. Privacy notice that IDs and sensitive documents are only visible to the verifier and the user until the user shares.

### MJ-07 Interview day

Reminders 24 hours and 1 hour before (push, email, SMS opt-in); the Interview card on Home has "Join" enabled from 10 minutes before (button label states "Join in 8 minutes" before then); the pre-join screen tests devices; the room in landscape or portrait with captions; poor network: auto reduce video and offer audio-only; reconnect state keeps the room; text chat fallback; after: feedback prompt and next steps. Time zones displayed explicitly.

### MJ-08 Mentor session booking and attendance

Browse mentors; availability grid in viewer's time zone (list of slots grouped by day, not a wide grid on phone); pick a slot; add a note; confirm (pay if paid with wallet pay or saved method); calendar add; reminders; join; post-session notes and rating. Reschedule and cancel use sheets with policy text.

### MJ-09 Verify a credential or check in by QR

Scan QR (in-app scanner or system camera deep link `/verify/{code}`) → read-only result: issuer, subject (as allowed), status, dates; in the app, event check-in codes open a confirmation "You're checked in to {Event}". Manual code entry fallback. Works with weak connectivity (cached issuer public keys for signed credentials where feasible [PROP]).

### MJ-10 Share into TalentSphere

From any app, Share a link or file to TalentSphere (Share Target): choose "Save job", "Add as evidence", "Send in message", "Add to post" (only options relevant to the content type); the app opens a minimal sheet with prefilled content, confirm, and return.

### MJ-11 Install and first offline use

After install (7.2), the app shows an "Offline ready" status card in Settings; on losing network the user sees the offline banner and the list of what works; returning online triggers sync and a summary toast "3 changes synced".

### MJ-12 Student campus quick actions

Campus home highlights: today's classes or deadlines, new announcement, drives open today, attendance or check-in (QR where institutions use it). Everything one tap from Home; notifications from the institution can be muted per category.

## 11. Mobile notifications and badges

Defined with `03` section 10. Mobile specifics: Web Push on Android Chrome and installed iOS PWAs (iOS 16.4 and later; requires install); notification actions (up to 2 buttons: Confirm, Decline) where supported; grouped by channel; tag to replace superseded notifications (interview rescheduled replaces the old one); icon and badge monochrome; on tap, deep link and mark read; badge via app badge API; no sound by default beyond system.

## 12. Consolidated rules

| Id | Rule | Test |
|---|---|---|
| NFR-RWD-001 | No horizontal page scroll at 320 px outside labeled containers | Playwright at 320 on every route |
| NFR-RWD-002 | DOM order equals reading order at all widths | Keyboard and screen reader walkthrough |
| NFR-RWD-003 | Primary data and actions are never removed on small screens | Spec review |
| NFR-RWD-004 | Container queries for components; no UA sniffing | Lint |
| NFR-RWD-005 | Supported 320 to 2560 px, any orientation, 200 percent text | Visual tests |
| NFR-RWD-006 | 16 px between adjacent destructive and non-destructive targets | Target audit |
| NFR-RWD-007 | No hover-only functionality | Touch emulation tests |
| NFR-RWD-008 | Phone primary actions in a sticky bottom bar within the lower 60 percent | Visual test |
| NFR-RWD-009 | No gesture-only functionality | Spec review and test |
| NFR-RWD-010 | Destructive or outward actions need an explicit tap or confirm | Test |
| NFR-RWD-011 | No scroll hijacking | Manual |
| NFR-RWD-012 | Each action declares offline class R, W, O or D | Spec lint |
| NFR-RWD-013 | No user data lost to connectivity failure | Offline fault injection |
| NFR-RWD-014 | Offline state never silent; disabled actions explain why | Offline run |
| NFR-RWD-015 | Sensitive classes not cached without opt-in; assessments never cached beyond the attempt | Storage inspection |
| NFR-RWD-016 | Data saver reduces fidelity, not function | Feature parity test |
| NFR-RWD-017 | Data saver status visible and changeable in one tap from the slow-network banner | UI test |

## 13. Open decisions and risks

| Id | Question | Options | Default proposal | Decides | Blocks |
|---|---|---|---|---|---|
| OD-RWD-01 | Browser and OS support matrix | Last 2 versions; last 3; evergreen only | Last 2 major versions of Chrome, Edge, Firefox, Safari (macOS, iOS), Samsung Internet; iOS 16.4+ for push | Engineering and product | Build targets |
| OD-RWD-02 | Offline validity of downloaded lessons | 7, 14, 30 days | 30 days, subject to license | Product and legal | LRN, PWA |
| OD-RWD-03 | Whether application submission may be queued offline and auto-sent | Manual only; auto | Manual confirm after reconnect | Product owner | JOB, PWA |
| OD-RWD-04 | Encrypting local caches | Off; WebCrypto session-bound | WebCrypto, session-bound | Security officer | PWA |

### 13.1 Risks

| Id | Risk | Mitigation |
|---|---|---|
| RSK-RWD-01 | iOS PWA limits (push, storage eviction, background sync gaps) | Honest messaging, draft protection, server-side drafts as truth, email fallbacks |
| RSK-RWD-02 | Offline conflict complexity | One conflict model (`03` section 8.3), restricted queueable classes |
| RSK-RWD-03 | Install prompt annoyance | Timing and dismissal memory rules in section 7.2 |
| RSK-RWD-04 | Mobile assessments with weaker integrity and accessibility | Device requirements stated up front; "Continue on a computer" path |

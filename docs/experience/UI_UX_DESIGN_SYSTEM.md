# TalentSphere — UI_UX_DESIGN_SYSTEM.md v6.0

## 1. Design Intent

TalentSphere should feel:
- trustworthy;
- calm;
- intelligent without being theatrical;
- dense enough for professionals;
- progressive rather than overwhelming;
- mobile-native;
- accessible.

## 2. Core Rules

- Mobile-first PWA composition.
- Progressive disclosure.
- Honest loading.
- Actionable empty states.
- Error recovery.
- Consistent keyboard/focus behavior.
- Dark mode first-class.
- Motion communicates state.
- No critical information encoded only through color.

## 3. Design Tokens

Use one generated token source.

### Base system
- 4px spacing grid.
- semantic color roles.
- typography scale xs–4xl.
- radii 6/10/16/50%.
- motion 120/200/320ms as initial tokens.
- focus tokens independent from brand tokens.
- z-index layers owned centrally.

### Theme
The existing Aura token family remains the starting design language, but all raw values must come from token definitions rather than feature code.

## 4. Component Architecture

Atoms → Molecules → Organisms → Templates → Feature pages.

Promotion rule:
A component stays feature-local until second meaningful reuse.

## 5. Canonical States

```text
IDLE
HOVER
FOCUS
PRESSED
LOADING
SUCCESS
ERROR
EMPTY
DISABLED
VALIDATION
PARTIAL
OFFLINE
SYNCING
PERMISSION_DENIED
RESTRICTED
```

Domain lifecycle:
`PENDING`, `PROCESSING`, `VERIFIED`, `REJECTED`, `EXPIRED`, `REVOKED`, `DISPUTED`, `ARCHIVED`.

## 6. Micro-Interaction Contract

```text
Trigger
→ User action
→ State change
→ Immediate feedback
→ Result
→ Next best action
```

Define interaction behavior for:
- save/bookmark;
- autosave;
- upload/processing;
- assessment timer/submission;
- streaming AI;
- application submission;
- matching explanation;
- messaging;
- notification;
- offline sync;
- destructive actions.

## 7. Accessibility

Target WCAG 2.2 AA.

Required:
- keyboard navigation;
- visible focus;
- logical focus management;
- semantic HTML;
- labels and descriptions;
- screen reader status messages;
- accessible dialogs;
- accessible tables;
- reduced motion;
- sufficient touch target sizing;
- zoom/reflow support.

## 8. Responsive Behavior

### Mobile
Bottom navigation, bottom sheets, stacked cards, compact action bars.

### Tablet
Adaptive two-pane layouts where content warrants.

### Desktop
Sidebar navigation, denser tables, multi-column dashboards.

Do not simply scale a desktop layout down.

## 9. Core Screen Families

- Landing
- Auth
- Onboarding
- Dashboard
- Profile
- Evidence portfolio
- Skill explorer
- Goal/readiness
- Learning catalog
- Course player
- Challenge/assessment
- Job search/detail
- Application tracker
- Recruiter search/pipeline
- Interview
- Messages
- Notifications
- Communities
- Institution admin
- Admin/moderation
- Settings/privacy
- Career workspace

## 10. Detailed Micro-Interaction Corpus

## Appendix D — UX Micro-Interaction Register (100 Patterns)

The following patterns are a single canonical micro-interaction reference. Apply them to the feature specifications rather than copying their text into individual features.

## §UX-MICRO-01 — Loading & Waiting

*The video's topic. Waiting is the single most common UX failure because it's the one designers forget to design.*

### M-01 · The Spinner Tax

**Symptom:** A generic rotating circle appears where content should be. User has no idea what's coming, how big it will be, or whether the page is even working.
**Cost:** Perceived load time increases by 30–50% vs. skeleton screens (Nielsen Norman Group). Users abandon when they can't predict what's coming.
**Fix:** Replace every content-area spinner with a **skeleton screen** that mirrors the final layout — same number of rows, same approximate widths, same image blocks. Spinner is reserved only for *sub-200ms* operations where a skeleton would flash.
**Applies to:** Job list, course catalog, profile view, feed, application list, notification center, admin tables, institutional analytics.
**Acceptance:** Every content surface in §UXC-004 through §UXC-028 has a defined skeleton state. Zero spinners in content areas. Skeleton appears <100ms, disappears <50ms after data arrives.

---

### M-02 · The 100ms Rule

**Symptom:** User clicks "Apply" or "Submit" or "Save." Nothing happens for 400ms. They click again. Now the form submits twice, or the button state is ambiguous.
**Cost:** Double-submissions, duplicate records, user anxiety, and support tickets.
**Fix:** Every button that triggers a mutation must give **visual feedback within 100ms** (Miller's response-time threshold) — a pressed state, a spinner *inside the button*, or an immediate state change — then **disable itself** until the response returns. Never rely on the round-trip to provide feedback.
**Applies to:** Apply, Submit, Save, Post, Publish, Enroll, Purchase, Send, Follow, Connect, Report, Refund, Approve, Reject.
**Acceptance:** `<Button>` component has a mandatory `pending` prop. Lint rule blocks mutation buttons without a pending state. 100ms verified via synthetic click test.

---

### M-03 · Layout Shift

**Symptom:** User goes to click "Apply," but a late-loading banner pushes the button down 40px, and their click lands on "Save Job" or an ad. They didn't get what they clicked.
**Cost:** Frustration, accidental actions, ad-click fraud (in the video's example), broken trust.
**Fix:** **Reserve space** for every late-loading element. Banners, images, video players, embedded content, and third-party widgets must declare their dimensions in layout before content arrives. Use `aspect-ratio`, `min-height`, or explicit skeleton heights.
**Applies to:** Job detail (salary widget, company logo), course player (video frame), profile (avatar, banner), feed (media, link previews), institutional dashboard (charts).
**Acceptance:** Cumulative Layout Shift (CLS) <0.1 on every route class (§35.2). Zero post-click element displacement in E2E tests.

---

### M-04 · Real Progress

**Symptom:** A progress bar shows "Loading…" with no percentage, no step, no ETA. User has no idea if this will take 5 seconds or 5 minutes.
**Cost:** Abandonment on long operations; duplicate submission attempts; support tickets asking "is it stuck?"
**Fix:** For any operation >2 seconds, show **three things simultaneously**: percentage complete, current step name, and estimated time remaining. For operations with defined steps (bulk import, migration, media transcode), show a **stepper** with completed/current/pending states.
**Applies to:** Bulk student import, migration engine, media transcode, large exports, institutional reports, contest scoring.
**Acceptance:** Operations >2s show all three metrics. Step names come from a centralized registry. ETA accuracy tracked post-launch (target ±30%).

---

### M-05 · Stream It

**Symptom:** User opens the jobs page. One slow query (e.g., company logos) freezes the entire page. The whole screen is blank for 3 seconds, then everything pops in at once.
**Cost:** Perceived load time = slowest request. Users blame the whole page for one slow part.
**Fix:** **Render the shell immediately** (navigation, page header, static chrome), then **fill regions independently** as their data arrives. Use React route-level code splitting and Suspense boundaries. Regions that fail to load show their own error state without affecting neighbors.
**Applies to:** Dashboard, profile, job detail, course detail, admin console, institutional analytics.
**Acceptance:** Every page has a defined shell + ≥2 independently streamed regions. One region failing never blanks the page. TTFB <800ms for the shell.

---

### M-06 · The Forever Spinner

**Symptom:** The spinner spins. And spins. And spins. There is no timeout, no error, no retry. The user closes the tab.
**Cost:** This is the one that loses the customer. No error, no exit — they just leave. Highest-severity UX defect.
**Fix:** **Every async operation needs a terminal state.** After 10 seconds, show "Taking longer than expected…" with a cancel option. After 30 seconds, fail with a specific error, correlation ID, and a retry button. Never leave a spinner spinning indefinitely.
**Applies to:** Every async operation in the platform — no exceptions.
**Acceptance:** Every `useQuery`/`useMutation`/fetch has a timeout. `error_code_catalog` contains a timeout entry. R-003 runbook covers mass-timeout incidents. Zero infinite spinners in staging soak test.

---

### M-07 · Optimistic Update With Rollback

**Symptom:** User clicks "Like" on a post. The heart fills instantly, then 400ms later it unfills because the server rejected it. No explanation.
**Cost:** User distrust; second-guessing whether their action "took"; abandonment of low-stakes interactions.
**Fix:** Optimistic updates must ship with a **visible rollback path**: on failure, show a small inline error ("Couldn't save. Retry?") *near the element*, not just a global toast. For high-stakes actions (Apply, Purchase, Submit), do NOT use optimistic UI — show explicit loading state and confirmation.
**Applies to:** Reactions, follows, bookmarks, saves, mutes, dismissals (optimistic OK). Applications, purchases, submissions (never optimistic).
**Acceptance:** Optimistic patterns documented per action type. Rollback UX tested with forced 500 response.

---

### M-08 · The Cold Start Problem

**Symptom:** First-time user lands on the dashboard. Everything is empty. No guidance, no next step. Just "No data" in six panels.
**Cost:** 40%+ of new users abandon within 2 minutes when the first screen is a void.
**Fix:** First-time users get a **guided empty state** — never a blank dashboard. Show 2–3 clearly labeled actions ("Complete your profile", "Take your first challenge", "Browse open roles"). Track which one they click. Adapt the second session based on their first action.
**Applies to:** Dashboard, jobs, courses, applications, portfolio, notifications, feed, institutional admin.
**Acceptance:** Every empty state has a primary CTA. First-session funnel instrumented (EVT-001 → first meaningful action). Target: 40% complete first action within 24h.

---

### M-09 · Stale-While-Revalidate

**Symptom:** User navigates back to a page they saw 5 minutes ago. It shows a spinner and re-fetches everything, even though nothing changed.
**Cost:** Perceived slowness on repeat visits; wasted bandwidth; unnecessary server load.
**Fix:** Show **cached data immediately** with a subtle "Refreshing…" indicator in the corner. Only escalate to a full skeleton if cache is >24h old or explicitly invalidated.
**Applies to:** Profile, feed, notifications, job list, course list, saved searches.
**Acceptance:** Repeat navigation within 5 minutes uses cache. Stale indicator appears only when revalidating. Manual refresh always available.

---

### M-10 · The Prefetch Whisper

**Symptom:** User hovers over a job card, clicks, waits 800ms for the detail page.
**Cost:** Every click feels 800ms slower than it needs to be.
**Fix:** Prefetch the **most likely next page** on hover (desktop) or on viewport entry (mobile). Prefetch budget: ≤2 pages per session, ≤100KB per prefetch. Do not prefetch on metered connections.
**Applies to:** Job cards → job detail; course cards → course detail; profile avatars → profile; notification items → target.
**Acceptance:** Prefetch hit rate >60% on desktop. Prefetch budget enforced. `navigator.connection.saveData` respected.

---

## §UX-MICRO-02 — Interaction Feedback

### M-11 · The Ghost Button

**Symptom:** User clicks a button. It does something, but there's no visual change. Did it work? Did I misclick?
**Cost:** User clicks again, or gives up.
**Fix:** Every interactive element has **four distinct visual states**: default, hover, active (pressed), focus. The active state must be *visually different* from default (not just a cursor change). Focus state must meet WCAG 2.4.13 (≥2px, 3:1 contrast).
**Applies to:** Every button, link, tab, card, menu item.
**Acceptance:** Aura `<Button>`, `<Link>`, `<Card>` components have all four states. Contrast measured. Zero elements missing states.

---

### M-12 · The Dead Zone

**Symptom:** User clicks the edge of a button, misses by 2px, nothing happens.
**Cost:** Micro-frustration repeated hundreds of times per session.
**Fix:** Every clickable element has a **minimum 44×44px tap target** on touch, **24×24px** on desktop (WCAG 2.5.8 AA). Use padding, not visual size, to expand the hit area when the visual is smaller.
**Applies to:** Icon buttons, close buttons, checkbox labels, table row actions, mobile nav items.
**Acceptance:** Automated audit reports zero violations on all routes. Manual spot-check on mobile.

---

### M-13 · Focus Never Lost

**Symptom:** User tabs through a form, a modal opens, and focus drops to the top of the page. Now they have to tab 40 times to get back.
**Cost:** Keyboard users abandon forms. Accessibility violation.
**Fix:** Modal opens → focus moves to the first focusable element. Modal closes → focus returns to the trigger. Content updates dynamically → focus stays anchored. Never silently move focus.
**Applies to:** Every modal, dialog, dropdown, drawer, popover.
**Acceptance:** `focus-return` test on every modal component. Keyboard-only sweep per release.

---

### M-14 · The Keyboard Shortcut Whisper

**Symptom:** User sees a button. It's fast to click. But there's a faster way they'll never discover.
**Cost:** Power users don't become power users; every action is mouse-dependent.
**Fix:** Show the shortcut **in the tooltip or as an inline kbd chip** on hover for common actions. `⌘K` for command palette, `Esc` to dismiss, `↑↓` for list navigation, `Enter` to open, `/` to focus search.
**Applies to:** Command palette, modals, list navigation, form submission, notification panel.
**Acceptance:** Every shortcut discoverable via tooltip or `/help`. WCAG 2.1.4 compliant (context-scoped, remappable, disableable).

---

### M-15 · The Tooltip That Never Comes

**Symptom:** User hovers over an icon-only button (e.g., "flag", "archive"). They wait. Nothing. They click. It does something unexpected.
**Cost:** Users avoid icon-only actions; features go unused.
**Fix:** Every icon-only button has a **tooltip within 300ms of hover** with a label (not a description). Add `aria-label` regardless of tooltip.
**Applies to:** All icon buttons: edit, delete, flag, share, mute, archive, filter, sort.
**Acceptance:** Zero icon-only buttons without `aria-label` or tooltip. Tooltip delay ≤300ms.

---

### M-16 · The Silent Success

**Symptom:** User saves their profile. Nothing happens. No toast, no state change, no confirmation.
**Cost:** User re-saves; refresh reveals it worked; trust eroded.
**Fix:** Every mutation has **explicit success feedback** — either a state change (button → "Saved ✓"), a toast, or an inline message. For major actions (application submitted, course enrolled, offer accepted), use a **full-screen or modal confirmation** with a clear next step.
**Applies to:** Every mutation.
**Acceptance:** Every `useMutation` has success UI. Toast duration ≥4s for info, ≥6s for actions requiring acknowledgment.

---

### M-17 · The Confirmation Circus

**Symptom:** User tries to delete a comment. Modal: "Are you sure?" Yes. Modal: "This cannot be undone." Yes. Modal: "Really?" Yes. User gives up.
**Cost:** Destructive actions feel hostile; users hesitate on everything.
**Fix:** **One confirmation** for reversible actions, **two** for irreversible ones. Use **soft delete with undo** for anything that can be recovered (comments, posts, drafts, saved items). Reserve hard confirms for truly irreversible ops (account deletion, license revocation, payout).
**Applies to:** Delete, archive, revoke, cancel, unsubscribe, leave.
**Acceptance:** Audit of all destructive actions. Reversible actions use undo toast. Hard confirms limited to a documented list.

---

### M-18 · The Optimistic Disable

**Symptom:** User clicks "Enroll." Button grays out. 800ms later it un-grays with an error. But the button *still says "Enroll"* — did it work or not?
**Cost:** Ambiguity; user retries; duplicate enrollment attempts.
**Fix:** Disabled state must show **what's happening**, not just gray out. Change the label ("Enrolling…") or add an inline spinner *inside* the button. Never leave a disabled button with its original label.
**Applies to:** Every async button.
**Acceptance:** No disabled button retains its original label. `pendingLabel` prop enforced in `<Button>`.

---

### M-19 · The Hover Heavy

**Symptom:** User moves the mouse across a dense list. Every row triggers a 200ms shadow animation. The screen vibrates.
**Cost:** Visual noise; users lose track of their cursor; motion-sensitive users feel ill.
**Fix:** Hover feedback must be **subtle and fast** (≤80ms per Dense Profile §5.4.1), not a 200–300ms shadow choreography. Change surface value, not shadow. No bounce, no spring. Honor `prefers-reduced-motion`.
**Applies to:** Table rows, list items, cards, menu items.
**Acceptance:** Every hover ≤80ms. Zero hover shadows on dense surfaces. Reduced-motion collapses to 0ms.

---

### M-20 · The Right-Click Menace

**Symptom:** User right-clicks a table row expecting native context menu. Gets nothing, or gets a truncated custom menu that fights the OS.
**Cost:** Platform-inconsistent feel; lost productivity; power-user frustration.
**Fix:** Do not **override** the native context menu unless you have a *richer* one (multiple typed actions the user needs). If you do, replicate expected items (Copy, Open in new tab) and label them clearly. If you don't have richer, leave native behavior alone.
**Applies to:** Table rows, list items, editable cells, code editors (where the arena uses Monaco's native menu).
**Acceptance:** Zero custom context menus without native-behavior parity. Right-click on Monaco uses Monaco's menu.

---

## §UX-MICRO-03 — Forms & Validation

### M-21 · The Silent Invalid

**Symptom:** User fills a form, clicks Submit. Nothing happens. No error, no highlight, no scroll. They can't find what's wrong.
**Cost:** Form abandonment; rage-submit; support tickets.
**Fix:** On submit failure, **scroll to the first invalid field**, **focus it**, and show an inline error. Add an **error summary** at the top of the form with anchor links to each invalid field.
**Applies to:** Every form with >3 fields.
**Acceptance:** Error summary present on every multi-field form. Focus moves to first invalid field on submit failure.

---

### M-22 · The Late Validation

**Symptom:** User types an email. On every keystroke: "Invalid email." They haven't finished.
**Cost:** Users feel scolded; validation feels hostile; users stop typing mid-form.
**Fix:** Validate on **blur**, not on keystroke. Re-validate on keystroke **only after the first error** (to clear the error as they fix it). Never show an error before the user has finished interacting with the field.
**Applies to:** Every text input, email, password, phone.
**Acceptance:** Zod schema wraps blur/change events distinctly. Zero keystroke-validated fields on first entry.

---

### M-23 · The Password Purgatory

**Symptom:** User types a password. Rule: "Must contain 8+ chars, 1 uppercase, 1 number, 1 symbol, no dictionary words, no repeats." No indication of which rule they've satisfied.
**Cost:** Password creation takes 4× longer; users pick weak passwords out of frustration.
**Fix:** **Live rule checklist** as the user types — each rule ticks off in real-time as satisfied. Show the checker *before* submission, not after. Never use CAPTCHA (use rate limiting per §30).
**Applies to:** Registration, password reset, password change.
**Acceptance:** Real-time password rule checklist on every password field. zxcvbn score shown as strength bar.

---

### M-24 · The Autosave Void

**Symptom:** User writes a long post/article/application. They assume it's saved. They close the tab. It's gone.
**Cost:** Catastrophic — user loses hours of work; never returns.
**Fix:** Autosave with **visible status** — "Saved 2s ago", "Saving…", "Saved draft". For long-form content (posts, articles, applications, course descriptions), autosave every 5s to localStorage + every 30s to server. On return, prompt: "We found a saved draft. Recover?"
**Applies to:** Post composer, article editor, application form, course builder, assignment submission, Q&A drafts.
**Acceptance:** Autosave status visible in every long-form editor. Draft recovery prompt tested for each surface.

---

### M-25 · The Required Field Mystery

**Symptom:** User fills out a form. Submits. Error: "field X is required." Wait — it was never marked required.
**Cost:** User feels tricked; trust eroded.
**Fix:** Mark all required fields with a **visible indicator** (asterisk or "required" label). If most fields are required, invert: mark *optional* fields and say "All fields required unless marked optional." Never surprise.
**Applies to:** Every form.
**Acceptance:** Zero required fields without visual marker. Screen readers announce required state.

---

### M-26 · The Dropdown Dump

**Symptom:** User opens a "Country" dropdown with 195 options. No search. They scroll.
**Cost:** Form completion time × 10; abandonment on long lists.
**Fix:** Any list >15 options gets a **searchable combobox**. Country, language, skill, category, industry, company — all searchable. Alphabetical or frequency-sorted. Keyboard-navigable.
**Applies to:** Country, city, skill, category, industry, language, currency, company, org.
**Acceptance:** Every select >15 options is a combobox with search. Combobox a11y conformance verified.

---

### M-27 · The Focus Trap Escape

**Symptom:** User opens a modal, tabs through it, and focus escapes to the background page. Now the modal is still open, but the user is interacting with the hidden page behind.
**Cost:** Accessibility failure; keyboard users lose their place.
**Fix:** Modals must **trap focus** until closed. Tab from last element → first element (wrap). Shift+Tab from first → last. Escape closes. Focus returns to trigger.
**Applies to:** Every modal, dialog, drawer, sheet.
**Acceptance:** Focus trap test on every modal component. Zero escape in automated test.

---

### M-28 · The Field Re-Entry

**Symptom:** User enters shipping/billing info. Next step: "Re-enter your address."
**Cost:** WCAG 3.3.7 violation (Redundant Entry); user frustration.
**Fix:** Never ask for the same information twice. Prefill from profile, previous entry, or saved data. If a "different billing address" case exists, default to "same as above" with an opt-in to change.
**Applies to:** Application forms, checkout, institutional import, event registration.
**Acceptance:** Zero redundant fields across multi-step forms. WCAG 3.3.7 conformance evidence.

---

### M-29 · The Destructive Default

**Symptom:** User opens a "Clear filters" dropdown. The default highlighted option is "Reset all". They hit Enter.
**Cost:** Accidental data loss; user has to rebuild their filters.
**Fix:** The **safe option is the default**. Destructive actions are never the default-focused element. Confirm destructive actions explicitly. Provide undo where possible.
**Applies to:** Filter reset, form reset, bulk actions, leave-without-save.
**Acceptance:** Default-focus audit of every dropdown and menu. Zero destructive defaults.

---

### M-30 · The Copy-Paste Punishment

**Symptom:** User's password manager tries to fill the password field. It's blocked. Or they paste a TOTP code and it doesn't work.
**Cost:** WCAG 3.3.8 violation (Accessible Authentication); user cannot use their tools.
**Fix:** **Allow paste** in all fields. Never block paste. Never block password managers. Never require CAPTCHA as a gate. TOTP fields accept pasted codes (and handle spaces).
**Applies to:** Login, registration, TOTP, recovery codes, any input.
**Acceptance:** `onPaste` never prevented. Password manager autofill works. TOTP accepts paste.

---

## §UX-MICRO-04 — Empty States

### M-31 · The Empty Void

**Symptom:** User goes to "Saved Jobs." Blank page. No text, no CTA. "Is this broken?"
**Cost:** User assumes the feature doesn't work; doesn't discover the feature.
**Fix:** Every empty state has: **illustration or icon**, **one-sentence explanation**, **primary CTA** to the next action. Never blank. Never just "No data."
**Applies to:** Every list, every table, every dashboard panel.
**Acceptance:** Every list has a designed empty state. Empty state CTA is a primary button.

---

### M-32 · The Empty Dashboard

**Symptom:** New user logs in for the first time. Dashboard shows 6 empty widgets, no guidance, no next step.
**Cost:** 40%+ abandon within 2 minutes.
**Fix:** **First-session dashboard is different** from the steady-state dashboard. Show 3 guided actions with progress indicators. Adapt the second session based on what they did first.
**Applies to:** Candidate dashboard, recruiter dashboard, institution dashboard, admin console.
**Acceptance:** First-session variant defined per role. Tracked via `first_meaningful_action` event.

---

### M-33 · The Search That Finds Nothing

**Symptom:** User searches "React developer remote." Zero results. Blank screen. No suggestion.
**Cost:** User assumes no jobs exist; leaves.
**Fix:** Zero-result searches get **recovery UX**: "No matches for [query]. Try: [related term 1], [related term 2], [relax this filter]." Suggest relaxed filters, related skills, broader locations.
**Applies to:** Job search, course search, people search, company search, salary search.
**Acceptance:** Zero-result state has ≥2 recovery options. Search analytics track query→zero-result rate (target <10%).

---

### M-34 · The Permission Denied Void

**Symptom:** User navigates to a page they don't have access to. 404, or worse, a blank screen.
**Cost:** User thinks the platform is broken, not that they lack access.
**Fix:** Permission-denied is **explicit and actionable**: "You don't have access to this page. [Request access] or [Return to dashboard]." Never 404 on a permission issue. Never blank.
**Applies to:** Admin routes, institutional routes, recruiter-only views, org-scoped resources.
**Acceptance:** Zero 404s on permission-denied. Every denied state has a contact/request path.

---

### M-35 · The "Coming Soon" Black Hole

**Symptom:** User clicks a menu item. "Coming soon." No timeline, no alternative.
**Cost:** User perceives the product as incomplete; trust erodes.
**Fix:** Either **hide** the feature entirely (cleaner), or show a **waitlist/notify-me** option with a realistic timeline. Never show "Coming soon" without a way to be notified.
**Applies to:** Deferred features, OD-gated items, Phase 8+ surfaces.
**Acceptance:** Zero "coming soon" without an email capture. Feature flags hide deferred surfaces by default.

---

### M-36 · The Draft Graveyard

**Symptom:** User wrote a post draft months ago. It's still there, halfway done, cluttering their drafts list.
**Cost:** Clutter; user feels bad about "unfinished work"; abandonment of the composer.
**Fix:** Auto-archive drafts after 30 days of no edit. Send a "Still working on this?" nudge at day 25. Draft archived, not deleted — one-click restore.
**Applies to:** Post drafts, article drafts, application drafts, migration imports.
**Acceptance:** Auto-archive job runs daily. Nudge at day 25. Restore path tested.

---

### M-37 · The Emptied Notification Center

**Symptom:** User clears all notifications. Blank screen. No satisfaction, no direction.
**Cost:** Missed opportunity to re-engage; user leaves the page.
**Fix:** "You're all caught up" with a **suggested next action** — recent jobs matching your profile, new courses, unread messages, pending tasks. Empty notifications ≠ dead end.
**Applies to:** Notifications, messages inbox, task lists.
**Acceptance:** Every "all caught up" state has ≥1 next-action suggestion.

---

## §UX-MICRO-05 — Error Handling

### M-38 · The Blame-Free Error

**Symptom:** Error message: "Invalid input." What input? Which field? Why?
**Cost:** User cannot recover; abandons.
**Fix:** Every error message must: **(1) say what happened**, **(2) say why**, **(3) say what to do**. Never blame the user. Never use system jargon. Never expose a stack trace or correlation ID without explanation.
**Applies to:** Every user-facing error.
**Acceptance:** Error message audit per release. `error_code_catalog` maps every code to a human-readable message + action.

---

### M-39 · The Correlation ID Whisper

**Symptom:** Error: "Something went wrong. Reference: abc-123." User has no idea what to do with that.
**Cost:** User cannot self-recover; support ticket volume increases.
**Fix:** Every error page shows a **correlation ID** with a **copy button** and the text "Quote this ID if you contact support." Pair with a **retry button** and a link to support. Never show a raw ID without context.
**Applies to:** All error pages (500-class, timeout, dependency failure).
**Acceptance:** Every error surface has copy-ID button + retry + support link.

---

### M-40 · The Retry That Doesn't

**Symptom:** Error page says "Try again." User clicks. Same error, immediately, with no additional info.
**Cost:** User loses trust in the retry affordance; abandons.
**Fix:** Retry must **have a chance of succeeding**. If the underlying dependency is down, retry waits (backoff) or explains ("Our payment provider is temporarily unavailable"). Never offer retry on a non-retryable error.
**Applies to:** Dependency failures, timeouts, 5xx.
**Acceptance:** Retry button only on retryable errors. Non-retryable errors offer alternate paths.

---

### M-41 · The Hostile Validation

**Symptom:** Error: "Username already taken." User rage-quits because they spent 5 minutes crafting a username.
**Cost:** Form abandonment; user feels unwelcome.
**Fix:** Validation errors are **constructive, not accusatory**. For taken usernames, suggest alternatives ("Try: raj_2026, raj_dev, raj.codes"). For weak passwords, show what's missing, not just "too weak". For invalid emails, say "This doesn't look like an email address. Check for typos."
**Applies to:** Every validation error.
**Acceptance:** Zero errors that only state "invalid" or "taken." Every error offers a next step.

---

### M-42 · The Offline Blame

**Symptom:** User is on a train. They try to post. Error: "Something went wrong." No indication that they're offline.
**Cost:** User blames the platform; doesn't understand why posting failed.
**Fix:** Detect `navigator.onLine`. When offline, show explicit "You're offline. We'll send this when you're back." Queue the action. When back online, execute automatically.
**Applies to:** Post composer, message send, form submission, comment.
**Acceptance:** Offline banner visible. Offline actions queued. Auto-retry on reconnection.

---

### M-43 · The Partial Failure

**Symptom:** User bulk-imports 500 students. 487 succeed, 13 fail. The screen says "Import complete." The 13 failures are invisible.
**Cost:** Silent data loss; user doesn't know which records to fix.
**Fix:** Bulk operations report **explicit partial-success state**: "487 of 500 imported. 13 failed. [Download error report]." Never say "complete" when partial. Never hide failures.
**Applies to:** Bulk import, bulk actions, migration, batch assignment, bulk exports.
**Acceptance:** Every bulk operation has a partial-success UI state. Error report downloadable as CSV.

---

### M-44 · The Cascading Failure

**Symptom:** User tries to view a job. The page errors because the *salary widget* failed. The whole job detail is gone.
**Cost:** One failure breaks everything; user can't access the primary content.
**Fix:** **Isolate failures per region.** The job description should still render even if the salary widget fails. Each region has its own error boundary with a degraded state.
**Applies to:** Any page with multiple data sources.
**Acceptance:** Every page has ≥2 error boundaries. Region failure never blanks the page.

---

### M-45 · The Angry Error Color

**Symptom:** A minor warning (e.g., "This job posting expires in 3 days") is shown in the same red as a fatal error. User panics.
**Cost:** Users can't distinguish severity; real errors get lost in the noise.
**Fix:** **Severity-appropriate color.** Error (red, danger) for blocking failures. Warning (amber) for attention-needed. Info (blue/neutral) for context. Success (green) for confirmations. Never use red for non-errors.
**Applies to:** All messaging surfaces.
**Acceptance:** Severity-color mapping enforced in Aura tokens. Zero red non-errors.

---

### M-46 · The Error Without Exit

**Symptom:** User hits a 403. Page shows error. No navigation, no back button visible, no link to home.
**Cost:** User is trapped; closes tab.
**Fix:** Every error page has **≥2 exit paths**: back, home, contact support, retry, or an alternative action. Never a dead-end error.
**Applies to:** 403, 404, 500, timeout, dependency-failure pages.
**Acceptance:** Zero dead-end error pages. Every error has exit paths.

---

### M-47 · The Auto-Dismiss Surprise

**Symptom:** User is reading a toast. It disappears in 3 seconds before they can read it. Or worse, the toast contains the only "Undo" button.
**Cost:** Missed critical info; missed undo; accidental deletion.
**Fix:** Info toasts auto-dismiss after ≥6s. Action toasts (with Undo) **never auto-dismiss** — they require explicit dismissal. Critical errors never auto-dismiss. Hovering a toast pauses its timer.
**Applies to:** All toasts.
**Acceptance:** Action toasts require manual dismiss. Hover pauses timer. No auto-dismissal for errors.

---

### M-48 · The Silent Failure

**Symptom:** User clicks something. Nothing happens. No error, no loading, no state change. Just nothing.
**Cost:** User cannot determine if it worked; retries; double-submits; loses trust.
**Fix:** **Every click produces visible feedback within 100ms** (see M-02). If the click did nothing, either disable the element or remove it. Never a silent no-op.
**Applies to:** Every interactive element.
**Acceptance:** Automated click test on every button verifies state change within 100ms.

---

## §UX-MICRO-06 — Notifications & Toasts

### M-49 · The Toast Avalanche

**Symptom:** User performs a bulk action. 47 toasts cascade down the screen, each stacking on top of the last.
**Cost:** Visual chaos; important messages buried; users dismiss without reading.
**Fix:** **Group related toasts.** "47 items archived" — one toast with a "View details" link. Max 3 concurrent toasts. Queue the rest. Never stack more than 3 visually.
**Applies to:** Bulk actions, batch operations, multi-item processes.
**Acceptance:** Toast grouping implemented. Max 3 concurrent. Queue accessible.

---

### M-50 · The Toast That Blocks

**Symptom:** User is about to click "Submit" but a toast is covering the button.
**Cost:** Accidental toast dismissal; missed submission.
**Fix:** Toasts appear in a **non-blocking position** — bottom-right or top-right, never over primary CTAs. Never full-width. Never center-screen. Respect safe zones.
**Applies to:** All toasts.
**Acceptance:** Toast position never overlaps primary actions. Verified by screenshot test.

---

### M-51 · The Notification Flood

**Symptom:** User gets 12 notifications in 5 minutes. Follow, comment, mention, reaction, follow, comment…
**Cost:** Notification fatigue; user disables notifications entirely.
**Fix:** **Group and coalesce** (NTF-012). "3 people reacted to your post." "2 new comments." "5 new followers." Digest when >5 events in 15 minutes. Never one notification per event when events cluster.
**Applies to:** Social notifications, community notifications, course announcements.
**Acceptance:** Grouping rules per event type. Digest threshold configurable. Verified in staging.

---

### M-52 · The Email That Never Arrives

**Symptom:** User requests a password reset. Nothing arrives. They check spam — nothing.
**Cost:** User cannot access account; support ticket; potential churn.
**Fix:** After sending, show **explicit confirmation**: "We sent a reset link to raj@example.com. Check your spam folder if it doesn't arrive within 2 minutes." Add a "Resend" button (rate-limited) after 30 seconds.
**Applies to:** Password reset, verification email, job alert email, digest.
**Acceptance:** Every email-triggering action shows recipient + spam guidance + resend.

---

### M-53 · The Unsubscribe Maze

**Symptom:** User wants to unsubscribe from emails. Link goes to a "preferences" page requiring login, then a settings page, then a modal.
**Cost:** User marks as spam; sender reputation damaged; legal compliance risk.
**Fix:** **One-click unsubscribe** (RFC 8058). Link in email footer directly unsubscribes without login. Confirm on-page. Offer "Adjust preferences" as optional next step, never as required.
**Applies to:** Newsletters, digests, marketing, job alerts.
**Acceptance:** One-click unsubscribe per email. RFC 8058 compliance verified.

---

### M-54 · The Silent Notification

**Symptom:** User receives an important notification (offer received, application rejected) but there's no visual or audible signal. They miss it.
**Cost:** Missed opportunities; user blames platform.
**Fix:** Critical notifications (application status, offer, hire, message) get **in-app toast + email + optional push**. Ambient notifications (reactions, follows) get in-app only. Never silent for time-sensitive items.
**Applies to:** Application status, offers, messages, mentorship requests, license expiry.
**Acceptance:** Notification matrix per §2.6. Critical = multi-channel; ambient = in-app only.

---

### M-55 · The Badge That Lies

**Symptom:** Notification badge shows "3" but opening the panel shows "0 new". Or badge shows "0" but there's an unread message.
**Cost:** User loses trust in the badge; ignores notifications.
**Fix:** Badge count **must match actual unread**. Reconcile on every panel open. Server-authoritative count. Never optimistic count that can drift.
**Applies to:** Notification bell, messages badge, unread count anywhere.
**Acceptance:** Badge-count reconciliation test. Zero drift in soak test.

---

## §UX-MICRO-07 — Navigation & Wayfinding

### M-56 · The Unsaved Warning

**Symptom:** User has a half-filled application form. They click a nav link. Form is gone. No warning.
**Cost:** Data loss; user rage-quits.
**Fix:** Before navigating away from a dirty form, show a **confirmation dialog**: "You have unsaved changes. Leave anyway?" This applies to back button, nav clicks, external link clicks, and refresh (beforeunload).
**Applies to:** Application forms, course builder, post composer, profile edits, migration wizard.
**Acceptance:** Dirty-form guard on every form with >5 fields. Back/refresh/nav all intercepted.

---

### M-57 · The Breadcrumb Void

**Symptom:** User navigates deep: Jobs → Senior Engineer at Acme → Apply. They want to go back to the job detail. No breadcrumb.
**Cost:** User clicks browser back repeatedly; loses context.
**Fix:** Every page deeper than 2 levels shows a **breadcrumb**. Even better: a "Back to [parent]" link near the page title.
**Applies to:** Job detail, course detail, application detail, profile detail, admin detail pages.
**Acceptance:** Breadcrumb on every detail page. Parent link tested.

---

### M-58 · The Modal Inception

**Symptom:** User opens a modal. Inside it, a link opens another modal. Inside that, another.
**Cost:** User loses context; cannot close; UX trap.
**Fix:** **Modals never open other modals.** If a flow needs multiple steps, use a single modal with a stepper, or navigate to a full page. Escape always closes the *current* thing.
**Applies to:** Every modal.
**Acceptance:** Zero nested modals. Escape handling tested.

---

### M-59 · The Back Button Betrayal

**Symptom:** User clicks browser back. Instead of going to the previous page, they get logged out, or land on the login page, or the app redirects them to the dashboard.
**Cost:** User loses their place; breaks browser expectations.
**Fix:** Back button must **respect browser history**. Never intercept back to redirect. If a user is on a page they shouldn't be on (e.g., logged out), back takes them to the previous valid page, not home.
**Applies to:** All routes.
**Acceptance:** Browser back behavior tested per route. No forced redirects.

---

### M-60 · The Deep Link Surprise

**Symptom:** User shares a job link on WhatsApp. Friend clicks it. Gets "You must log in." Logs in. Lands on the dashboard, not the job.
**Cost:** Broken sharing; lost viral loop.
**Fix:** Deep links **preserve destination**. Login page accepts `?return=` param. Post-login redirect honors it. Never drop the destination.
**Applies to:** Jobs, courses, profiles, posts, articles, events.
**Acceptance:** Deep-link login flow tested. `return` param preserved.

---

### M-61 · The Mobile Menu Maze

**Symptom:** On mobile, user taps the hamburger. 40-item menu drops down. They can't find anything.
**Cost:** Mobile usability collapses; feature discovery dies.
**Fix:** Mobile nav shows **5 primary items max** (bottom tab bar). Everything else lives in a "More" sheet or search. Group by task, not by module.
**Applies to:** Mobile navigation for all roles.
**Acceptance:** Bottom nav ≤5 items on mobile. All major flows reachable in ≤3 taps.

---

### M-62 · The Active State Amnesia

**Symptom:** User is on the "Jobs" page but the sidebar shows "Dashboard" as active. They're lost.
**Cost:** User can't tell where they are.
**Fix:** Active state matches the **current page**, not the last clicked link. Sub-routes activate their parent (`/jobs/[id]` → "Jobs" active). Persistent across reloads.
**Applies to:** Sidebar, top nav, tab bars.
**Acceptance:** Active state test on every route. Sub-route parent activation verified.

---

### M-63 · The Search Bar Disappearing Act

**Symptom:** User is on a list page. They scroll down. The search bar scrolls away. They have to scroll up to search again.
**Cost:** Repeated scrolling; frustration on long lists.
**Fix:** Search bar **sticky at top** on list pages. Same for filter controls. The controls stick; the content scrolls.
**Applies to:** Job list, course list, application list, people search, admin tables.
**Acceptance:** Sticky search/filters on every list page. Sticky behavior tested.

---

### M-64 · The Modal Escape

**Symptom:** User opens a modal, presses Escape, nothing happens. Or it closes the wrong thing.
**Cost:** Users feel trapped in modals.
**Fix:** **Escape always closes the topmost dismissible layer.** This is universal. Escape on a modal closes the modal. Escape on a dropdown closes the dropdown. Escape on a form with a dirty state shows the confirmation. Never let Escape do nothing.
**Applies to:** Every dismissible layer.
**Acceptance:** Escape handler on every modal, dropdown, drawer. Tested via keyboard-only sweep.

---

## §UX-MICRO-08 — Data Freshness & Concurrency

### M-65 · The Stale Data Trap

**Symptom:** User has the jobs page open in one tab. Recruiter changes salary in another. User applies at old salary. Contract disputes.
**Cost:** Legal risk; user distrust.
**Fix:** Re-validate critical fields **at submission time**. If salary/role/dates have changed since the user last loaded the page, show a diff and require re-confirmation.
**Applies to:** Applications, purchases, offers, contract acceptance.
**Acceptance:** Pre-submit re-validation on every high-stakes form. Diff UI tested.

---

### M-66 · The Concurrent Edit Conflict

**Symptom:** Two admins edit the same course. Both save. Second save silently overwrites the first.
**Cost:** Silent data loss; user distrust.
**Fix:** **Optimistic concurrency** on every multi-user editable resource. On conflict, return 409 with a diff ("Someone else changed this. Review changes before saving."). Never silent overwrite.
**Applies to:** Course builder, org profile, institutional settings, admin config, job posting.
**Acceptance:** Version column on every concurrency-sensitive table. 409 on stale save.

---

### M-67 · The Stale Badge

**Symptom:** User's dashboard shows "5 new applications" but it was last refreshed 2 hours ago and there are actually 12.
**Cost:** User acts on stale information; trusts numbers less.
**Fix:** Any live-updating surface shows **last-updated timestamp** + a subtle refresh button. Never present stale data as fresh.
**Applies to:** Dashboard widgets, admin metrics, analytics, recruiter pipeline.
**Acceptance:** Every stale-able surface has last-updated timestamp. Manual refresh available.

---

### M-68 · The Refresh That Loses State

**Symptom:** User has filters applied, page 3 selected, sorted by date. They refresh. All filters reset.
**Cost:** User has to re-apply every filter; frustration.
**Fix:** Filters, sort, and pagination persist in **URL params**. Refresh preserves everything. Shareable via URL.
**Applies to:** Every list, search, and filterable surface.
**Acceptance:** All filter state in URL. Refresh preserves state. Shareable links work.

---

### M-69 · The Optimistic Avatar

**Symptom:** User uploads a new avatar. It shows immediately. 10 seconds later, it reverts because the server rejected it (bad format). No error.
**Cost:** User confused; thinks the avatar feature is broken.
**Fix:** Optimistic image uploads **require visible upload progress + success/failure feedback**. Show the new avatar as a *preview* (with a "processing" badge) until the server confirms. On failure, revert to old and show error.
**Applies to:** Avatar, cover, portfolio images, post media, course thumbnails.
**Acceptance:** Upload progress visible. Preview state shown until server confirm. Failure reverts.

---

### M-70 · The Save That Doesn't

**Symptom:** User clicks "Save" on a settings change. Button says "Saved ✓". User comes back tomorrow. The setting is back to default.
**Cost:** Silent data loss; trust collapse.
**Fix:** "Saved" means **server-confirmed**. Never show a success state until the server has acknowledged the write. If the write later fails (rare), retry silently and only surface to the user if retries exhaust.
**Applies to:** Every save action.
**Acceptance:** Success state only after server 200. Retry logic for transient failures.

---

### M-71 · The Optimistic Follow

**Symptom:** User follows someone. The button flips to "Following". 3 seconds later, it flips back. No explanation.
**Cost:** User doesn't know if they're following; may follow again; confuses the followed person.
**Fix:** Low-stakes optimistic updates (follow, react, bookmark) are OK, **but must show rollback**. A tiny inline "Couldn't follow. Try again." near the button. Never silent rollback.
**Applies to:** Follow, react, bookmark, save, mute, hide.
**Acceptance:** Silent-rollback audit. Every optimistic pattern has visible rollback.

---

## §UX-MICRO-09 — Motion & Transition

### M-72 · The Motion Sickness

**Symptom:** User has `prefers-reduced-motion: reduce` set. Page still plays a 400ms slide-in animation.
**Cost:** Accessibility violation; users with vestibular disorders experience nausea.
**Fix:** Honor `prefers-reduced-motion` **everywhere**. Collapse animations to 0ms or a simple opacity fade. Never override user preference.
**Applies to:** Every animation, transition, parallax, auto-play video.
**Acceptance:** Reduced-motion verification on every animated surface. Automated test enforces.

---

### M-73 · The Slow Fade

**Symptom:** User clicks a tab. Content takes 400ms to fade in. Feels sluggish.
**Cost:** Every interaction feels 400ms slower than it is.
**Fix:** **Motion is ≤150ms** (Dense Profile §5.4.1). Hover 80ms. Transitions 120–150ms. Never 300ms+ for utility interactions. Motion is for orientation, not decoration.
**Applies to:** Tabs, dropdowns, modals, page transitions, list updates.
**Acceptance:** Motion audit. All utility motion ≤150ms.

---

### M-74 · The Bouncy Button

**Symptom:** User clicks a button. It bounces. It overshoots. It settles. Adorable. Slow.
**Cost:** Playful ≠ professional. Reads as toys, not tools.
**Fix:** **No bounce, no spring, no overshoot.** Ease-out. Fast in, fast out. Motion conveys causality, not personality.
**Applies to:** Every interactive element.
**Acceptance:** Motion library audit. Zero spring/overshoot on utility transitions.

---

### M-75 · The Flash of Unstyled Content

**Symptom:** User loads the page. For 200ms, raw HTML with no CSS is visible. Then the stylesheet kicks in.
**Cost:** Perceived as broken/slow; trust damaged.
**Fix:** **Inline critical CSS** in the initial HTML. Load the rest asynchronously. Never let raw HTML flash. Server-render above-the-fold styles.
**Applies to:** Every page load.
**Acceptance:** Zero FOUC in Lighthouse CI. Critical CSS inlined.

---

### M-76 · The Jumpy Scroll

**Symptom:** User scrolls a list. New items load. The scroll position jumps up 200px because content was inserted above.
**Cost:** User loses their place; scrolls back down; frustration.
**Fix:** Never insert content **above** the current scroll position without compensating. Infinite scroll appends **below**. If content must be prepended, use scroll anchoring.
**Applies to:** Infinite lists, feeds, message threads, comments.
**Acceptance:** Scroll anchoring verified on every infinite list.

---

### M-77 · The Silent Transition

**Symptom:** User clicks "Next" in a multi-step form. The form changes. But there's no transition indicator — did it advance? Did it fail?
**Cost:** User hesitates; double-clicks; loses place.
**Fix:** Step transitions use a **subtle directional slide** (80–120ms) to communicate forward vs. backward motion. Progress bar updates. Never a hard cut.
**Applies to:** Multi-step forms, wizards, onboarding, checkout.
**Acceptance:** Directional transitions on every step-based flow.

---

### M-78 · The Autoplay Ambush

**Symptom:** User opens a course player. Video auto-plays at full volume.
**Cost:** Startles user; often mutes and never unmutes; dark pattern.
**Fix:** Video **never auto-plays with sound**. If autoplay is enabled (course player), it's **muted**. User opts into sound. No exceptions.
**Applies to:** Course player, interview recordings, event streams.
**Acceptance:** Autoplay muted-only. Unmute requires explicit user action.

---

## §UX-MICRO-10 — Mobile-Specific

### M-79 · The Tap Target Trap

**Symptom:** User taps a small "×" to close a modal. Misses. Taps again. Misses. Modal stays open.
**Cost:** Mobile usability collapses; users rage-close the app.
**Fix:** **44×44px minimum** for every tappable element on mobile. Use padding, not visual size. Close buttons in particular are often too small.
**Applies to:** Every tap target on every mobile surface.
**Acceptance:** Automated mobile a11y audit. Zero violations.

---

### M-80 · The Keyboard Cover

**Symptom:** User taps a text input near the bottom of the screen. The keyboard covers the input. They type blind.
**Cost:** Cannot complete the form; abandonment.
**Fix:** Scroll the focused input into view **above the keyboard**. Reserve space with `scroll-padding-bottom`. Never let the keyboard cover the active input.
**Applies to:** Every form on mobile.
**Acceptance:** Keyboard-cover test on iOS Safari + Android Chrome.

---

### M-81 · The Swipe Back Surprise

**Symptom:** On iOS, user swipes from left edge to go back. Instead of navigating back, they trigger a horizontal carousel or a menu drawer.
**Cost:** Breaks OS expectations; user confusion.
**Fix:** **Never intercept edge-swipe-back** unless the screen is a modal or full-screen sheet. Carousels start after 20px inset. Respect OS gestures.
**Applies to:** Every mobile screen.
**Acceptance:** Edge-swipe-back works on all non-modal screens.

---

### M-82 · The Slow Tap

**Symptom:** User taps a button. Nothing happens for 300ms. They tap again. Now two actions fire.
**Cost:** Double-actions; incorrect state.
**Fix:** On tap, **immediately** disable the button and show a pressed state. Don't wait for the API. 100ms rule (M-02) applies on mobile too.
**Applies to:** Every tappable action on mobile.
**Acceptance:** Mobile tap test on every action.

---

### M-83 · The Pull-to-Refresh Fight

**Symptom:** User pulls down to refresh. Instead of refreshing, they scroll up slightly and the page bounces.
**Cost:** Broken muscle memory; frustration.
**Fix:** Implement **pull-to-refresh** on every list surface. Match OS behavior — resistance curve, threshold, spring release.
**Applies to:** Job list, course list, feed, notifications, messages.
**Acceptance:** Pull-to-refresh on every list. Behavior matches native.

---

### M-84 · The Bottom Sheet Trap

**Symptom:** User opens a bottom sheet. Taps outside to dismiss. Sheet stays. Taps again. Nothing.
**Cost:** User feels trapped; closes the app.
**Fix:** Bottom sheets dismiss on **tap-outside + swipe-down + Esc**. Always. Even if the sheet has unsaved data, prompt before dismiss.
**Applies to:** Every bottom sheet, action sheet, half-modal.
**Acceptance:** Dismiss behavior tested on every sheet.

---

### M-85 · The Landscape Lobotomy

**Symptom:** User rotates phone to landscape. The layout breaks — elements overlap, buttons vanish, content is cut off.
**Cost:** Unusable in landscape; accessibility issue (users who can only use landscape).
**Fix:** Every screen **works in both orientations**. Or explicitly lock to portrait with a clear reason. Never silently break.
**Applies to:** Every screen (or documented portrait-lock list).
**Acceptance:** Landscape audit on every critical screen.

---

## §UX-MICRO-11 — Accessibility Micro-Details

### M-86 · The Invisible Focus Ring

**Symptom:** User tabs through a page. They can't see where focus is. Every element looks the same.
**Cost:** Keyboard users cannot navigate; accessibility failure.
**Fix:** **Visible focus ring on every focusable element** (2px solid, ≥3:1 contrast — WCAG 2.4.13). Never `outline: none` without replacement. Never a subtle 1px ring.
**Applies to:** Every focusable element.
**Acceptance:** Focus-visible audit. Contrast measured. Zero missing focus rings.

---

### M-87 · The Screen Reader Silence

**Symptom:** A toast appears. Screen reader says nothing. Content updates. Screen reader doesn't announce.
**Cost:** SR users miss all dynamic content.
**Fix:** Dynamic updates use `role="status"` (polite) or `role="alert"` (assertive). Toasts, validation errors, and loading completions all announce.
**Applies to:** Toasts, errors, loading completions, dynamic list updates.
**Acceptance:** SR announcement test on every dynamic surface. NVDA + VoiceOver.

---

### M-88 · The Heading Hierarchy Chaos

**Symptom:** Screen reader user navigates by heading. Page has h1, then h4, then h2. Confusing structure.
**Cost:** SR users cannot build mental model of the page.
**Fix:** **Logical heading hierarchy** on every page. One h1. No skipped levels. Every section has a heading.
**Applies to:** Every page.
**Acceptance:** Heading audit per release. Zero skips.

---

### M-89 · The Alt Text Void

**Symptom:** SR user lands on a page with 12 images. All say "image". No context.
**Cost:** Critical information inaccessible.
**Fix:** **Descriptive alt text** on every meaningful image. `alt=""` for purely decorative. Never `alt="image"`.
**Applies to:** Every image.
**Acceptance:** Alt-text audit. Zero unlabeled meaningful images.

---

### M-90 · The Form Label Void

**Symptom:** SR user tabs to an input. It says "edit text". No label. They don't know what to type.
**Cost:** Form unusable via SR.
**Fix:** Every input has a **programmatically associated label** (`<label for>`). Placeholders are not labels. ARIA labels for icon-only inputs.
**Applies to:** Every form input.
**Acceptance:** Label audit. Zero unlabeled inputs.

---

### M-91 · The Color-Only Cue

**Symptom:** Form error is shown by red border only. Colorblind user cannot see it.
**Cost:** WCAG 1.4.1 violation; form unusable.
**Fix:** Errors use **color + icon + text**. Never color alone. Same for success, warnings, and status indicators.
**Applies to:** Every status indicator, error, validation.
**Acceptance:** Color-only audit. Zero color-only indicators.

---

### M-92 · The Invisible Loading

**Symptom:** User clicks "Load more". Nothing visible changes. SR user doesn't know content is loading.
**Cost:** User thinks nothing happened; retries; confusion.
**Fix:** Loading states announce via `aria-live` or `aria-busy`. The button changes to "Loading…" with visible state.
**Applies to:** Load-more buttons, infinite scroll, async content.
**Acceptance:** Loading states announced. Verified via NVDA/VoiceOver.

---

### M-93 · The Skip Nav Absence

**Symptom:** Keyboard user lands on a page with 40 nav items. They have to tab through all of them to reach content.
**Cost:** Keyboard users take 40 tabs to reach main content.
**Fix:** **Skip-to-main-content link** is the first focusable element. Visible on focus.
**Applies to:** Every page.
**Acceptance:** Skip-nav present + working on every page.

---

### M-94 · The Reduced-Motion Ignore

**Symptom:** User has `prefers-reduced-motion` enabled. Progress bar still animates. Spinner still spins.
**Cost:** Motion-sensitive users feel ill.
**Fix:** Honor reduced-motion **everywhere**. Even spinners get a static "Loading…" text alternative.
**Applies to:** Every animated element.
**Acceptance:** Reduced-motion verification.

---

### M-95 · The Zoom Blocker

**Symptom:** User pinch-zooms to read text. Page doesn't zoom because `user-scalable=no`.
**Cost:** WCAG 1.4.4 violation.
**Fix:** **Never disable pinch zoom.** Never `user-scalable=no`. Never `maximum-scale=1`. Users have the right to zoom.
**Applies to:** Every page's viewport meta.
**Acceptance:** Viewport audit. Zero zoom-blocked pages.

---

## §UX-MICRO-12 — Performance Perception

### M-96 · The Perceived Speed Trick

**Symptom:** User waits for actual data to load. The page feels slow even if it's technically fast.
**Cost:** Perceived speed drives satisfaction more than actual speed.
**Fix:** **Prioritize perceived speed.** Skeleton first, then real content. Primary content above-the-fold loads first. Secondary content streams after. The user perceives the page as fast.
**Applies to:** Every content-heavy page.
**Acceptance:** Perceived-load-time measurement post-launch. Target: perceived <1.5s on 4G.

---

### M-97 · The Above-the-Fold First

**Symptom:** Page loads all content at once. Above-the-fold is delayed by below-the-fold.
**Cost:** User waits longer for what they see first.
**Fix:** **Above-the-fold content loads first, below-the-fold lazily.** Images below fold use lazy loading. Charts render only when scrolled into view.
**Applies to:** All long pages.
**Acceptance:** LCP <2.5s on mobile. Lazy loading verified.

---

### M-98 · The Image Optimization Gap

**Symptom:** User loads a page with 20 images. Each is a 4MB PNG.
**Cost:** Slow load; excessive bandwidth; higher bounce.
**Fix:** Images served in **WebP/AVIF** with responsive `srcset`. Lazy-loaded below fold. Compressed. CDN-served. Never serve a 4MB PNG for a 200×200 avatar.
**Applies to:** Every image.
**Acceptance:** Image audit. LCP image <200KB. All images modern format.

---

### M-99 · The Font Blink

**Symptom:** Page loads. Font flashes from system font to custom font. Text jumps.
**Cost:** Visual jank; perceived as broken.
**Fix:** Use `font-display: swap` and **preload critical fonts**. Subset fonts. Never load 12 weights of a variable font.
**Applies to:** Every custom font.
**Acceptance:** Zero font flash. Font preload verified.

---

### M-100 · The Bundle Bloat

**Symptom:** User loads the login page. They download 2MB of JavaScript for the entire app.
**Cost:** Slow load; wasted bandwidth; high bounce.
**Fix:** **Route-based code splitting**. Each route loads only its code. Shared code is cached. Never load the whole app on the first page.
**Applies to:** Every route.
**Acceptance:** Route bundles ≤200KB gzipped (§35.2). No shared bundle >150KB.

---

## 11. UX Acceptance

Every major feature needs:
- happy path;
- loading;
- empty;
- error;
- offline/reconnect where applicable;
- permission denied;
- destructive action safety;
- keyboard/focus;
- reduced-motion behavior.

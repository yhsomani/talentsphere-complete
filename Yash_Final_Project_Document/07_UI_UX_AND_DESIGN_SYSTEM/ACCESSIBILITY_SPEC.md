# Accessibility Specification — WCAG 2.2 AA Design Targets & Test Plan

Doc ID: UI-06 · Owner: Accessibility Lead · Version 1.0 · Status: Under Review · Relates: GOAL-06, ADR-T03, ADR-T19, FF-09, UI-05 `DESIGN_SYSTEM.md`, UI-02 `SCREEN_REGISTRY.md`, UI-07 `PROGRESSIVE_UX_AND_FEEDBACK.md`

Supersedes nothing; linked from the folder index and `MASTER_INDEX`. **WCAG 2.2 AA is a design target. No conformance has been measured; nothing here claims the product conforms.** Success criteria (SC) listed from the W3C "What's new in WCAG 2.2" / WCAG 2.2 Recommendation as cited in RES-01 R3; 4.1.1 Parsing is obsolete in 2.2 and omitted. Sources of truth for measurements are the tests in §10.

## 1. Policy decisions [TARGET]

| ID | Decision | Rationale |
|---|---|---|
| A11Y-D1 | Touch/pointer targets ≥ **44 × 44 CSS px** product-wide (design-system `--ts-target-min`); WCAG 2.5.8 AA floor (24 × 24 with spacing exception) is the *conformance minimum*, 44 px is the product standard (aligns with AAA 2.5.5 intent). Dense desktop tables may use 32 px only with ≥ 8 px gaps and an alternative bulk control. | Mobile-first candidates, motor accessibility. |
| A11Y-D2 | Every drag interaction has a non-drag equivalent (2.5.7): board moves, reorder lists, file drop, slider. | Pipeline board and portfolio ordering. |
| A11Y-D3 | No cognitive function test to authenticate (3.3.8): passkeys, password managers, paste allowed, emailed link/code; no CAPTCHA-style image puzzles as the only path (bot defence uses invisible risk signals with accessible fallback — [OPEN-UX-09]). | Login, referee, signup. |
| A11Y-D4 | Previously entered information is never re-requested within a flow (3.3.7). | Application form, onboarding. |
| A11Y-D5 | Help mechanisms in the same relative place on every page (3.2.6): "Help" link in TopBar and form footers; support contact consistent. | Shell-owned. |
| A11Y-D6 | Sticky elements (TopBar, BottomNav, ActionBar, offline banner, support-access banner) must never fully obscure a focused element (2.4.11); design aims at *not obscured at all* (2.4.12 AAA) for form fields. | Mobile bottom-nav + sticky action bars. |
| A11Y-D7 | Timeouts: no content timeout shorter than 20 h without warning and extension (2.2.1) **except** timed assessments (essential exception) — which offer pre-declared accommodations (extra time, pause where integrity rules allow) via `ACT-ASM-09`. | Assessments. |
| A11Y-D8 | Accessibility conformance claims are made only from audit evidence (independent audit + AT user testing, [OPEN-UX-10]). | Honesty. |

## 2. WCAG 2.2 A + AA success-criteria mapping

Legend: **Where** = design artefact owning the control; **AC** = measurable acceptance criterion (pass/fail, testable); **T** = test type (A automated axe/lint, M manual, U user/AT test).

### 2.1 Perceivable

| SC | Lvl | Design response | Measurable acceptance criterion | T |
|---|---|---|---|---|
| 1.1.1 Non-text content | A | Informative images have alt; decorative `alt=""`/`aria-hidden`; icons paired with text; charts have data table; rung icons have text | 0 images without `alt` attr; every `IconButton` has accessible name; every chart has adjacent table or summary | A, M |
| 1.2.1 Audio/video-only | A | Course audio-only gets transcript | 100 % of published audio-only items have transcript before publish (publish check) | M |
| 1.2.2 Captions (prerecorded) | A | Course video requires captions to publish; platform instructor tooling blocks publish otherwise | 0 published videos without caption track | A (publish gate) |
| 1.2.3 Audio description or media alternative | A | Transcript with described visuals, or description track | Transcript includes visual info for 100 % of videos where visuals carry info (instructor checklist) | M |
| 1.2.4 Captions (live) | AA | No live streams at launch; if added, live captions required | N/A until live feature; gate in feature intake | — |
| 1.2.5 Audio description (prerecorded) | AA | Description track or extended transcript required for instruction-critical visuals | Publish checklist item answered; sampled audit 20 videos | M |
| 1.3.1 Info and relationships | A | Semantic landmarks, headings, lists, tables with `th scope`, `fieldset/legend`, `aria-describedby` for help/error | axe `region`, `heading-order`, `label`, `th-has-data-cells` 0 violations; exactly one `h1`/route | A |
| 1.3.2 Meaningful sequence | A | DOM order = visual order; no positive `tabindex` | 0 positive tabindex; reading-order walkthrough passes on 10 key screens | A, M |
| 1.3.3 Sensory characteristics | A | Instructions do not rely on shape/colour/position alone ("the green button") | Copy review checklist: 0 instructions using colour/position only | M |
| 1.3.4 Orientation | AA | No orientation lock; PWA manifest `orientation: any` | Manifest value verified; every screen usable in both orientations | A, M |
| 1.3.5 Identify input purpose | AA | `autocomplete` tokens on personal-data fields | 100 % of name/email/tel/address/org/password fields carry correct token (lint) | A |
| 1.4.1 Use of colour | A | Status = colour + icon + text; links underlined in body text | Greyscale screenshot test: all statuses distinguishable; body links have underline or ≥ 3:1 + non-colour cue | M |
| 1.4.2 Audio control | A | No autoplay audio; player has pause | 0 autoplaying media | A, M |
| 1.4.3 Contrast (minimum) | AA | Token pairs in UI-05 §2 | Text ≥ 4.5:1 (≥ 3:1 for ≥ 24 px or ≥ 18.66 px bold); axe `color-contrast` 0 violations in light, dark, HC | A |
| 1.4.4 Resize text | AA | `rem` units; layout flexible | At 200 % browser text zoom: no loss of content or function on 25 key screens | M |
| 1.4.5 Images of text | AA | No text in images except logos | 0 images of text outside logo (design review) | M |
| 1.4.10 Reflow | AA | Single-column reflow at 320 CSS px; data tables fall back to card lists | At 320 × 256 px viewport (400 % zoom of 1280): no 2-D scroll except maps/code editor/charts inside labelled regions | M, A (Playwright viewport) |
| 1.4.11 Non-text contrast | AA | `--ts-control-border` ≥ 4.4:1; focus ring ≥ 6:1; icon on tints ≥ 4.1:1 | Component states measured: ≥ 3:1 for borders, icons, focus, chart marks | A, M |
| 1.4.12 Text spacing | AA | Layouts tolerate spacing overrides | With bookmarklet overrides (line 1.5, para 2×, letter 0.12em, word 0.16em): 0 clipped/overlapping text on 25 key screens | M |
| 1.4.13 Content on hover/focus | AA | Tooltips/popovers dismissible (Esc), hoverable, persistent | Test each popover: Esc closes, pointer can enter, stays until dismissed | M |

### 2.2 Operable

| SC | Lvl | Design response | Measurable acceptance criterion | T |
|---|---|---|---|---|
| 2.1.1 Keyboard | A | All functions keyboard-operable incl. board, calendar, player, editor | Keyboard-only run of all 16 key-screen specs completes with 0 mouse use | M |
| 2.1.2 No keyboard trap | A | Dialogs trap focus *with* Esc exit; code editor has documented escape (Esc, Tab) | 0 traps in sweep; editor escape tested | M |
| 2.1.4 Character key shortcuts | A | Single-key shortcuts (e.g. board "j/k") off by default; if on, can be turned off/remapped; Command palette uses modifier | Shortcut list in `/settings/display`; toggle works | M |
| 2.2.1 Timing adjustable | A | Session timeout warning ≥ 2 min before expiry with extend; assessments excepted with accommodations | Warning dialog test; accommodation path test | M |
| 2.2.2 Pause, stop, hide | A | No auto-updating content except live regions the person opted into; skeleton shimmer respects reduced motion | Any motion > 5 s has pause control | M |
| 2.3.1 Three flashes | A | No flashing content | Design review + PEAT-class check on media | M |
| 2.4.1 Bypass blocks | A | Skip links (main, nav); landmarks | First two tab stops are skip links on every shell route | A |
| 2.4.2 Page titled | A | Shell sets `document.title` "`<Page> — <Workspace> — TalentSphere`" on every route, including remote routes via `host.router.register` | 100 % of routes in route registry have non-generic unique title (route-registry lint) | A |
| 2.4.3 Focus order | A | Logical; after route change focus to `h1`; dialogs restore focus | Focus-order walkthrough 25 screens | M |
| 2.4.4 Link purpose (in context) | A | Links meaningful ("View application for Data Analyst") | 0 "click here"/"read more" without context name | A (lint), M |
| 2.4.5 Multiple ways | AA | Nav + search + command palette + breadcrumbs + sitemap `/help/sitemap` | ≥ 2 ways to reach every non-process page | M |
| 2.4.6 Headings and labels | AA | Descriptive | Review checklist | M |
| 2.4.7 Focus visible | AA | 2 px ring + offset, never removed; HC mode uses system Highlight | `:focus-visible` style present on all interactive; screenshot test | A, M |
| **2.4.11 Focus not obscured (minimum)** | AA | `scroll-padding-top: var(--ts-header-h)` and `scroll-padding-bottom: calc(var(--ts-bottom-nav-h) + var(--ts-action-bar-h) + 8px)` on scroll container; `scroll-margin` on focusable form controls; every remote sticky element registers its inset via `host.layout.registerStickyInset`; BottomNav never auto-hides during keyboard focus | On every form/key screen at 320 and 1280 px, tabbing through each focusable: element is **not fully covered** by any sticky/fixed element (Playwright: bounding-box of `:focus` vs overlay rects = 0 overlap); design goal 0 % overlap (2.4.12) | A (Playwright), M |
| 2.5.1 Pointer gestures | A | No path-based or multi-touch-only gestures; swipe actions have buttons | Each gesture has single-pointer alternative | M |
| 2.5.2 Pointer cancellation | A | Actions fire on `click`/up-event; drag cancel by Esc/drop outside | Press-down-only handlers = 0 (lint `onMouseDown/onTouchStart` on actions) | A |
| 2.5.3 Label in name | A | Visible label text is contained in accessible name | axe `label-content-name-mismatch` 0 | A |
| 2.5.4 Motion actuation | A | No shake/tilt features | N/A by design | — |
| **2.5.7 Dragging movements** | AA | Kanban "Move to…" menu; reorder "Move up/down" buttons; file upload button; slider has +/- | Each draggable element has a single-pointer alternative reachable in ≤ 2 interactions | M |
| **2.5.8 Target size (minimum)** | AA | Product standard 44 px; floor 24 px | Automated: all interactive elements bounding box ≥ 24 × 24 (hard fail) and ≥ 44 × 44 on `<md` (warn → fail at release) except inline text links and spec exceptions | A (Playwright) |

### 2.3 Understandable

| SC | Lvl | Design response | Measurable acceptance criterion | T |
|---|---|---|---|---|
| 3.1.1 Language of page | A | `<html lang>` from locale | 100 % routes | A |
| 3.1.2 Language of parts | AA | `lang` on foreign UGC snippets with detected language tag | Spot-check 10 | M |
| 3.2.1 On focus | A | No context change on focus | Review | M |
| 3.2.2 On input | A | No auto-submit on select change; OTP auto-submit only on 6th digit with announced message | Review; test | M |
| 3.2.3 Consistent navigation | AA | Shell nav order stable per workspace | Visual diff nav across routes | A |
| 3.2.4 Consistent identification | AA | Same icon+label for same function (design-system tokens) | Review | M |
| **3.2.6 Consistent help** | A | Help link in TopBar + form footer in same order | Position diff test | A |
| 3.3.1 Error identification | A | Inline + summary; text states which field and what is wrong | Each form: submit empty → summary lists all errors, each linked | A, M |
| 3.3.2 Labels or instructions | A | Visible labels; format hints | axe `label` 0 | A |
| 3.3.3 Error suggestion | AA | Message gives a fix | Copy review: 100 % validation messages include corrective hint | M |
| 3.3.4 Error prevention (legal, financial, data) | AA | Applications, offers, billing, consent changes, erasure: review step and/or confirm + reversible window (withdraw) | Each listed action has confirm/review/undo as per ACTION_REGISTRY "Idem/Confirm" column | M |
| **3.3.7 Redundant entry** | A | Auto-populate from profile; never re-ask in same process (application, onboarding, referee) | Walkthrough: 0 re-asks of already-entered data | M |
| **3.3.8 Accessible authentication (minimum)** | AA | Passkey, password manager friendly fields, paste allowed, emailed link/code; no puzzle transcription; OTP can be pasted | Login/reset/step-up flows pass with password-manager + paste test; no object-recognition/transcription step | M |

### 2.4 Robust

| SC | Lvl | Design response | Measurable acceptance criterion | T |
|---|---|---|---|---|
| 4.1.2 Name, role, value | A | Native elements first; ARIA per APG; state props (`aria-expanded`, `aria-selected`, `aria-pressed`, `aria-current`, `aria-busy`) | axe `aria-*` rules 0 critical; custom widgets pass APG keyboard test | A, M |
| 4.1.3 Status messages | AA | Single shell live-region host; polite for status, assertive only for errors blocking progress; list updates announce counts | NVDA/VoiceOver: save, load-more, bulk progress, offline/online, toast announced; no duplicate announcements | M, U |

## 3. Keyboard model

| Context | Keys |
|---|---|
| Global | `Tab`/`Shift+Tab` natural order; `Ctrl/⌘+K` command palette; `?` opens shortcut help (shortcuts off by default except palette; toggle in settings); `Esc` closes topmost overlay |
| Skip links | First tab stops: "Skip to main content", "Skip to navigation" (visible on focus) |
| Nav | SideNav: `Tab` between items; section collapse via button; BottomNav: `Tab`/arrow keys optional roving |
| Menu / menubutton | `Enter/Space/↓` open; arrows move; `Home/End`; type-ahead; `Esc` close + return focus |
| Tabs | Arrow keys move, `Enter/Space` activate (manual activation), `Home/End` |
| Combobox | `↓` open, arrows, `Enter` select, `Esc` close/clear, announce result count |
| Data table | Normal tab stops on interactive cells; grid mode (pipeline spreadsheets) arrow-key navigation with `aria-rowindex/colindex`; `Space` select row |
| Kanban board | `Tab` to card; `Space` pick up; `←/→` change column, `↑/↓` change position; `Enter` drop; `Esc` cancel; each step announced ("Moved to Screening, position 2 of 7"); alternative: card menu "Move to…" |
| Dialog | Focus moves in on open; `Tab` cycles; `Esc` close; focus returns to opener |
| Date/slot picker | Grid arrows, `PageUp/Down` month, `Home/End` week edges; slot list alternative |
| Code editor | `Esc` then `Tab` leaves editor; screen-reader mode toggle; run via `Ctrl/⌘+Enter` with visible button |
| Course player | `Space` play/pause (when player focused), `←/→` ±10 s, `↑/↓` volume, `C` captions, `T` transcript focus — only when player focused (2.1.4-safe) |

## 4. Screen-reader patterns

| Pattern | Markup/behaviour |
|---|---|
| Page structure | One `banner`, one `nav` labelled "Primary" (+ labelled secondary navs), one `main`, `contentinfo`; each region labelled when repeated |
| Headings | One `h1` per route (the focus target); logical descent; card titles use level set by context prop |
| Lists/tables | Real `ul/ol/table`; captions via `<caption>` (visually hidden if redundant); sort state `aria-sort`; row count via `aria-rowcount` when virtualized |
| Live updates | `host.announce()`; polite for "Saved", "20 more results", "Application submitted"; assertive for blocking errors; never announce skeleton loading (use `aria-busy` on region and announce once "Loaded 20 results") |
| Evidence rung | Badge text reads "Evidence strength: Backed by artifact" ; popover button label "What does Backed by artifact mean?"; modifier states in text ("Check in progress", "Revoked on 3 Nov") |
| Match explanation | Region with heading "Why this matched"; strengths list, gaps list, uncertainty statement as text ("Confidence: medium — 2 required skills have no evidence yet"); no meter-only communication |
| Forms | Error summary announced on submit; each invalid field `aria-invalid="true"` + `aria-describedby` to message; required via text |
| Progress | `<progress>` with text for determinate; for bulk ops a status line "12 of 40 processed, 1 needs attention" in polite region at 5-item or 10-second cadence (throttled to avoid chatter) |
| Navigation announcements | After route change, `document.title` updated and focus on `h1`; polite announcement "Applications page loaded" **not** duplicated if focus move already read the heading |
| Maps/graphs | Skills graph and career-transition visualisations ship a table/list alternative as the default accessible view with toggle |
| Support banner | `role="status"` persistent banner "Support access active, 2h 14m left" updated at 5-min cadence (not per second) |

## 5. Focus and sticky-element rules (2.4.11 detail)

| Element | Height token | Rule |
|---|---|---|
| TopBar | `--ts-header-h` (56 px mobile / 64 px desktop) | sets `scroll-padding-top` |
| BottomNav | `--ts-bottom-nav-h` (64 px + safe area) | sets `scroll-padding-bottom` |
| ActionBar (form sticky CTA) | `--ts-action-bar-h` (72 px) | registered by form; removed at `≥ lg` when static layout used |
| Banners (offline, support access) | measured by shell | included in `--ts-header-h` stack |
| Cookie/consent banners | — | not sticky overlays over forms; inline at top; dismissible via keyboard |
| Rule | Total sticky inset on viewport ≤ 35 % of viewport height at 320 × 568; if exceeded, ActionBar becomes static in flow. Pop-in toasts placed above BottomNav, not over focused control; toast stack pauses when focus is within it. |
| Test | Playwright iterates focusable elements via keyboard on key screens at 320×568, 390×844, 768×1024, 1280×800 and asserts focused element's rect not intersecting fixed/sticky rects (≥ 1 px visible area; target 100 % visible). |

## 6. Focus management across federated route changes

Federation puts route content from different remotes under one shell `main`. Because each remote renders asynchronously, default browser focus behaviour is lost on client-side navigation.

| Step | Owner | Behaviour |
|---|---|---|
| 1 | Shell router | On navigation start: set `main[aria-busy=true]`, keep current focus; if the target remote is not loaded, show `RemoteSkeleton` (after 150 ms) |
| 2 | Remote | Renders route, then calls `host.router.register({ title, headingId })` once it has rendered the `h1` (data may still load; a skeleton under the `h1` is acceptable) |
| 3 | Shell | On `register`: set `document.title`, `main[aria-busy=false]`, move focus to `#headingId` (`tabindex="-1"`), scroll to top respecting `scroll-padding`, and announce nothing extra (the heading is read) |
| 4 | Shell | If `register` isn't called within **3 s** after remote mounted: fall back to focusing `main` and setting generic title; log `a11y.register_timeout` (trace-linked) — contract violation counted per remote release |
| 5 | Shell | If remote load **fails**: render `RemoteError` in `main`, focus its `h1` ("This part of TalentSphere is unavailable"), announce assertively once |
| 6 | Back/forward | Restore scroll position and focus to the previously focused control when navigating back to a list from detail (focus restoration via `history.state.focusKey`) |
| 7 | In-page changes | Tab switches, filters, load-more: focus stays; results count announced (polite); "Load more" moves focus to first new item |
| 8 | Workspace switch | Focus to new home `h1`; announce "Switched to Acme Corp hiring workspace" |
| 9 | Modal routes (e.g. `/me/work-history/:id/references/new`) | Opened as dialog over previous route; Esc/Close returns to previous route and refocuses opener |
| 10 | Session expiry | Re-auth dialog restores focus to the previously focused control; entered form data preserved (not lost) |

Acceptance: for each of 10 cross-remote navigation pairs (e.g. `/me` → `/jobs/123` → `/hiring`), a screen-reader run hears the new page title/h1 once, focus lands on `h1`, and the remote cannot steal focus after load (assertion: `document.activeElement` stable for 1 s after register).

## 7. Forms and errors

| Rule | Detail |
|---|---|
| Labels | Visible label for every input; groups have `legend` |
| Instructions | Format and constraints before the control (help text via `aria-describedby`) |
| Error summary | On failed submit: focus moves to summary (`role="alert"` heading + list of links); list each error in DOM order; links move focus to fields |
| Inline errors | Icon + text + `aria-invalid` + describedby; error text never colour-only |
| Async errors | Server problem+json `errors[]` mapped to fields; unmapped errors appear in summary |
| Success | Status message polite + inline persistent confirmation (not toast-only) |
| Confirmation | Legal/financial/data actions: review step or confirm dialog or undo |
| Auth | Autofill, paste, show-password; no "type the characters" challenges; magic-link/passkey alternatives |
| OTP / referee | Single field with `one-time-code`; resend countdown shown as text (not per-second announced) |

## 8. Motion, zoom, reflow, text, and display preferences

| Topic | Target |
|---|---|
| Reduced motion | Honour `prefers-reduced-motion`; user override in `/settings/display`; animation never required to understand state |
| Zoom 400 % | Reflow at 320 CSS px without 2-D scroll (1.4.10); sticky bars shrink or de-stick (§5); tables as cards; dialogs scroll internally with sticky title |
| Text size | 200 % text resize without loss; no `max-height` clipping on text containers |
| Contrast preferences | Dark, high contrast, forced colours (UI-05 §2.4) |
| Orientation | Both |
| Time | No fixed timeouts except assessments (accommodations) and security (warned) |
| Cognitive load | Plain language (UI-05 §11), chunked multi-step forms, persistent progress text, undo, no surprise context changes; avoid dense dashboards by default: "Simple view" density toggle [OPEN-UX-11] |

## 9. Role-specific hotspots

| Surface | Hazard | Mitigation |
|---|---|---|
| Pipeline board (SCR-HIR-05) | Drag-only, huge DOM, live updates | Move menu; list view default for screen readers; virtualization with `aria-rowcount`; live announcements throttled |
| Assessment runner (SCR-LRN-09) | Timer anxiety, keyboard traps in code editor, proctoring overlays | Timer announced at 25/50/75/90 % remaining thresholds and last minute only (not continuous); editor escape; accommodations ACT-ASM-09; no mandatory camera for baseline |
| Course player (SCR-LRN-04) | Captions, transcripts, keyboard | Required captions at publish; transcript sync; keyboard map |
| Referee form (SCR-SHELL-09) | One-time mobile page, no account, possible low literacy | ≤ 3 minutes; 5th–8th grade copy; large targets; works with zoom 400 %; works with screen reader; no timeouts shorter than the link validity; language switch |
| Consent manager (SCR-ACC-09) | Dense legal copy | Layered notices, plain language, per-purpose toggles with explicit state text |
| Support console (SCR-ADM-02/04) | High-risk actions under time pressure | Clear persistent banner, countdown at coarse cadence, keyboard shortcuts disabled by default |
| Skills graph / career maps | Visual-only | Table/list default alternative |
| Charts / analytics | Colour-only series | Patterns, direct labels, table toggle |

## 10. Testing plan

| Layer | What | Tooling | When | Gate |
|---|---|---|---|---|
| Static | `jsx-a11y` lint, token lint (contrast pairs from token table), i18n lint, `autocomplete` lint | ESLint + custom rules | every PR | Block |
| Component | Story-per-state, axe, keyboard-interaction tests (APG), RTL, dark, HC | Storybook-class + axe-core + Testing Library | every PR touching `@ts/ui` | Block on new violations |
| Remote integration | axe on each route in each remote at 320 and 1280 px; focus-register contract test; sticky-inset overlap test; target-size test | Playwright + axe-core | per remote build | Block (FF-08 adds a11y contract check) |
| End-to-end | Key journeys (UJ-01, 02, 05, 11, 17) keyboard-only; WebKit + Chromium + Firefox | Playwright | nightly | Alert → block at release |
| Manual — keyboard | Full sweep of all key screens | QA checklist | each release candidate | Block on S1/S2 |
| Manual — screen readers | NVDA+Firefox, NVDA+Chrome, JAWS+Chrome, VoiceOver+Safari (macOS & iOS), TalkBack+Chrome | AT test script per screen spec | each minor release; key flows every release | Block on S1/S2 |
| Manual — display | 200 % text, 400 % zoom, text-spacing bookmarklet, forced colours, reduced motion, dark, RTL pseudo-locale | Checklist | each minor release | Block S1/S2 |
| Device | iOS Safari (installed PWA & browser), Android Chrome; platform matrix (FF-09, OPEN-12) | Real devices | each minor release | Block S1 |
| User testing with disabled people | Recruited task-based sessions (screen-reader, low-vision, motor, cognitive); compensation | Research program [OPEN-UX-10] | before GA and per major redesign | Findings triaged |
| Independent audit | Third-party WCAG 2.2 AA audit | External | pre-GA; annual | Required for any conformance statement |
| Production monitoring | Synthetic axe scan of public routes; `a11y.register_timeout` and `ui.unknown_status` counters; accessibility feedback link in Help | Observability | continuous | Alert |

Severity: **S1** blocks task completion for a user group (e.g. keyboard trap, unlabelled primary control); **S2** significant barrier with workaround; **S3** minor. Defect SLA [OPEN-UX-12]. Accessibility statement and feedback channel published before GA; the statement states known gaps from the latest audit and does not claim conformance not demonstrated.

## 11. Open items

| ID | Item |
|---|---|
| OPEN-UX-09 | Bot-defence mechanism for signup/login that satisfies 3.3.8 (risk-based, invisible, with accessible fallback). |
| OPEN-UX-10 | Funding/recruitment of disabled user-testing panel; independent audit vendor. |
| OPEN-UX-11 | "Simple view" density mode scope. |
| OPEN-UX-12 | Accessibility defect SLA by severity. |

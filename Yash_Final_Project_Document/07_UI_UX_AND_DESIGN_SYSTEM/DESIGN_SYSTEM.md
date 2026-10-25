# Design System — Tokens, Components, Theming, Localization & the `@ts/ui` Contract

Doc ID: UI-05 · Owner: Design-System Architect · Version 1.0 · Status: Under Review · Relates: ADR-T03, ADR-T14, ADR-T18, ADR-T19, INV-T04, INV-T16, INV-T19, DOM-24 · Siblings: UI-06 `ACCESSIBILITY_SPEC.md`, UI-02 `SCREEN_REGISTRY.md`

Supersedes nothing. Linked from the 07_UI_UX_AND_DESIGN_SYSTEM folder index and `MASTER_INDEX`. Tags: **[TARGET]** design decision, **[OPEN]** unresolved, **[REF]** reference-only input. Reference tokens in `packages/ui/src/tokens.ts` were **not** copied; token names and values below are a fresh design. Contrast ratios in §2 were computed (WCAG relative-luminance formula) for this document; they prove token pairs, not product conformance.

## 1. Principles [TARGET]

| # | Principle | Design consequence |
|---|---|---|
| DP-1 | Evidence over assertion | A claim never looks like a verified fact (§7.8). Verification visuals are reserved for server-confirmed rungs (INV-T04). |
| DP-2 | Calm, honest feedback | No fake progress, no confetti on pending states, no countdown pressure. See UI-07. |
| DP-3 | One system, many remotes | Remotes consume tokens/components only through `@ts/ui` (§12). No remote hard-codes colour, spacing or motion. |
| DP-4 | Touch first, keyboard complete | Product touch targets ≥ 44 px (above the 24 px WCAG 2.5.8 floor); every interaction has a keyboard path and a non-drag path. |
| DP-5 | Colour never carries meaning alone | Every status pairs colour + icon + text. |
| DP-6 | Graceful at the edges | Every component defines loading, empty, error, offline and disabled-with-reason states. |
| DP-7 | Dignity in copy | No "rejected", "failed candidate", "cheater"; see §11. |

## 2. Colour tokens

Tokens are CSS custom properties on `:root` (shell-owned). Theme = `[data-theme="light|dark"]`; default follows `prefers-color-scheme`; `prefers-contrast: more` and `forced-colors: active` have dedicated overrides (§2.4). Components reference **semantic** tokens only; the primitive hexes are in the shell stylesheet and are not importable by remotes.

### 2.1 Light theme (default)

| Semantic token | Value | Used for | Check (ratio) |
|---|---|---|---|
| `--ts-bg` | `#FFFFFF` | page | — |
| `--ts-bg-subtle` | `#F5F6F8` | page bands, table zebra | — |
| `--ts-bg-sunken` | `#EBEDF1` | wells, code | — |
| `--ts-text` | `#12182B` | body | 17.63 on bg, 16.30 on subtle |
| `--ts-text-2` | `#3F4859` | secondary | 9.20 / 8.51 |
| `--ts-text-3` | `#586174` | hints, captions | 6.22 / 5.75 / 5.31 on sunken |
| `--ts-primary` | `#4338CA` | primary button fill, selected | 7.90 vs white (also white-on-primary 7.90) |
| `--ts-primary-hover` | `#3730A3` | hover / pressed, links | 9.93 |
| `--ts-control-border` | `#6B7385` | input/checkbox borders | 4.76 on bg, 4.40 on subtle (≥ 3:1 non-text) |
| `--ts-border` | `#D0D5DD` | decorative dividers only (never the sole boundary of a control) | n/a |
| `--ts-focus` | `#1D4ED8` | focus ring (2 px + 2 px offset, plus white inner halo) | 6.70 / 6.20 |
| `--ts-success` / tint | `#05603A` / `#ECFDF3` | confirmed system outcomes | 7.66 text; 7.26 on tint |
| `--ts-warning` / tint | `#8A4B05` / `#FFFAEB` | needs attention | 6.80; 7.85 (`#7A4004`) on tint |
| `--ts-danger` / tint | `#B42318` / `#FEF3F2` | errors, destructive | 6.57; 7.97 (`#912018`) on tint |
| `--ts-info` / tint | `#1849A9` / `#EFF8FF` | neutral notices | 8.19; 7.62 on tint |

### 2.2 Dark theme

| Token | Value | Check |
|---|---|---|
| `--ts-bg` / `--ts-surface` / `--ts-raised` | `#0B1020` / `#131A2E` / `#1B2440` | — |
| `--ts-text` | `#F2F4F8` | 17.19 / 15.70 / 13.89 |
| `--ts-text-2` / `--ts-text-3` | `#C3CAD9` / `#9AA3B8` | 10.51 / 6.84 (6.05 on raised) |
| `--ts-primary` (text/outline) | `#A5A0FF` | 7.47 on surface; button fill `#5A4FE0` with white text 5.79 |
| `--ts-control-border` | `#7C86A0` | 4.75 |
| `--ts-focus` | `#8CB4FF` | 8.30 |
| success / warning / danger / info text | `#6CE0A4` / `#FDB45C` / `#FF9A92` / `#8EBBFF` | 10.57 / 9.76 / 8.47 / 8.81 on surface |

### 2.3 Evidence-ladder tokens (see §7.8 for components)

| Rung | Name shown to people | Text on tint (light) | Icon on tint (light) | Dark text / tint |
|---|---|---|---|---|
| L1 | Claimed | `#3F4859` on `#EEF0F4` = 8.06 | `#6B7385` = 4.17 | `#C3CAD9` on `#232C47` = 8.39 |
| L2 | Backed by artifact | `#1849A9` on `#E6F0FF` = 7.12 | `#1D5FD1` = 5.06 | `#8EBBFF` on `#14264F` = 7.54 |
| L3 | Peer-attested | `#5B21B6` on `#F1E9FE` = 7.63 | `#7234D3` = 5.66 | `#C4A8FF` on `#2A1A55` = 7.54 |
| L4 | Verified by `<authority>` | `#05603A` on `#E3F7EC` = 6.85 | `#087443` = 5.23 | `#6CE0A4` on `#0F3524` = 8.25 |

Ladder hues are deliberately **not** the generic success/warning hues: green-ish L4 is the only rung that may use the word "Verified", and the same green is never used for "saved" or "completed" toasts on evidence screens (use `info` there).

### 2.4 Contrast and forced-colour modes

| Mode | Rule |
|---|---|
| `prefers-contrast: more` | `--ts-text` `#000`/`#FFF`; borders become 2 px `--ts-text`; primary `#1A0F9B` on white (13.24) / `#C7C3FF` on black (12.68); tints removed (solid bg + 2 px border + icon). |
| `forced-colors: active` | Use `CanvasText`, `Canvas`, `Highlight`, `LinkText`, `ButtonText`, `GrayText`; never rely on `background-image` to convey state; ladder rungs differ by icon shape and text only; focus ring uses `outline: 2px solid Highlight`. |
| Text on images/video | Always on a solid scrim ≥ 4.5:1 computed against the lightest possible region; no text baked into images. |
| Disabled | Disabled controls use `--ts-text-3` + dashed border + "why disabled" helper (disabled text is exempt from 1.4.3 but must remain legible; design target ≥ 3:1). |

## 3. Typography [TARGET]

| Token | Value | Notes |
|---|---|---|
| `--ts-font-sans` | `"Inter Variable", system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif` | Self-hosted WOFF2 subset; `font-display: swap`; no third-party font CDN at runtime (privacy, INV-T14 spirit). |
| `--ts-font-ar` / `--ts-font-cjk` | `"Noto Sans Arabic"` / `"Noto Sans JP/SC/KR"` fallbacks | Loaded on demand per locale (§10). |
| `--ts-font-mono` | `ui-monospace, "JetBrains Mono", Consolas, monospace` | Code assessments, IDs. |
| Base size | 16 px = `1rem`; all sizes in `rem` | Respects user font-size; no `px` font sizes. |

| Style | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 2.25rem / 2.75rem (md+), 1.75rem / 2.25rem (<md) | 700 | Landing hero only |
| `h1` | 1.75rem / 2.25rem | 700 | Page title (exactly one per route; focus target) |
| `h2` | 1.375rem / 1.875rem | 600 | Section |
| `h3` | 1.125rem / 1.625rem | 600 | Card title |
| `body` | 1rem / 1.5rem | 400 | Default |
| `body-sm` | 0.875rem / 1.25rem | 400 | Table cells, helper text (never below 0.875rem) |
| `caption` | 0.8125rem / 1.125rem | 500 | Badges, timestamps; minimum size in product |
| `label` | 0.875rem / 1.25rem | 600 | Form labels |
| `code` | 0.875rem / 1.375rem | 400 | Mono |

Rules: line length 45–80 characters for prose; paragraphs left-aligned (start-aligned) not justified; text must survive WCAG 1.4.12 spacing overrides (line-height 1.5, paragraph 2×, letter 0.12em, word 0.16em) without clipping; truncation only with `title`-independent full-text access (expand or detail view); numerals use tabular figures in tables.

## 4. Spacing, sizing, radii, elevation

| Group | Tokens |
|---|---|
| Space (4 px base) | `--ts-space-0:0` · `1:4px` · `2:8px` · `3:12px` · `4:16px` · `5:20px` · `6:24px` · `8:32px` · `10:40px` · `12:48px` · `16:64px` |
| Target size | `--ts-target-min: 44px` (all pointer/touch controls, incl. icon buttons, checkboxes' hit area, table row actions); `--ts-target-dense: 32px` only in desktop-only dense tables with ≥ 8 px spacing and a keyboard alternative (still ≥ 24 px, WCAG 2.5.8). |
| Control heights | `sm 32` (desktop dense only) · `md 44` (default) · `lg 52` (primary mobile CTA) |
| Radii | `--ts-radius-sm:6px` · `md:10px` · `lg:16px` · `pill:999px` · `full:50%` (avatars) |
| Elevation | `e0` none · `e1` `0 1px 2px rgb(16 24 40/.08)` (cards) · `e2` `0 4px 12px rgb(16 24 40/.12)` (popovers) · `e3` `0 12px 32px rgb(16 24 40/.18)` (dialogs). In dark theme elevation is expressed by lighter surface (`surface`→`raised`) plus a 1 px `--ts-border`, not shadow alone. |
| Z-index | `base 0 · sticky 100 · nav 200 · popover 300 · dialog 400 · toast 500 · support-banner 600` (privileged-access banner always above content, below dialogs it opens). |

## 5. Motion

| Token | Value | Use |
|---|---|---|
| `--ts-dur-instant` | 80 ms | hover/press feedback |
| `--ts-dur-fast` | 150 ms | toggles, tooltips |
| `--ts-dur-base` | 240 ms | dialogs, drawers, route transition |
| `--ts-dur-slow` | 400 ms | max; onboarding illustrations only |
| `--ts-ease-standard` | `cubic-bezier(.2,0,0,1)` | enter/move |
| `--ts-ease-exit` | `cubic-bezier(.4,0,1,1)` | exit |

Reduced motion (`prefers-reduced-motion: reduce`, plus in-app override in `/settings/display`): all durations → 0–1 ms for transform/opacity; skeleton shimmer replaced by static tone; no parallax, auto-advancing carousels, or looping animation; spinners replaced by static "Working…" text with an indeterminate `<progress>`; page transitions cross-fade only (or none). Nothing flashes more than 3 times per second. Animation is never the only signal for state change. Autoplay media is off by default (course player).

## 6. Breakpoints and grid

| Name | Min width | Columns / gutter / margin | Shell layout | Notes |
|---|---|---|---|---|
| `xs` | 0 | 4 / 16 / 16 | top bar + **bottom nav** (64 px + safe-area) | 320 CSS px must reflow (1.4.10) |
| `sm` | 480 | 4 / 16 / 16 | same | large phones |
| `md` | 768 | 8 / 24 / 24 | top bar + **icon rail** (72 px) | tablets, portrait |
| `lg` | 1024 | 12 / 24 / 32 | top bar + **sidebar** (256 px, collapsible to rail) | desktop |
| `xl` | 1280 | 12 / 24 / 32 | + optional right detail pane (360–420 px) | master-detail screens |
| `2xl` | 1536 | 12 / 32 / 48, content max 1280 (data tables fluid) | same | |

Container queries (`@container`) are used inside cards/panes so remote components adapt to pane width, not viewport. Orientation is never locked (1.3.4). Layout uses logical properties (`margin-inline-start`, `inset-inline-end`) for RTL.

## 7. Component catalogue

All components ship from `@ts/ui` (§12). Common state vocabulary: **default · hover · focus-visible · active/pressed · disabled (with reason) · loading · error · success · read-only · selected · offline-pending** where applicable. Every interactive component: ≥ 44 px target, visible focus ring (`--ts-focus`, never removed), accessible name, keyboard operation per ARIA APG, `prefers-reduced-motion` honoured.

### 7.1 Button (`Button`, `IconButton`, `LinkButton`)

| Aspect | Spec |
|---|---|
| Anatomy | container · optional leading icon · label · optional trailing icon/spinner |
| Variants | `primary` (one per view region), `secondary` (outline), `tertiary` (text), `danger` (destructive, requires confirm pattern), `quiet` (toolbar) |
| Sizes | `md` 44, `lg` 52; `IconButton` 44×44 minimum with required `label` prop (becomes `aria-label` + tooltip) |
| States | hover, focus-visible, pressed, `loading` (label stays, `aria-busy`, width locked, activation ignored — not `disabled`, so focus is kept), `disabled` (use `aria-disabled="true"` with `describedby` reason when the reason matters; native `disabled` only when nothing to explain) |
| Rules | Verb-first label ("Submit application", not "Submit"); no icon-only primary actions; destructive actions never primary-filled by default; async actions send an `Idempotency-Key` (generated once per intent, reused on retry) |
| Mobile | Sticky action bar variant (`ActionBar`) with safe-area padding and `scroll-padding-bottom` so focused fields are not obscured (2.4.11) |

### 7.2 Input family (`TextField`, `TextArea`, `Select`, `Combobox`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `FileDrop`, `OtpField`)

| Aspect | Spec |
|---|---|
| Anatomy | label (always visible, above) · optional help text · control · optional prefix/suffix · error message · character/limit counter (only when limit exists) |
| Association | `<label for>`; help and error via `aria-describedby`; required marked by text "(required)" plus `aria-required`; never placeholder-as-label |
| Autocomplete | `autocomplete` tokens set per field (1.3.5): `name`, `email`, `tel`, `current-password`, `new-password`, `one-time-code`, `organization-title` |
| Errors | Inline under field, icon + text, `role` not set on each (summary announces); on submit show **error summary** at top of form (§7.3); field-level message states the fix ("Enter a date in the past") |
| States | default · focus · filled · disabled · read-only · invalid · valid-after-touch (no green ticks by default) · `pending-sync` (queued offline write, §UI-07) |
| Paste & password managers | Never block paste or autofill; password fields have show/hide toggle (3.3.8) |
| `OtpField` | One logical input (`inputmode="numeric"`, `autocomplete="one-time-code"`), visually segmented; accepts paste of full code; no auto-submit without visible confirmation unless 6th digit entered and focus announced |
| `Combobox` | APG combobox/listbox; typeahead debounce 200 ms; results count announced politely; creatable option labelled "Add "…"" (skills use the taxonomy first, DOM-04) |
| `FileDrop` | Button + drag-drop (drag is optional, never the only path); lists type/size limits up front; per-file row with real byte progress, then "Scanning" state (BR-T003), then "Ready" / "Blocked"; keyboard remove |
| Number/date | Native input types preferred on touch; locale formats via `Intl` (§10) |

### 7.3 Form (`Form`, `FormSection`, `ErrorSummary`, `Stepper`)

| Aspect | Spec |
|---|---|
| Layout | single column ≤ 640 px; related fields grouped in `fieldset`/`legend`; max one primary action per form |
| Validation timing | Validate on blur for format, on submit for completeness; never validate while typing except OTP/length counters; async uniqueness checks debounced and announced |
| `ErrorSummary` | `role="alert"` region at top, focus moved to it on failed submit, list of links to invalid fields (each link moves focus to the field), count in heading ("3 problems to fix") |
| Multi-step (`Stepper`) | Steps are real routes (back button works); previously entered data is auto-filled and never re-requested in the same flow (3.3.7); progress shown as "Step 2 of 4" text + visual; steps are not locked unless a rule requires it |
| Drafts | Local draft autosave (debounced, device-local, encrypted-at-rest not required for non-sensitive; sensitive fields excluded). Offline-queued writes only for the ADR-T10 set; other forms keep a local draft but show "Needs connection to submit" |
| Concurrency | `If-Match` ETag on edit; conflict dialog per UI-07 §8 |
| Destructive confirm | Typed-confirmation only for irreversible, high-blast-radius actions (account erasure, org deletion); otherwise a dialog with consequence text and a verb-labelled confirm button |

### 7.4 Table / list (`DataTable`, `ListView`, `VirtualList`)

| Aspect | Spec |
|---|---|
| Anatomy | caption/heading · toolbar (search, filters chips, bulk actions) · header row (sortable `<th scope="col">` with `aria-sort`) · rows · empty/loading/error body · pagination or "Load more" |
| Semantics | Real `<table>` for tabular data; `role="grid"` only when cells are individually interactive (pipeline spreadsheets) |
| Responsive | `<md`: rows become **cards** (label–value pairs) retaining sort via a "Sort by" select; no horizontal scroll of the page (table may scroll inside a labelled region only for dense admin tables, with a card fallback) |
| Selection | Row checkbox column; "select all on this page" vs "select all N results" are separate explicit actions; selection count announced (`aria-live=polite`) |
| Bulk | Opens bulk-operation panel (UI-07 §4) with per-item results |
| Density | `comfortable` (row ≥ 56 px) default; `compact` (≥ 40 px, desktop only) user preference |
| Row actions | Visible kebab `IconButton` (44 px) — not hover-only; primary row action = whole-row link only when no other control in the row |
| Pagination | Default cursor "Load more" (list) / numbered cursor pager (admin); virtualization rules in UI-07 §3 |

### 7.5 Card (`Card`, `MetricCard`, `EvidenceCard`, `JobCard`, `CandidateCard`)

Anatomy: media (optional, decorative alt="") · header (title as heading level set by context) · body · meta row · footer actions. Interactive card = one primary link on the title (stretched via `::after`) + separate real buttons; never nest links in links. States: default, hover (elevation e1→e2 or border), focus-within ring on the card, selected (check icon + border, not colour only), skeleton, error-inline. `MetricCard` never shows a bare percentage without definition link; "—" for unknown, never 0.

### 7.6 Navigation (`AppShell`, `SideNav`, `RailNav`, `BottomNav`, `TopBar`, `Breadcrumbs`, `Tabs`, `CommandPalette`, `WorkspaceSwitcher`)

| Component | Spec |
|---|---|
| `AppShell` | Landmarks: `banner` (TopBar), `navigation` (primary; labelled "Primary"), `main` (single, `id="main"`, `tabindex="-1"` focus target), `contentinfo`; skip links "Skip to main content" and "Skip to navigation" first in tab order |
| `SideNav` (lg+) | Sections with headings; current item `aria-current="page"`; collapse to rail persisted per user; item = icon + text (text never dropped except in rail with tooltip + `aria-label`) |
| `BottomNav` (<md) | 3–5 destinations, icon + visible label, 64 px + `env(safe-area-inset-bottom)`; hides on scroll-down only if focus is not inside content below (never hides while keyboard focus moves — avoids 2.4.11 issues); badge counts have text equivalent |
| `TopBar` | Workspace switcher, global search/command trigger, notifications bell, messages icon (<lg), account menu; sticky, height token `--ts-header-h` |
| `Breadcrumbs` | `nav aria-label="Breadcrumb"` ordered list, last item `aria-current="page"`; collapsed middle on <md with "…" menu; shown for depth ≥ 3 |
| `Tabs` | APG tabs, automatic activation off by default (manual), routes for deep-linkable tabs; scrollable tab list has visible scroll affordance |
| `CommandPalette` | `Ctrl/⌘+K` and visible trigger button; `role="dialog"` + combobox; results grouped (Go to / Actions / Recent); items derived from `GET /me/capabilities` (visibility only); fully usable by screen reader and touch; escape closes and restores focus to trigger |
| `WorkspaceSwitcher` | Menu of grants `(role, scope)`; announces the new workspace; remembers last used |

### 7.7 Overlays and feedback (`Dialog`, `Drawer`, `Popover`, `Tooltip`, `Toast`, `Banner`, `Callout`, `Skeleton`, `ProgressBar`, `Spinner`, `EmptyState`, `ErrorState`)

| Component | Spec |
|---|---|
| `Dialog` (modal) | `role="dialog" aria-modal="true"`, labelled and described; focus trap; first focus on least-destructive control or first field; Esc closes unless unsaved destructive data (then confirm); returns focus to trigger; backdrop click never confirms; mobile: becomes bottom sheet with drag handle (drag optional; Close button always present) |
| `Drawer` | Side detail panels (non-modal ≥ xl, modal < xl) |
| `Popover`/`Tooltip` | Tooltip content also available non-hover (focus + tap-to-reveal info button) per 1.4.13: dismissible (Esc), hoverable, persistent. No essential information in tooltips only. |
| `Toast` | Region `aria-live="polite"` (status) / `role="alert"` (errors only when blocking); min 6 s visible, pause on hover/focus, never auto-dismiss errors that need action; stack max 3; includes Undo (8 s) for reversible actions; never the sole carrier of a result — result also appears inline or in activity list; positioned so it does not cover focused control or bottom nav |
| `Banner` | Persistent page-level: `offline`, `degraded`, `previous-version`, `support-access-active`, `maintenance`; non-dismissible when safety-relevant (support access) |
| `Callout` | Inline info/warn/danger with icon + heading + text |
| `Skeleton` | Shape-matched placeholders; `aria-hidden`; region has `aria-busy="true"`; shown only after 150 ms and for ≥ 300 ms once shown (avoid flash) |
| `ProgressBar` | **Determinate only with server/transport-reported counts**; otherwise `Spinner`/indeterminate. Never animated to "feel" faster. Text alternative "12 of 40 processed". |
| `EmptyState` | Illustration (decorative) + heading + one-sentence reason + primary action; differentiate "nothing yet", "nothing matches filters" (offer clear filters), "no permission" (explain who can grant) |
| `ErrorState` | Plain-language what happened + what the person can do + Retry + trace id (copyable) from problem+json `instance`; never raw error text |

### 7.8 Status and verification components (`StatusBadge`, `EvidenceRungBadge`, `RungMeter`, `ProvenancePanel`, `ConsentChip`, `AiSuggestionChip`)

**Rule set (binding for every remote):**

1. The word **"Verified"** appears only on rung **L4** and always with the issuer: "Verified by Acme University". Rungs L1–L3 never use "verified", a check mark, or a shield. (INV-T04, product constitution.)
2. Rung is shown from server state only (`evidence.rung`, SM-EVIDENCE); the client never computes or upgrades a rung.
3. Candidate-entered or imported data with no server verification transition is **L1 "Claimed"** even if it came from a trusted-looking source. AI-produced text is never a rung (INV-T08); it is labelled "AI suggestion" until the person adopts it, after which it is the person's L1 claim.
4. Account-level facts use different vocabulary: "Email confirmed", "Passkey added" — not "verified" — to avoid collision with evidence verification.
5. Aggregates show counts per rung ("1 Verified · 2 Peer-attested · 3 Claimed"), never a single "% verified" or trust score.
6. Colour is never the only cue: each rung has a unique icon shape and text label (table below).

| Rung (API value) | Label | Icon (24 px) | Shape of badge border | Popover "What this means" (plain language) |
|---|---|---|---|---|
| L1 `claimed` | Claimed by you / "Claimed" (viewer ≠ owner: "Claimed by candidate") | open circle | dashed | "This is what the person says. Nothing has been checked yet." |
| L2 `artifact-backed` | Backed by artifact | paperclip/document | solid | "A file or link supports this. The file passed our safety scan. We have not confirmed it proves the claim." |
| L3 `peer-attested` | Peer-attested by `<name or role>` | two-people | double-line | "Someone who worked with them confirmed this. We checked the request came from the person named, not that they are an authority." |
| L4 `authority-verified` | Verified by `<authority>` | shield-check | solid + thick | "An issuer we can name (employer, institution, assessment) confirmed this through our verification process on `<date>`." |

| Modifier state | Visual | Rule |
|---|---|---|
| `pending` (scan, awaiting attestation) | Same rung as current + clock icon + "Check in progress" | Never display the target rung before it is reached |
| `under-review` (dispute, integrity) | Amber `Callout`, rung unchanged until a human decides | INV-T20: anomaly ≠ guilt; copy "Review requested", never "flagged as cheating" |
| `revoked` / `expired` | Strikethrough label + "Revoked on `<date>`" + reason category; dependent skills show "Recalculating" (BR-T005) | Terminal; immutable (INV-T11) |
| `hidden-by-consent` (viewer lacks scope) | Lock icon + "Hidden by candidate" + (recruiter) "Request access" | INV-T15 |
| `unscanned` (BR-T003) | Artifact row shows "Scanning — preview unavailable" | Not visible to others until clean |

`RungMeter`: 4-segment indicator for the owner's own view with text "Strength: Backed by artifact (2 of 4)"; `role="img"`+text alternative; never animated; never on recruiter candidate lists (they get the compact badge to avoid a pseudo-score). `ProvenancePanel`: who/what/when/how for the current rung — issuer, method, date, link to the verification event and (owner only) the artifacts. `AiSuggestionChip`: "AI suggestion — not evidence" with dismiss/adopt; adopting records `ai_assisted` provenance [OPEN-UX-04].

`StatusBadge` generic statuses (application, job, assignment): label + icon + tint; mapping table lives in the SCREEN_REGISTRY legend; allowed set per state machine (SM-APPLICATION, SM-JOB) — UI never invents states.

### 7.9 Other core components

| Component | Notes |
|---|---|
| `Avatar` | Initials fallback; alt = name or empty when adjacent text names the person |
| `Chip`/`FilterChip` | Toggle chips use `aria-pressed`; removable chips have labelled remove button (44 px) |
| `Pagination`/`LoadMore` | `LoadMore` announces "20 more results loaded"; focus moves to first new item |
| `Accordion`, `Disclosure` | APG disclosure; heading buttons |
| `RichTextEditor` | Constrained (bold/italic/list/link); keyboard help; sanitised; paste-as-plain default |
| `Timeline` | Ordered list with timestamps (`<time>`); used for application history and audit |
| `KanbanBoard` | Columns as lists; every card has "Move to…" menu (non-drag path, 2.5.7); drag via pointer is enhancement; keyboard: Space to pick up, arrows to move, Enter to drop, Esc cancel, live announcements; consequences of moves confirmed per UI-07 |
| `Calendar/SlotPicker` | Grid with roving tabindex; slot list alternative; time zone shown explicitly |
| `CodeEditor` | Monaco-class editor behind lazy import; accessibility mode toggle; tab-trap escape (Esc then Tab) documented in UI |
| `VideoPlayer` | Captions required for course media; transcript panel; keyboard controls; no autoplay; speed control; remembers position (server-confirmed) |
| `Charts` | Always paired with data table/summary; patterns + direct labels, not colour only |
| `CopyField` | Copy button with "Copied" status announcement |
| `PermissionGate` | Renders children if capability present; otherwise renders nothing or `LockedHint` (reason + who can grant). Visibility hint only (INV-T01) |

## 8. Iconography

Single outlined set (24 px grid, 1.5 px stroke, `currentColor`), shipped as an SVG sprite from `@ts/ui`; each icon has semantic name (`icon.rung.claimed`). Decorative icons `aria-hidden="true"`; meaningful icons never stand alone (text or accessible name). Icons that imply direction mirror in RTL (arrows, chevrons, progress) while logos, media controls, and numerals do not. No emoji as UI icons. Illustrations decorative, one visual style, themable via tokens.

## 9. Theming

| Theme | Selection | Persistence |
|---|---|---|
| System (default), Light, Dark | `/settings/display`, command palette, `prefers-color-scheme` | server profile preference (if signed in) + device fallback |
| High contrast | `prefers-contrast: more` auto, manual override | same |
| Org branding (employer pages) | Logo + one accent colour **rendered only on the employer's public company page and job cards**; accent is auto-adjusted to ≥ 4.5:1 text contrast or rejected at upload with a message; app chrome never re-themed (keeps ladder/status colours unambiguous) | org settings |

The shell sets `data-theme` before first paint (inline bootstrap script in HTML, CSP-nonce'd) to avoid flash. Remotes read tokens; they must not read `localStorage` for theme.

## 10. Localization, internationalization, RTL [TARGET; English-only at launch per DOM-00 §V]

| Topic | Rule |
|---|---|
| Framework | ICU MessageFormat catalogue per remote, namespace-prefixed keys (`cand.evidence.create.title`); extraction lint fails on hard-coded strings in JSX (FF-style CI check [OPEN-UX-05]); shell provides `I18nProvider` and locale negotiation |
| Locale resolution | Account preference → `Accept-Language` → default `en`; `lang` attribute on `<html>` and on inline foreign-language snippets (3.1.2) |
| Formats | `Intl.DateTimeFormat`, `NumberFormat`, `RelativeTimeFormat`, `ListFormat`, `PluralRules`; currency from billing region; time zones always shown on interview slots and deadlines ("14:00 GMT+1, your time") |
| Text expansion | Layouts tolerate +40 % string length and German-length words; no fixed-width buttons; truncate-with-expand only for user-generated content |
| RTL | `dir="rtl"` on `<html>` for ar/he/fa/ur; logical CSS properties; mirror icons flagged `data-mirror`; numbers/code stay LTR (`<bdi>`/`dir="ltr"`); bidirectional user text wrapped in `<bdi>`; tested with pseudo-locale `ar-XB` and `en-XA` (accents + expansion) in CI |
| Names / addresses | No first/last assumption: `fullName` + optional `preferredName`; pronouns free text, optional |
| Content localisation | Job, course and evidence content is user-generated in its own language; show language tag; no machine translation presented as the author's words |
| Non-goals now | Translation workflow tooling, per-locale legal text (OPEN-08) |

## 11. Content and voice [TARGET]

| Rule | Do | Don't |
|---|---|---|
| Plain, kind, specific | "We couldn't save your changes. Check your connection and try again." | "Error 500" |
| Verification honesty | "Claimed", "Backed by artifact", "Peer-attested", "Verified by Acme" | "Verified" for anything not L4; "Trusted", "Certified" for unsupported claims |
| Hiring dignity | "Not moving forward", "Position filled" | "Rejected", "Failed" |
| Integrity | "Review requested", "A person will look at this" | "Cheating detected", "Violation" |
| AI | "AI suggestion — you decide" | "AI verified", "Smart match" without explanation |
| Match | "Why this matched" with strengths and gaps; "Not enough information" when unknown | A bare percentage; "Perfect match" |
| Time pressure | Deadlines as facts ("Offer expires 3 Nov 17:00 GMT+1") | "Hurry!", fake scarcity |
| Errors | What happened → what to do → reference id | Blaming ("You entered an invalid…") |
| Buttons | Verb + object | "OK", "Yes", "Click here" |
| Reading level | Target ≈ grade 8, sentence ≤ 20 words, define "attested", "artifact" via popover | Internal jargon (SM-, rung, outbox) |
| Consent copy | Purpose, recipient, duration, what changes on revoke, and what cannot be recalled | Pre-ticked boxes, bundled consents |

## 12. Shell-owned shared package contract: `@ts/ui` [TARGET]

Aligns with ADR-T03 (shell + remotes), ADR-T18 (Host Contract), ADR-T19 (federation ≠ isolation), FF-03/FF-04 (no cross-remote imports; shared deps singleton with version range), INV-T16 (remotes never read credentials).

### 12.1 Ownership and delivery

| Item | Contract |
|---|---|
| Owner | Design-System team; **released with the shell Host Contract** (semver). `@ts/ui` is a *shared singleton* in the Module Federation config: `shared: { '@ts/ui': { singleton: true, requiredVersion: '^<major>.<minor>' }, react, react-dom, react-router, '@ts/i18n' }`. The shell supplies the instance; remotes declare ranges and never bundle a second copy (a build check fails if `@ts/ui` appears in a remote chunk). |
| Tokens | Delivered as CSS custom properties by the shell stylesheet (`ts-tokens.css`, served by shell, SRI-protected). Remotes may **read** `var(--ts-*)` only. Adding colours/spacing in remote CSS fails the token-lint (no raw hex/px outside allow-list). |
| Versioning | Semver. Minor = additive components/props. Major = breaking; shell must keep supporting the previous major for ≥ 2 shell releases via compat shim (FF-08 compat gate). Deprecations marked with a console warning in dev and an entry in the component changelog; removal only at a major. |
| Compatibility declaration | Each remote manifest declares `hostContract: "^M.m"`, `ui: "^M.m"`, `apiRange`, `dataSchema` (ADR-T18). Shell rejects incompatible remotes and uses the pinned last-known-good build. |
| Bundle budget | `@ts/ui` core ≤ 60 KB gz; heavy components (`CodeEditor`, `VideoPlayer`, `Charts`, `RichTextEditor`) exposed as separately lazy-loaded entry points and not in the shell critical path. |
| Visual/a11y regression | Each component has stories for all states, light/dark/HC/RTL, run in CI: axe-core, keyboard-interaction tests, Chromatic-class visual diff (tool choice OPEN-UX-06). Release blocked on new axe violations. |

### 12.2 Host services exposed to remotes (via `@ts/host` typed contract; remotes import types only)

| Service | API (summary) | Rules |
|---|---|---|
| `host.router` | `navigate(to, {replace})`, `useRouteParams()`, `register({title, headingId})`, `prompt(blockerFn)` | Remote must call `register` after first meaningful render so shell can set `document.title` and move focus to the `h1` (ACCESSIBILITY_SPEC §6). Absolute navigation to another remote only via shell path (`navigate('/jobs/123')`). |
| `host.session` | `useCapabilities()`, `useWorkspace()`, `useLocale()`, `useTheme()` | **No tokens exposed** (INV-T16). API calls use shell `host.fetch` (same-origin BFF, cookies automatic). |
| `host.fetch` | `fetch`-compatible; injects trace context (ADR-T16), CSRF header, `Idempotency-Key` helper `host.idem(intentId)`; maps problem+json to typed `ApiError` | Offline queue integration for the ADR-T10 set only via `host.queue.enqueue(kind, payload)`; `kind` ∈ {`application-draft`,`profile-edit`,`message-compose`,`note`}; any other kind throws. |
| `host.toast` / `host.announce` | `toast({kind, text, undo?})`, `announce(text, 'polite'|'assertive')` | Single live-region host in shell (avoids duplicate regions). |
| `host.dialog` | `confirm({title, body, confirmLabel, tone, typed?})` | Standard destructive-confirm pattern. |
| `host.telemetry` | `track(evt)` with allow-listed event names (EVT-*) | PII-free by construction. |
| `host.flags` | `isOn(flag)` | Flags are UX switches, not security. |
| `host.errorBoundary` | `<RemoteBoundary>` wraps each remote route | Provides remote-load failure UX (UI-07 §7). |

### 12.3 What remotes must not do

Import another remote's modules (FF-03); read cookies/storage for auth (INV-T16); define global CSS resets or override `:root` tokens; render their own `<main>`/skip links (shell owns landmarks; remote renders content *inside* `main`); use `position: fixed` bars without registering their height via `host.layout.registerStickyInset(px)` (feeds `scroll-padding`, §ACCESSIBILITY 2.4.11); trap focus outside `Dialog`; use `alert()`/`confirm()`.

### 12.4 Component API conventions

Props are typed by Zod-free TS interfaces; `className` escape hatch is **not** exposed (use variant props) to keep tokens enforceable; every component accepts `data-testid`; accessibility-critical props are required (`IconButton.label`, `Dialog.title`, `Table.caption`, `Image.alt`) and enforced by types + lint. Components never fetch data. `StatusBadge`/`EvidenceRungBadge` accept **only** API enum values; unknown value renders a neutral "Status unavailable" badge and logs `ui.unknown_status` (so a newer API cannot cause a mislabelled "verified").

## 13. Open design-system items

| ID | Item |
|---|---|
| OPEN-UX-04 | Whether adopting an AI suggestion stores an `ai_assisted` provenance flag visible to viewers (transparency vs stigma). |
| OPEN-UX-05 | i18n extraction lint tool and CI gate selection. |
| OPEN-UX-06 | Visual-regression tool and hosting. |
| OPEN-UX-07 | Org accent-colour branding: allow at all at launch? (adds contrast-validation burden). |
| OPEN-UX-08 | Final brand identity (logo, name casing) not yet decided; tokens are brand-neutral beyond the primary hue. |

# 02 Design System

Status: intended design. The as-built input is `packages/ui/src/tokens.ts` (colors, spacing, typography, motion, breakpoints) and the primitives in `apps/web/src/components/ui/` (Badge, Button, Card, EmptyState, Field, Icons, Input, LoadError, Modal, Notice, PageHeader, StatusPill, VerificationSeal). Those files are inputs: where this document differs, this document is the target and the difference is listed in section 2.4. Nothing here claims that a component exists beyond that list.

Rule ids use area code `DSY` (`NFR-DSY-nnn`). Component ids use `CMP-<Name>`. Contrast ratios quoted in this file were computed with the WCAG 2.2 relative-luminance formula against the stated background; they are not estimates.

## 1. Principles

| Id    | Principle                      | What it means in a screen                                                                                                                                                                                                   | Anti-pattern it forbids                                                                                                  |
| ----- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| DP-01 | Evidence before assertion      | Anything the platform has verified shows a verification seal with source and date; anything self-declared is visibly self-declared. The two are never styled alike. [SRC: tokens.ts "spruce is the brand (verified state)"] | Showing a green check for a claim nobody checked                                                                         |
| DP-02 | Calm density                   | Professional users scan many rows; use compact typography and tables, but keep one clear focal point per region and generous space between regions                                                                          | Walls of equal-weight text; decorative gradients                                                                         |
| DP-03 | One primary action             | At most one `primary` button per region (page header, dialog footer, card). Secondary actions are `secondary` or `ghost`                                                                                                    | Two filled buttons side by side                                                                                          |
| DP-04 | Honest state                   | Loading shows structure, not a fake bar; success is shown only after the server confirms; unbuilt or ephemeral features are labeled as such; no invented numbers                                                            | Optimistic "Saved" before the write returns (except where the optimistic rule in `03` section 8 allows it with rollback) |
| DP-05 | Recoverable by default         | Prefer undo over confirm; confirm only when an action cannot be undone or affects others                                                                                                                                    | Confirmation dialogs for every delete                                                                                    |
| DP-06 | Mobile-native, not scaled      | Phone layouts use bottom sheets, sticky action bars, tabs and thumb-reachable controls; desktop uses sidebars, tables and panels                                                                                            | Desktop layout in a narrow column                                                                                        |
| DP-07 | Accessible by construction     | Every component ships with keyboard, focus, ARIA, contrast, reduced-motion and zoom behavior; the component is not done until the checklist in `04` section 12 passes                                                       | "Add accessibility later"                                                                                                |
| DP-08 | Plain language                 | Words are short and concrete; labels name the outcome; see `06`                                                                                                                                                             | Jargon, internal status names, exclamation marks                                                                         |
| DP-09 | Same thing, same look          | A concept (status, person, money, date, skill) renders the same everywhere through one component                                                                                                                            | Feature-local copies of a pill or a card                                                                                 |
| DP-10 | Respect attention              | Notifications, badges, streaks and nudges are rate-limited, dismissible and honest; no countdown timers or scarcity messaging unless real                                                                                   | Dark patterns (confirm-shaming, fake urgency, hidden unsubscribe)                                                        |
| DP-11 | Color is never the only signal | Every status, chart series, validation and selection state has an icon, text, shape or pattern in addition to color                                                                                                         | Red/green only status                                                                                                    |
| DP-12 | Calm motion                    | Motion explains cause and effect, lasts at most 400 ms, and disappears under reduced motion                                                                                                                                 | Decorative animation; auto-playing loops                                                                                 |

## 2. Token architecture

### 2.1 Three tiers

1. **Primitive tokens**: raw scales (neutral, primary, status ramps, spacing, radii, durations). Only the token package defines them. As-built: `colors.primary`, `colors.neutral`, `spacing`, `typography`, `motion`, `breakpoints`.
2. **Semantic tokens**: role names (`--ts-text-body`, `--ts-bg-surface`, `--ts-action-bg`). Components and features use only these. Themes (light, dark, high contrast) redefine semantic tokens, never primitives.
3. **Component tokens**: optional per-component aliases (`--ts-button-primary-bg: var(--ts-action-bg)`). Created only when a component needs a value that differs from the semantic role.

### 2.2 Naming and delivery

- CSS custom properties, prefix `--ts-`, kebab-case, `--ts-{category}-{role}[-{variant}]`. Example: `--ts-text-muted`, `--ts-bg-surface`, `--ts-border-control`, `--ts-space-4`, `--ts-radius-md`, `--ts-dur-fast`.
- One generated source: `packages/ui/src/tokens.ts` is the as-built authority; the target adds a theme map (light, dark, high-contrast) and generates both the CSS variables and the TypeScript constants from it, so values are never typed twice. [PROP]
- Feature code never contains a hex color, a pixel spacing literal outside the scale, a raw `z-index`, a raw duration or an `rgba()` color. A lint rule fails the build on those. `NFR-DSY-001`.
- Themes are applied on `<html data-theme="light|dark" data-contrast="more|normal" data-density="comfortable|compact">`. Default follows `prefers-color-scheme` and `prefers-contrast`, overridable by user setting in `/settings/accessibility`.
- Token names are stable API. Renames ship with an alias for one major release.

### 2.3 Rules for adding tokens

- A new semantic token requires: a role description, values for all three themes, a contrast check against every background it can sit on, and one real usage. Decorative one-off colors are rejected.
- A component token is added only when two or more variants of a component need different values.

### 2.4 As-built input versus target (gaps)

| Item                                             | As-built (`tokens.ts`)                   | Target                                                                                                                                                   | Reason                                                                |
| ------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Radius                                           | Not defined in `tokens.ts`               | `--ts-radius-xs 4, sm 6, md 10, lg 16, full 9999` (legacy design doc lists 6/10/16/50%) [SRC: docs/experience/UI_UX_DESIGN_SYSTEM.md §3]                 | Needed by every component                                             |
| Elevation                                        | Not defined                              | Five levels (section 7)                                                                                                                                  | Overlays need consistent depth                                        |
| Z-index                                          | Not defined                              | Central scale (section 9)                                                                                                                                | Legacy doc requires central ownership                                 |
| Dark theme                                       | Not defined                              | Full dark semantic set (section 4.3)                                                                                                                     | Legacy "Dark mode first-class"                                        |
| High contrast                                    | Not defined                              | `data-contrast="more"` set (section 4.4)                                                                                                                 | WCAG and user need                                                    |
| Spacing                                          | 4, 8, 16, 24, 32, 48, 64                 | Add 12 and 20 (`--ts-space-3`, `--ts-space-5`)                                                                                                           | Dense tables and chips need 12                                        |
| Motion durations                                 | 0, 150, 250, 400 ms                      | Keep as-built. Legacy doc says 120/200/320                                                                                                               | Conflict C-DSY-01: as-built wins unless `OD-DSY-01` decides otherwise |
| Semantic `success`                               | `#1e5b45`, identical to `primary.700`    | Keep value; document that success and brand action share hue, so success is always paired with a check icon and text                                     | Avoids a second green                                                 |
| Semantic `warning` display `#c98a1b`             | 2.69:1 on paper (fails 3:1 for graphics) | Icons use `--ts-warning-icon` `#9a6410` (4.81:1 on card); `#c98a1b` retained only as a fill behind dark text, never as an icon or line on light surfaces | Non-text contrast 1.4.11                                              |
| `neutral.400` `#9aa39c`, `neutral.300` `#c9cfc8` | Usable as borders                        | Forbidden as the boundary of an interactive control (2.37:1 and 1.45:1 on paper); decorative dividers only                                               | 1.4.11                                                                |
| `textColors.faint` (`neutral.500`)               | 4.12:1 on paper, below 4.5:1             | Decorative or large text (24 px or 18.66 px bold) only, never for meaningful copy; documented as such in the as-built comment already                    | 1.4.3                                                                 |
| Tokens for focus                                 | Not defined                              | `--ts-focus-ring` and `--ts-focus-offset` independent of brand (legacy doc requirement)                                                                  | 2.4.7, 2.4.13                                                         |

## 3. Foundations

### 3.1 Color primitives (as-built)

| Scale                | 50        | 100       | 200       | 300       | 400       | 500       | 600       | 700       | 800       | 900       | 950       |
| -------------------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| primary (spruce)     | `#eef5f1` | `#d9e9e0` | `#b3d3c2` | `#7fb29a` | `#4f8f75` | `#2f7559` | `#25634a` | `#1e5b45` | `#17493a` | `#10342a` | n/a       |
| neutral (green-grey) | `#fafbf8` | `#f4f5f1` | `#e4e7e1` | `#c9cfc8` | `#9aa39c` | `#6f7971` | `#55605a` | `#3f4a44` | `#2a342f` | `#17201c` | `#0c110e` |

Added primitives [PROP]: neutral `150` `#eceee8` (= as-built `surface.subtle`), neutral `850` `#1e2823`, neutral `875` `#222d27`; status ramps in section 3.3; staff plum `#6b2c5e`.

### 3.2 Semantic color roles

All pairs below satisfy the stated contrast. "T" is text contrast (AA 4.5:1, large text 3:1), "G" is graphics and control boundaries (3:1).

**Surfaces**

| Token              | Light                                              | Dark               | High contrast (light / dark) | Use                                                     |
| ------------------ | -------------------------------------------------- | ------------------ | ---------------------------- | ------------------------------------------------------- |
| `--ts-bg-page`     | `#f4f5f1`                                          | `#0c110e`          | `#ffffff` / `#000000`        | Page background                                         |
| `--ts-bg-surface`  | `#fafbf8`                                          | `#17201c`          | `#ffffff` / `#000000`        | Cards, panels, table body                               |
| `--ts-bg-subtle`   | `#eceee8`                                          | `#1e2823`          | `#f4f5f1` / `#17201c`        | Table header, code blocks, inset regions, skeleton base |
| `--ts-bg-raised`   | `#ffffff`                                          | `#2a342f`          | `#ffffff` / `#17201c`        | Menus, popovers, dialogs, drawers                       |
| `--ts-bg-hover`    | `#eef0ea`                                          | `#222d27`          | `#e4e7e1` / `#2a342f`        | Row and item hover                                      |
| `--ts-bg-selected` | `#e6f1ec`                                          | `#173a2c`          | `#d9e9e0` / `#10342a`        | Selected row, current nav item                          |
| `--ts-bg-inverse`  | `#17201c`                                          | `#f4f5f1`          | `#000000` / `#ffffff`        | Tooltip, toast                                          |
| `--ts-bg-scrim`    | `rgba(23,32,28,0.55)` (as-built `surface.overlay`) | `rgba(0,0,0,0.65)` | `rgba(0,0,0,0.8)`            | Behind modals and drawers                               |

**Text**

| Token                 | Light     | on         | T                             | Dark      | on         | T                                             | Use                                              |
| --------------------- | --------- | ---------- | ----------------------------- | --------- | ---------- | --------------------------------------------- | ------------------------------------------------ |
| `--ts-text-heading`   | `#17201c` | page       | 15.22                         | `#f4f5f1` | `#0c110e`  | 17.40                                         | h1 to h4, key numbers                            |
| `--ts-text-body`      | `#3f4a44` | page       | 8.43                          | `#c9cfc8` | `#0c110e`  | 12.02                                         | Default paragraph and table cell text            |
| `--ts-text-muted`     | `#55605a` | page       | 5.98 (card 6.30, subtle 5.60) | `#9aa39c` | `#0c110e`  | 7.34 (surface 6.42, subtle 5.85, raised 4.96) | Secondary text, help text, captions, placeholder |
| `--ts-text-faint`     | `#6f7971` | page       | 4.12                          | `#6f7971` | `#0c110e`  | 4.22                                          | Decorative or large text only                    |
| `--ts-text-inverse`   | `#fafbf8` | inverse bg | 15.22                         | `#0c110e` | inverse bg | 17.40                                         | Text on `--ts-bg-inverse`                        |
| `--ts-text-link`      | `#1e5b45` | page       | 7.27                          | `#7fb29a` | surface    | 6.94                                          | Inline links, always underlined (see below)      |
| `--ts-text-on-action` | `#ffffff` | action bg  | 7.09                          | `#0c110e` | action bg  | 7.93                                          | Label on filled primary button                   |

Links: inline links in running text are underlined at all times (not color alone, 1.4.1); underline thickness 1 px, offset 2 px; hover thickens to 2 px. Navigation links and buttons are not underlined.

**Borders**

| Token                 | Light                                                 | Dark                                                      | High contrast         | Use                                                                         | Constraint                                                                                           |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `--ts-border-subtle`  | `#e4e7e1`                                             | `#2a342f`                                                 | `#55605a`             | Dividers inside a surface                                                   | Decorative; may be below 3:1 only when content boundaries are also conveyed by spacing or background |
| `--ts-border-default` | `#c9cfc8`                                             | `#3f4a44`                                                 | `#3f4a44`             | Card and panel outlines                                                     | Decorative                                                                                           |
| `--ts-border-control` | `#6f7971` (4.52 on white, 4.12 on page, 4.35 on card) | `#8a948c` (5.31 on surface, 4.11 on raised, 6.07 on page) | `#17201c` / `#ffffff` | Inputs, checkbox, radio, switch outline, outlined buttons, unselected chips | Always at least 3:1 against the surface it sits on                                                   |
| `--ts-border-strong`  | `#3f4a44`                                             | `#9aa39c`                                                 | `#000000` / `#ffffff` | Emphasis outlines, table header rule in HC                                  | none                                                                                                 |

**Action and focus**

| Token                   | Light                                  | Dark                                         | HC                          | Notes                                                                           |
| ----------------------- | -------------------------------------- | -------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| `--ts-action-bg`        | `#25634a` (primary.600)                | `#7fb29a` (primary.300)                      | `#10342a` / `#b3d3c2`       | Primary button fill. White on it: 7.09 light. `#0c110e` on `#7fb29a`: 7.93 dark |
| `--ts-action-bg-hover`  | `#1e5b45` (primary.700; white 7.96)    | `#b3d3c2` (primary.200; 11.81)               | `#000000` / `#ffffff`       |                                                                                 |
| `--ts-action-bg-active` | `#17493a` (primary.800; white 10.24)   | `#4f8f75` (primary.400; 5.01 with `#0c110e`) | n/a                         |                                                                                 |
| `--ts-action-subtle-bg` | `#d9e9e0` (primary.100)                | `#173a2c`                                    | `#d9e9e0` / `#10342a`       | Tonal and secondary-brand fills; text on it `--ts-text-link`                    |
| `--ts-focus-ring`       | `#1e5b45` (7.67 on card, 7.27 on page) | `#b3d3c2` (10.33 on surface)                 | `#000000` / `#ffffff`, 3 px | 2 px ring, 2 px offset in `--ts-bg-page` (see 3.8)                              |

**Status roles** (each has `bg`, `border`, `text`, `icon`)

| Role      | Light bg  | Light text (on bg)   | Light icon (on bg)                   | Dark bg   | Dark text (on bg) | Meaning                            |
| --------- | --------- | -------------------- | ------------------------------------ | --------- | ----------------- | ---------------------------------- |
| `success` | `#e6f1ec` | `#1e5b45` (6.88)     | `#1e5b45` (6.88)                     | `#12291f` | `#8fd0b3` (8.69)  | Completed, verified, valid         |
| `warning` | `#fbf2de` | `#8a5a12` (5.31)     | `#9a6410` (4.49 on bg, 4.81 on card) | `#33260a` | `#e8c06a` (8.56)  | Needs attention, expiring, partial |
| `danger`  | `#fbece6` | `#a8360a` (5.71)     | `#c2410c` (4.50)                     | `#3a1a10` | `#f2a98a` (8.10)  | Error, blocked, destructive        |
| `info`    | `#e8eff5` | `#3d5a75` (6.20)     | `#4a6b8a` (4.81)                     | `#15222e` | `#9dbbd6` (8.09)  | Neutral information, in progress   |
| `neutral` | `#eceee8` | `#3f4a44` (see body) | `#55605a`                            | `#1e2823` | `#c9cfc8`         | Draft, archived, no status         |

Status borders: `success` `#b3d3c2`, `warning` `#e6c98f`, `danger` `#f0b9a4`, `info` `#b8cde0` (light); dark borders are the status text color at 40 percent. Decorative.

**Special roles**

| Token        | Value                       | Use                                                                                                                                                                         |
| ------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ts-staff` | `#6b2c5e` (white text 9.78) | Console top stripe and staff banner only                                                                                                                                    |
| `--ts-ai`    | none (no hue)               | AI-generated content uses `neutral` tonal chip with the sparkle icon and the text "AI". A dedicated hue is deliberately not introduced, to keep one meaning per hue. [PROP] |

### 3.3 Domain status mapping

Domain lifecycle states from the legacy design doc map to roles. Each status renders as `StatusPill` with an icon, a text label, and the role colors. The label text is fixed here so all modules agree.

| Domain state    | Role    | Icon                                       | Label         | Notes                                                            |
| --------------- | ------- | ------------------------------------------ | ------------- | ---------------------------------------------------------------- |
| `VERIFIED`      | success | shield-check                               | Verified      | Shows source and date in a tooltip and detail                    |
| `PENDING`       | info    | clock                                      | Pending       | Awaiting someone else                                            |
| `PROCESSING`    | info    | spinner (static icon under reduced motion) | Checking      | Active work by the system                                        |
| `REJECTED`      | danger  | x-circle                                   | Not verified  | Candidate-facing copy avoids the word "rejected" for credentials |
| `EXPIRED`       | warning | calendar-x                                 | Expired       | Date shown                                                       |
| `REVOKED`       | danger  | ban                                        | Revoked       | Reason in detail where policy allows                             |
| `DISPUTED`      | warning | flag                                       | Disputed      |                                                                  |
| `ARCHIVED`      | neutral | archive                                    | Archived      |                                                                  |
| `DRAFT`         | neutral | pencil                                     | Draft         |                                                                  |
| `SELF_DECLARED` | neutral | user                                       | Self-reported | Never styled as success                                          |

Application and pipeline stage names are owned by JOB and ATS. Rule `NFR-DSY-002`: a stage that is not an outcome renders `neutral` or `info`; only terminal positive outcomes (offer accepted, hired) render `success`; a candidate-facing rejection renders `neutral` with the label from `06`, not `danger`, because the candidate did not make an error. [PROP]

### 3.4 Data visualization palette

Categorical (maximum 6 series; beyond that, group into "Other"):

| Slot | Light (on `#fafbf8`) | Contrast | Dark (on `#17201c`) | Contrast | Marker shape |
| ---- | -------------------- | -------- | ------------------- | -------- | ------------ |
| 1    | `#2f7559`            | 5.31     | `#7fb29a`           | 6.94     | circle       |
| 2    | `#4a6b8a`            | 5.38     | `#8fb0d0`           | 7.37     | square       |
| 3    | `#9a6410`            | 4.81     | `#e0ab45`           | 8.00     | triangle     |
| 4    | `#a8360a`            | 6.32     | `#f2a98a`           | 8.59     | diamond      |
| 5    | `#7a5a9c`            | 5.36     | `#b79bd6`           | 6.88     | cross        |
| 6    | `#3f4a44`            | 8.89     | `#c9cfc8`           | 10.51    | star         |

Sequential (one measure, low to high): `primary.100` to `primary.800` in 5 steps; Diverging: `#a8360a` ... `#e4e7e1` ... `#2f7559`. Rules in section 8.3.

### 3.5 Typography

Families (as-built): sans `"IBM Plex Sans"`, mono `"IBM Plex Mono"`, serif `Newsreader`. Sans is the UI face. Serif is used only for marketing display headings, certificates and long-form editorial (course descriptions, articles); never in controls, tables or navigation.

| Role       | Token                   | Size and line height                                        | Weight         | Letter spacing | Use                                                    |
| ---------- | ----------------------- | ----------------------------------------------------------- | -------------- | -------------- | ------------------------------------------------------ |
| Display XL | `--ts-type-display-xl`  | `6xl` fluid `clamp(3rem, 1.9rem + 4.2vw, 4.5rem)` / 1.15    | 600 serif      | `tight`        | Marketing hero only                                    |
| Display    | `--ts-type-display`     | `5xl` fluid `clamp(2.5rem, 1.6rem + 3.2vw, 3.75rem)` / 1.15 | 600 serif      | `tight`        | Marketing section heads, certificate titles            |
| H1         | `--ts-type-h1`          | `3xl` 1.875rem / 1.35 desktop; `2xl` 1.5rem phone           | 600            | `tight`        | Page title, one per route                              |
| H2         | `--ts-type-h2`          | `2xl` 1.5rem / 1.35; `xl` phone                             | 600            | `tight`        | Section                                                |
| H3         | `--ts-type-h3`          | `xl` 1.25rem / 1.35                                         | 600            | normal         | Subsection, card group title                           |
| H4         | `--ts-type-h4`          | `lg` 1.125rem / 1.35                                        | 600            | normal         | Card title, dialog title                               |
| Body large | `--ts-type-body-lg`     | `lg` / 1.5 (reading 1.65)                                   | 400            | normal         | Lead paragraphs, long-form content                     |
| Body       | `--ts-type-body`        | `base` 1rem / 1.5                                           | 400            | normal         | Default                                                |
| Body small | `--ts-type-body-sm`     | `sm` 0.875rem / 1.43                                        | 400            | normal         | Table cells (comfortable), secondary info, helper text |
| Caption    | `--ts-type-caption`     | `xs` 0.75rem / 1.33                                         | 400            | normal         | Timestamps, legal footnotes, chart axis                |
| Label      | `--ts-type-label`       | `sm` / 1.43                                                 | 500            | normal         | Form labels, button text (md), tabs                    |
| Overline   | `--ts-type-overline`    | `xs` / 1.33                                                 | 600, uppercase | `wide` 0.06em  | Group headings (sidebar), table column group           |
| Code       | `--ts-type-code`        | mono `sm` / 1.5                                             | 400            | normal         | IDs, API keys, code editor                             |
| Numeric    | `tabular-nums` modifier | inherits                                                    | inherits       | normal         | Tables, money, scores, timers                          |

Rules:

- `NFR-DSY-003` Sizes are in `rem`; no component sets a font size in `px`. The page remains fully usable at 200 percent browser text zoom and at 400 percent zoom with reflow (1.4.4, 1.4.10).
- `NFR-DSY-004` Minimum rendered text size is 12 px (caption only). Form input text is at least 16 px on touch devices to prevent browser zoom on focus.
- `NFR-DSY-005` Line length for prose is 45 to 80 characters (`max-width: 72ch`). Table and UI text are exempt.
- `NFR-DSY-006` Weight is never the only emphasis between two statuses; and never below 400 on text under 14 px.
- `NFR-DSY-007` Text spacing overrides (line height 1.5, paragraph spacing 2 em, letter spacing 0.12 em, word spacing 0.16 em) must not clip or overlap content (1.4.12); components do not use fixed heights on text containers.
- `NFR-DSY-008` Fonts are self-hosted, `font-display: swap`, with metric-adjusted fallbacks (`size-adjust`, `ascent-override`) so layout shift on swap is under 0.01 CLS. Weights loaded: 400, 500, 600, 700 for sans, 400 for mono, 600 for serif. [PROP]
- Script fallbacks for localization [PROP]: Arabic `"IBM Plex Sans Arabic"`, Hebrew `"IBM Plex Sans Hebrew"`, Devanagari `"Noto Sans Devanagari"`, Japanese, Korean, Chinese: system stacks. Line height for these scripts is 1.6 minimum. See `06` section 9.
- Truncation: single-line truncation uses ellipsis and exposes the full text (`title` for pointer, accessible name or expandable detail for others). Multi-line clamp is limited to 2 or 3 lines in cards and never in tables' primary column without a "Show more" path. Names are never truncated in dialogs and confirmations.

### 3.6 Spacing and layout

Base unit 4 px. Token scale: `--ts-space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32, `-12` 48, `-16` 64 (as-built names `xs`..`3xl` map to 1, 2, 4, 6, 8, 12, 16; `3` and `5` are additions).

| Semantic spacing                   | Phone | Tablet | Desktop                            |
| ---------------------------------- | ----- | ------ | ---------------------------------- |
| Page gutter (side padding)         | 16    | 24     | 32                                 |
| Card padding                       | 16    | 20     | 24 (compact density: 12 / 16 / 16) |
| Section gap (between page regions) | 24    | 32     | 32 to 48                           |
| Stack gap, related items           | 8     | 8      | 8                                  |
| Stack gap, form fields             | 16    | 16     | 20                                 |
| Inline gap, button groups          | 8     | 8      | 8                                  |

Layout grid: 4 columns phone (gutter 16), 8 columns tablet (gutter 16), 12 columns desktop (gutter 24). Content max widths in the app shell content area: `--ts-content-max` 1280 px (lists, dashboards), `--ts-content-narrow` 960 px (detail with side panel), `--ts-content-form` 640 px (forms, settings), `--ts-content-reading` 720 px (long text). Pages center within the content area; tables may use the full area width.

### 3.7 Radius and borders

`--ts-radius-xs` 4 (tags in dense tables), `-sm` 6 (inputs, buttons, chips), `-md` 10 (cards, menus), `-lg` 16 (dialogs, sheets, large cards), `-full` 9999 (avatars, pills, switch). Border width 1 px default, 2 px for selected and focus emphasis. Bottom sheets round only the top corners (`lg`). Nested radius rule: inner radius = outer radius minus padding, minimum 4.

### 3.8 Elevation, focus and shadows

| Level | Token         | Light                                                           | Dark                                                    | Use                                                    |
| ----- | ------------- | --------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| 0     | `--ts-elev-0` | none                                                            | none                                                    | Page                                                   |
| 1     | `--ts-elev-1` | `0 1px 2px rgba(23,32,28,0.06)` + 1 px `--ts-border-default`    | border only                                             | Cards, table container                                 |
| 2     | `--ts-elev-2` | `0 4px 12px rgba(23,32,28,0.12), 0 1px 3px rgba(23,32,28,0.08)` | surface `--ts-bg-raised` + border `--ts-border-default` | Menus, popovers, dropdowns, sticky bars while scrolled |
| 3     | `--ts-elev-3` | `0 8px 24px rgba(23,32,28,0.16)`                                | raised + border + `0 8px 24px rgba(0,0,0,0.4)`          | Drawers, bottom sheets, command palette                |
| 4     | `--ts-elev-4` | `0 16px 48px rgba(23,32,28,0.24)`                               | raised + border + `0 16px 48px rgba(0,0,0,0.5)`         | Modal dialogs                                          |

Focus ring (all focusable elements): `outline: 2px solid var(--ts-focus-ring); outline-offset: 2px;` on `:focus-visible`; high contrast mode 3 px. The offset gap shows the surface color so the ring is distinguishable against both the element and the background (target: contrast change at least 3:1 between focused and unfocused pixels, WCAG 2.4.13). Elements inside overflow-hidden containers use an inset ring (`outline-offset: -2px`) so they are never clipped. Mouse clicks do not show the ring (`:focus-visible` only); programmatic focus after keyboard actions does.

### 3.9 Motion

| Token              | Value                               | Use                                                             |
| ------------------ | ----------------------------------- | --------------------------------------------------------------- |
| `--ts-dur-instant` | 0 ms                                | Reduced motion, immediate feedback                              |
| `--ts-dur-fast`    | 150 ms                              | Hover, press, color change, tooltip, checkbox, switch           |
| `--ts-dur-normal`  | 250 ms                              | Menus, accordions, toast in, tab indicator, skeleton to content |
| `--ts-dur-slow`    | 400 ms                              | Dialog, drawer, bottom sheet, page element entrance             |
| `--ts-ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`        | Entering                                                        |
| `--ts-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`      | Moving and resizing                                             |
| `--ts-ease-in`     | `cubic-bezier(0.4, 0, 1, 1)` [PROP] | Exiting (exit durations are 70 percent of entering)             |

Rules:

- `NFR-DSY-009` Only `opacity` and `transform` animate for entrances and exits; layout properties do not animate except height collapse for accordions (use `grid-template-rows` or measured height).
- `NFR-DSY-010` Under `prefers-reduced-motion: reduce` (and the in-app "Reduce motion" setting, which overrides to on): all transforms and slide/scale transitions are replaced by an opacity change of at most 100 ms or by none; spinners become a static icon plus text "Loading"; skeleton shimmer stops (static bars); carousels do not auto advance; parallax and scroll-linked animation are off; smooth scroll is off.
- `NFR-DSY-011` Nothing moves, blinks or auto-updates for more than 5 seconds without a pause, stop or hide control (2.2.2). Nothing flashes more than 3 times per second (2.3.1).
- `NFR-DSY-012` Motion is tied to a cause: user action, state change or arrival of new content. No ambient animation.
- Page transitions: none (instant route change with focus move). Progress indicators for navigations over 400 ms: a 2 px top bar, indeterminate, removed under reduced motion in favor of a text status in the live region.

### 3.10 Z-index scale

| Token             | Value | Layer                                                |
| ----------------- | ----- | ---------------------------------------------------- |
| `--ts-z-base`     | 0     | Content                                              |
| `--ts-z-raised`   | 10    | Hover cards, sticky table cells                      |
| `--ts-z-sticky`   | 100   | Sticky page header, table header, sticky action bars |
| `--ts-z-nav`      | 200   | Sidebar, top bar, bottom tabs, staff stripe          |
| `--ts-z-dropdown` | 300   | Menus, select lists, autocomplete lists              |
| `--ts-z-drawer`   | 400   | Side panels and bottom sheets (scrim at 390)         |
| `--ts-z-modal`    | 500   | Modal dialogs (scrim at 490)                         |
| `--ts-z-popover`  | 600   | Popovers and menus opened from within modals         |
| `--ts-z-toast`    | 700   | Toasts and live banners                              |
| `--ts-z-tooltip`  | 800   | Tooltips                                             |
| `--ts-z-skip`     | 1000  | Skip link, impersonation banner                      |

All overlays render into one portal root appended to `<body>`; stacking order beyond these layers follows DOM order within the layer. Feature code never sets `z-index`. `NFR-DSY-013`.

### 3.11 Breakpoints and containers

| Name   | Min width                 | Class       | Shell                                         |
| ------ | ------------------------- | ----------- | --------------------------------------------- |
| `base` | 0 (supported down to 320) | Phone       | Bottom tabs                                   |
| `sm`   | 640                       | Phone, wide | Bottom tabs, 2-column card grids              |
| `md`   | 768                       | Tablet      | Rail                                          |
| `lg`   | 1024                      | Desktop     | Sidebar                                       |
| `xl`   | 1280                      | Wide        | Sidebar plus optional context panel           |
| `2xl`  | 1536                      | Extra wide  | Content max width centers; no further scaling |

Component queries (container queries) are preferred over viewport queries inside cards and panels so a component adapts to the space it gets, not the screen. Pointer and hover queries (`pointer: coarse`, `hover: hover`) decide touch sizing and hover affordances. Orientation changes never remove functionality (1.3.4).

## 4. Themes

### 4.1 Theme selection

Three settings in `/settings/accessibility`: Theme (System default, Light, Dark), Contrast (System default, Standard, More), Density (Comfortable, Compact), plus Reduce motion (System default, On, Off) and Text size (Standard, Large, Larger: root font size 100, 112.5, 125 percent). Choices sync to the account and are also stored per device so they apply before sign-in. The theme is applied before first paint (inline script reads the stored value) to prevent a flash of the wrong theme. `NFR-DSY-014`.

### 4.2 Light

The as-built palette. Page `#f4f5f1`, surface `#fafbf8`. Values in section 3.2.

### 4.3 Dark

Rules: dark is a first-class theme [SRC: docs/experience/UI_UX_DESIGN_SYSTEM.md §2]. Surfaces get lighter with elevation (page `#0c110e`, surface `#17201c`, raised `#2a342f`); shadows are weak, so borders and surface tone carry depth. Pure white text and pure black backgrounds are avoided in standard dark to reduce halation (high-contrast dark uses them). Status colors shift to lighter tints (section 3.2). Images and illustrations are dimmed 8 percent in dark (`filter: brightness(0.92)`) unless they are user content that must stay accurate (certificates, ID documents, charts of evidence, photos of work), which are never filtered. Brand action in dark is the lighter `#7fb29a` with dark text.

### 4.4 High contrast

Triggered by `prefers-contrast: more`, the in-app Contrast setting "More", and `forced-colors: active`.

- In "More": backgrounds pure white or black, text pure black or white, borders 1 px `--ts-border-strong`, focus ring 3 px, status backgrounds removed (status shown by border, icon and text), elevation removed (borders only), disabled controls keep a visible dashed border.
- In `forced-colors: active` (Windows High Contrast): rely on system colors (`ButtonText`, `Canvas`, `Highlight`, `LinkText`); SVG icons use `currentColor`; custom-drawn controls (checkbox, switch, chart marks) have a transparent border so they appear; `forced-color-adjust: none` is not used except for color swatches and data-viz marks that carry meaning, and those are paired with labels.
- Contrast values used: text black on white 21:1, muted `#3f4a44` on white 9.23:1, action `#10342a` on white 13.58:1 (white label 13.58:1).

### 4.5 Density

| Aspect                            | Comfortable (default)                 | Compact               |
| --------------------------------- | ------------------------------------- | --------------------- |
| Control height (button, input md) | 40 px                                 | 32 px                 |
| Table row                         | 56 px (single line), 72 px (two line) | 40 px, 56 px          |
| Card padding                      | 24                                    | 16                    |
| List item                         | 56                                    | 44                    |
| Body table text                   | 14 px                                 | 14 px (never smaller) |

Coarse pointers ignore Compact for interactive target size: targets stay at least 44 by 44 px. Compact never reduces any target below 24 by 24 CSS px (2.5.8) on pointer devices. Density applies to tables, lists, forms and sidebars, not to dialogs or marketing pages. `NFR-DSY-015`.

## 5. Iconography

- Single family: line icons on a 24 px grid, 1.5 px stroke, rounded joins, `currentColor`. Sizes: 16 (inline with text and in dense tables), 20 (default in buttons and nav), 24 (standalone, tabs), 32 (empty states, feature cards). As-built `components/ui/Icons.tsx` holds the current custom set; the target adopts one grid-compatible library (Lucide-compatible) [PROP, OD-DSY-02] so the set can grow to the vocabulary below without drawing every icon.
- Decorative icons next to a visible label: `aria-hidden="true"`. Icon-only controls: an accessible name and a tooltip (section 13.5). Informative icons without adjacent text: `role="img"` with `aria-label`.
- Never use an icon as the only carrier of a status, destructive action or unfamiliar concept. Directional icons mirror in RTL (arrows, chevrons, back, send, progress); non-directional icons (check, clock, bell) do not. `NFR-DSY-016`.
- Filled variants are reserved for the selected state of tab bar and toggle icons (outline when unselected, filled when selected) as a non-color selection cue.

Stable vocabulary (concept, icon name): verified shield-check, pending clock, processing loader, not-verified x-circle, expired calendar-x, revoked ban, disputed flag, archived archive, draft pencil, evidence file-check, credential badge, certificate award, skill hexagon, job briefcase, company building, course book-open, lesson play-circle, assessment clipboard-check, challenge trophy, interview video, schedule calendar, message message-square, notification bell, network users, mentor user-check, gig layers, event calendar-star, institution graduation-cap, analytics bar-chart, settings sliders, security lock, privacy eye-off, billing credit-card, help circle-help, search search, filter funnel, sort arrow-up-down, more ellipsis, edit pencil, delete trash, copy copy, share share, download download, upload upload, link link, external external-link, add plus, close x, check check, warning triangle-alert, info info, AI sparkles, offline wifi-off, sync refresh. `sparkles` is reserved for AI so the AI marker stays unique. `NFR-DSY-017`.

## 6. Illustration and imagery

- Illustration style: flat geometric spot illustrations drawn with the primary and neutral ramps only (`primary.100/300/700`, `neutral.200/600/900`), 1.5 px linework matching icons, no gradients, no human figures (avoids representation and skin-tone problems; people are represented by avatars and initials). [PROP]
- Sizes: 120 (inline empty), 160 (page empty), 240 (onboarding, full-page errors). Dark variants swap fills via CSS variables so one SVG serves both themes.
- Usage: empty states, onboarding steps, full-page errors, marketing. Not used inside tables, forms or dashboards cards except empty states.
- Accessibility: purely decorative (`alt=""`, `aria-hidden`) because every illustration sits next to a heading and a sentence that carry the message. Illustrations never contain text.
- Photography and user images: user-uploaded only (profile photos, company logos, banners, course thumbnails, portfolio media). Required alt text for informative images (portfolio items, company banners, course thumbnails are decorative if the title is adjacent, so `alt=""`). Aspect ratios are reserved to avoid layout shift (avatar 1:1, banner 4:1, course thumb 16:9). Placeholders are a dominant-color or blurhash fill, then the image fades in (opacity only, `--ts-dur-normal`, skipped under reduced motion).
- Avatars: image, or initials on a color derived deterministically from the user id from the categorical palette, never conveying status by color. Sizes 24, 32, 40, 56, 96, 160.
- Logos: organization logos render on `--ts-bg-surface` with 4 px padding and a 1 px border so transparent or white logos remain visible in dark mode; if no logo, initials tile.

## 7. Component catalogue

### 7.1 Conventions

- Every component entry gives: **Anatomy** (named parts), **Variants**, **States**, **Behaviour**, **Keyboard**, **ARIA**, **Do** and **Don't**. Unless stated, all interactive components support the universal states: default, hover (only `hover: hover` devices), focus-visible, pressed, disabled, and, where data is involved, loading and error.
- Disabled: `aria-disabled="true"` for buttons and links that may need an explanation (stays focusable, shows a tooltip or helper text saying why); the native `disabled` attribute only for controls where focus should be skipped. A disabled control is never the only place a reason is given. Disabled text and borders are exempt from contrast but use `--ts-text-faint` on `--ts-bg-subtle` with a dashed border in HC.
- Sizes: `sm` (32), `md` (40, default), `lg` (48). Pointer coarse raises `sm` and `md` targets to 44.
- Promotion rule (as-built): a component stays feature-local until its second meaningful reuse, then moves to `components/ui` and gets this catalogue entry. [SRC: docs/experience/UI_UX_DESIGN_SYSTEM.md §4]
- Test ids: `data-testid` on interactive roots, kebab-case, stable.
- Do/Don't lines are testable review criteria, not advice.

### 7.2 Primitives

#### CMP-Button

- **Anatomy:** container, leading icon (optional), label, trailing icon (optional), loading spinner (replaces leading icon).
- **Variants:** `primary` (filled `--ts-action-bg`), `secondary` (outlined `--ts-border-control`, transparent fill), `tonal` (`--ts-action-subtle-bg`), `ghost` (no border, text only), `danger` (filled `#a8360a` light, `#f2a98a` dark; white 6.57:1 and `#0c110e` 9.81:1), `danger-ghost`, `link-button` (looks like a link, behaves like a button). Sizes `sm md lg`. Full-width option on phone.
- **States:** default, hover, focus-visible, pressed, loading (label stays, spinner shown, width fixed, `aria-busy="true"`, clicks ignored), disabled, success flash not used (use toast).
- **Behaviour:** one primary per region (DP-03). Activation triggers the action once; double-click guard of 500 ms plus server idempotency key on mutating actions. Loading shows after 150 ms of pending work; shorter operations show no spinner (avoids flicker). A button that navigates is a link (`CMP-Link` styled as button), not a `<button>`.
- **Keyboard:** `Enter` and `Space` activate. Focus order follows DOM.
- **ARIA:** native `<button type="button">` (forms: `type="submit"` explicitly). Icon-only uses `CMP-IconButton`. Toggle buttons use `aria-pressed`. Menu buttons `aria-haspopup="menu"`, `aria-expanded`.
- **Do:** verb plus object labels ("Save changes", "Send invite"); keep label at most 3 words (see `06` section 5); give a loading label via `aria-live` only when the outcome needs announcing.
- **Don't:** use "Click here", "Submit", "OK" alone; disable a submit button to signal invalid fields (show errors instead, `03` section 3.4); place two `primary` in one region; use `danger` for non-destructive actions.

#### CMP-IconButton

- **Anatomy:** container (min 44 by 44 hit area even if the visual is 32), icon, tooltip.
- **Variants:** `ghost` (default), `secondary`, `tonal`, `danger-ghost`; sizes 32, 40, 48.
- **States:** as Button; `aria-pressed` for toggles (bookmark, mute) with filled icon when on.
- **Behaviour:** tooltip shows on hover after 500 ms and on keyboard focus immediately; tooltip text equals the accessible name.
- **Keyboard:** as Button; `Esc` closes the tooltip.
- **ARIA:** required `aria-label` (the action, not the icon: "Close", "Bookmark job", not "X", "Star"); toggles keep a constant label and change `aria-pressed`.
- **Do:** pair with visible text in primary flows. **Don't:** use icon-only for destructive actions without a confirmation; use an unlabeled icon from outside the vocabulary (section 5).

#### CMP-Link

- **Anatomy:** anchor text, optional external icon (16 px) with visually hidden text "(opens in new tab)".
- **Variants:** inline (underlined), nav (not underlined, current page marked), standalone (with trailing arrow), button-styled.
- **States:** default, hover (thicker underline), focus-visible, visited (same color; no purple), current (`aria-current`).
- **Behaviour:** internal links use client routing and move focus to h1; external links open in the same tab unless the user is mid-task (form, assessment, wizard), in which case `target="_blank"` with `rel="noopener noreferrer"`. Links to files show type and size ("PDF, 240 KB").
- **ARIA:** link text makes sense out of context (2.4.4); "Read more" always has `aria-label` including the subject or visually hidden extension.
- **Do/Don't:** do use links for navigation, buttons for actions. Don't use `href="#"` or `role="link"` on a div.

#### CMP-Avatar and CMP-AvatarGroup

- **Anatomy:** image or initials, optional presence dot (online) with text alternative, optional verification corner mark.
- **Variants:** sizes 24 to 160; shape circle (people) or rounded square `radius-md` (organizations).
- **States:** loading (initials until image loads), error (initials fallback).
- **Behaviour:** group shows up to 4 avatars overlapped by 25 percent plus a "+N" chip; "+N" is a button opening the full list. Presence is never shown for candidates to employers (privacy).
- **ARIA:** informative avatars `alt` = person name; adjacent to the name, `alt=""`. Group: `role="group"` with `aria-label` "5 people".
- **Do:** always provide initials fallback. **Don't:** encode role or status by avatar ring color alone.

#### CMP-Badge (count badge)

- **Anatomy:** pill with number or dot. **Variants:** `count` (1 to 99, then 99+), `dot` (a state needing attention, no number). **Colors:** `danger` bg for attention counts (messages, approvals), `neutral` for informational.
- **ARIA:** badge text is part of the item's accessible name ("Messages, 3 unread"); a dot has visually hidden text ("needs attention"). A count change is announced politely at most once per 30 seconds.
- **Don't:** badge non-actionable counts (jobs available).

#### CMP-Tag (chip)

- **Anatomy:** label, optional leading icon or avatar, optional remove button.
- **Variants:** `static` (read-only label, `neutral`), `filter` (toggle, selected shows check icon and `--ts-action-subtle-bg` plus `--ts-border-strong`), `input` (removable token in token inputs), `suggestion` (action chip). Sizes `sm` 24, `md` 32 (44 target on touch via padding hit area).
- **States:** default, hover, selected, focus-visible, disabled, invalid (input tokens, danger border plus icon).
- **Keyboard:** filter chips are toggle buttons (`Space`); input chips: `Backspace` on the input focuses the last token, `Delete` or `Backspace` removes the focused token, arrow keys move between tokens.
- **ARIA:** filter chips `aria-pressed`; remove button `aria-label="Remove {label}"`.
- **Do/Don't:** do truncate at 24 characters with full text in `title`. Don't use a tag as a button without button semantics.

#### CMP-StatusPill

- **Anatomy:** status icon, label. **Variants:** the roles in section 3.2 (success, warning, danger, info, neutral) and the domain mappings in section 3.3. **Sizes:** `sm` 24, `md` 28.
- **Behaviour:** not interactive by default. With a tooltip or popover for detail (source, date, reason) it becomes a button (`aria-describedby` the detail).
- **ARIA:** text label is mandatory; icon `aria-hidden`.
- **Do:** use the labels from section 3.3 verbatim. **Don't:** write your own label ("Approved ✓"), color a pill with no icon, or put two pills of different roles beside the same object without precedence rules.

#### CMP-VerificationSeal

- **Anatomy:** shield-check mark, label ("Verified"), optional source ("by Acme University"), date, "Details" trigger.
- **Variants:** `inline` (icon plus word, 16 to 20 px), `card` (with source and date), `large` (certificate and profile header). States per domain statuses (section 3.3): verified, pending, not verified, expired, revoked, disputed, self-reported (no seal).
- **Behaviour:** details popover shows who verified, method (document, issuer API, employer confirmation, background check partner), date, expiry, and a public verification link `/verify/{code}` when the subject allows. Never shows a seal without a source and a date.
- **Do/Don't:** do match the as-built `VerificationSeal`; don't render the seal for self-declared data under any condition. [SRC: apps/web/src/components/ui/VerificationSeal.tsx]

#### CMP-Divider, CMP-Skeleton, CMP-Spinner, CMP-ProgressBar, CMP-ProgressRing, CMP-Kbd

- **Divider:** 1 px `--ts-border-subtle`; semantic `<hr>` between thematically different content, presentational otherwise (`role="presentation"`). Vertical dividers in toolbars.
- **Skeleton:** section 12.
- **Spinner:** 16, 20, 32 px ring; used only inside buttons and for operations under 2 seconds with no known structure; always has text alternative ("Loading") via the container's `aria-busy` and a polite status; under reduced motion becomes a static dotted ring plus the word "Loading".
- **ProgressBar:** determinate (value known) or indeterminate. Anatomy: track `--ts-bg-subtle`, fill `--ts-action-bg`, label ("42 percent" or "3 of 7 lessons"), optional remaining time. ARIA `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`; indeterminate omits `aria-valuenow`. Height 8 (4 for compact). Never decreases except on a documented reset. Do show the number; don't use only color to indicate completion.
- **ProgressRing:** same semantics, used for scores and readiness (diameter 48, 96); the value text is inside or adjacent.
- **Kbd:** `<kbd>` with `--ts-bg-subtle` and border; platform-aware (`Cmd` vs `Ctrl`); never the only way to find a feature.

### 7.3 Form controls

Common to all form controls: wrapped by `CMP-Field`; label always visible (placeholders are never labels); minimum height 40 (44 on touch); border `--ts-border-control` 1 px, 2 px `--ts-focus-ring` on focus plus the global ring; invalid state: border `#a8360a` (dark `#f2a98a`) 2 px, danger icon, error text below; read-only: `--ts-bg-subtle` fill, normal text color, not focusable-skipping; disabled as in 7.1; `autocomplete` tokens set per WCAG 1.3.5 on identity fields (name, email, tel, street-address, bday, organization, one-time-code, current-password, new-password).

#### CMP-Field

- **Anatomy (top to bottom):** label (+ "Optional" suffix when optional; required fields are the default and unmarked, `06` section 3.4 explains), description/help (muted), control, character counter (when limited), error message (with icon), success note (rare).
- **Behaviour:** label is `<label for>`; description linked by `aria-describedby`; error linked by `aria-describedby` and `aria-invalid="true"`; error message and help are both in the description chain in that order. Required is conveyed by `required` and by the text; the asterisk convention is not used. A group of related controls uses `<fieldset><legend>`.
- **Layout:** label above control at all widths (single column forms), two columns only for naturally paired fields (first name, last name; start, end) at 768 and up, stacking below.
- **Do/Don't:** do group at most 7 fields per section; don't put help text in a tooltip.

#### CMP-TextInput, CMP-Textarea, CMP-PasswordInput, CMP-NumberInput, CMP-SearchField

- **TextInput:** types `text`, `email`, `url`, `tel`; correct `inputmode`, `autocomplete`, `spellcheck` (off for emails, handles, codes). Prefix and suffix slots (currency, units, `@`). Clear button for search fields only.
- **Textarea:** auto-grows to a max of 10 lines then scrolls; counter shows remaining when within 20 percent of the limit (polite announce at 90 percent and at the limit); resize handle vertical only. Min 3 rows.
- **PasswordInput:** show/hide toggle button (`aria-pressed`, label "Show password"); strength meter is advisory text, not color only; paste is never blocked; supports password managers.
- **NumberInput:** `inputmode="numeric"` or `decimal`; a text input with validation rather than `type=number` spinners (avoids scroll-wheel changes); optional stepper buttons; locale-aware parsing and display; min, max, step stated in help.
- **SearchField:** `role="search"` landmark wrapper, label "Search {thing}", Enter submits, `Esc` clears when non-empty, debounced live search 400 ms where the screen supports it (section 4 of `03`), "x" clear button focusable. Recent searches listed on focus when empty (opt-out in privacy).
- **Keyboard:** native. **ARIA:** per Field.
- **Do/Don't:** do set `maxlength` only with a visible counter; don't mask input in a way that blocks assistive tech; don't strip whitespace silently (trim and say so only if it changes the value).

#### CMP-Select, CMP-Combobox, CMP-MultiSelect

- **Select:** the native `<select>` for 7 or fewer options on any device and for all options on touch devices where the OS picker is better. For 8 or more options with search: Combobox.
- **Combobox (single):** anatomy: input, popup listbox, option rows (label, optional secondary text, optional icon), empty row, loading row. ARIA 1.2 combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`; options `role="option"` with `aria-selected`. Behaviour: opens on typing, `Alt Down` or click; filters client-side up to 200 options, server-side above, debounce 250 ms; shows "No matches. {Create "{text}"}" only where creating is allowed; selecting closes the popup and keeps focus on the input. Keyboard: Up/Down move, `Home`/`End`, `Enter` selects, `Esc` closes (second `Esc` clears), `Tab` selects nothing and moves on (free text is not committed unless `allowCustom`).
- **MultiSelect:** Combobox plus tokens (CMP-Tag `input`); popup stays open after selection; "Select all" and "Clear" only for lists up to 50; max selection shows "You can choose up to 5" and disables the rest with reason; count summary when tokens overflow ("+3 more").
- **Do/Don't:** do group options with `role="group"`; don't build a custom select for 3 options (use radio group or segmented control).

#### CMP-Checkbox, CMP-RadioGroup, CMP-Switch, CMP-SegmentedControl

- **Checkbox:** 20 px box (hit area 44 including label), checked (check icon), indeterminate (dash icon, `aria-checked="mixed"`), label right. Group in `fieldset`. A single checkbox is for consent or agreement; a list of independent options uses a checkbox group.
- **RadioGroup:** 20 px; arrow keys move and select; roving tabindex (`Tab` enters the group on the checked item); a default selection only when one is genuinely the safe default.
- **Switch:** immediate-effect binary setting (notifications, visibility). Anatomy: track 40 by 24, thumb, label on the left, on/off text (not color only: the label "On"/"Off" or check/dash glyph in thumb). `role="switch"` with `aria-checked`. Never used in a form that has a Save button (use checkbox there): a switch saves immediately and shows a save indicator.
- **SegmentedControl:** 2 to 5 mutually exclusive views (List, Board). Implemented as radio group or tabs depending on semantics (filters: radio; views that change content: `aria-pressed` buttons or tabs). Keyboard arrows.
- **Do/Don't:** do state both on and off in the label ("Email me about new jobs"); don't use a switch for an action ("Delete").

#### CMP-Slider, CMP-DatePicker, CMP-TimePicker, CMP-DateRangePicker

- **Slider:** single or range (salary, years of experience); always paired with a numeric input for precision; native `input type="range"` styling or ARIA slider with `aria-valuetext` (formatted "$80,000"); `Left/Right/Up/Down` step, `PageUp/PageDown` big step, `Home/End` bounds; thumb target 44.
- **DatePicker:** a text input accepting typed dates in the locale format with a format hint ("DD/MM/YYYY") plus a calendar popup button; calendar is a dialog with a grid (`role="grid"`), month/year selectors, today and clear; arrows move by day, `PageUp/PageDown` month, `Shift PageUp/PageDown` year, `Home/End` week start/end; min and max dates disable days with `aria-disabled` and reason; month and year pickers are lists, not 100-year scrolling. Dates are stored as ISO dates (date-only fields are never converted through time zones).
- **TimePicker:** typed input with locale 12/24 hour; step list (15 minutes default) popup; always shows the time zone for events (abbreviation and the IANA name on hover), defaulting to the viewer's zone with the event's zone also shown.
- **DateRangePicker:** two linked inputs plus one calendar showing two months on desktop, one on phone; presets (Last 7 days, Last 30 days, This quarter) as a list; invalid range (end before start) shows an error and is not auto-corrected silently.
- **Do/Don't:** do accept "present" for work-history end dates via a "I currently work here" checkbox, not a magic date; don't use a three-dropdown date of birth unless the age is the only data needed (use month and year selectors).

#### CMP-FileDropzone

See `03` section 13 for behaviour. Anatomy: drop area (dashed `--ts-border-control`), "Choose files" button, accepted types and size, file list with per-file status (queued, uploading with ProgressBar, scanning, ready, error with Retry, removed), remove and replace buttons. The drop area is a button (keyboard and screen reader operable), and drag and drop is an enhancement only. ARIA: file list is a `<ul>` with each status text; upload progress announced at 25 percent steps; errors announced assertively. Paste of images supported in message composers.

#### CMP-RichTextEditor

- Used for job descriptions, posts, course descriptions, messages (light variant), cover letters, reviews.
- **Anatomy:** toolbar (heading, bold, italic, list ordered/unordered, link, quote, code, undo/redo, plus for posts: mention, emoji, attachment), content area, status line (word count, saved state).
- **Behaviour:** content stored as a sanitized structured document (not raw HTML); pasted content is sanitized to the allowed set (headings 2 to 4, paragraphs, lists, links, bold, italic, quote, code, images where permitted); links require `https` or `mailto`; markdown shortcuts (`#`, `-`, `1.`, `**`); autosave per `03` section 8; max length with counter.
- **Keyboard:** standard shortcuts (`Ctrl B`, `Ctrl I`, `Ctrl K` link inside the editor takes precedence over the palette only while the editor has focus; palette remains `Ctrl K` elsewhere, so the editor uses `Ctrl Shift K` for links to avoid the conflict [DER]); toolbar is a `role="toolbar"` with roving tabindex, `Tab` leaves it; `Esc` returns focus from toolbar to content; a documented shortcut to jump to the toolbar (`Alt F10`).
- **ARIA:** content area `role="textbox"` `aria-multiline="true"` labelled; toolbar buttons `aria-pressed`.
- **Don't:** allow script, iframes, inline styles or color picking (consistent look and contrast).

#### CMP-CodeEditor

- Used for coding assessments and technical challenges (ASM). **Anatomy:** language selector, editor, test/console panel, run/submit buttons, timer slot, accessibility toggle.
- **Behaviour:** monospaced `--ts-type-code`, line numbers, bracket matching, indentation helpers; `Esc` then `Tab` leaves the editor (focus trap escape, as in code editor accessibility practice) with a persistent hint; a "Plain text mode" toggle disables autocomplete, auto-close brackets and heavy tooltips for screen reader users or on request (accommodation, `04` section 11); font size follows the user's text size, adjustable 12 to 24 px; theme follows app theme; no paste/copy restrictions are implemented in the component itself (integrity rules live in ASM); run output is an `aria-live="polite"` region (not assertive) with a summary first.
- **Keyboard:** `Ctrl Enter` run, `Ctrl S` save draft; all shortcuts listed in a help dialog.
- **Do/Don't:** do keep editor reachable at 320 px width by horizontal scroll with a visible scrollbar; don't auto-run code on keypress.

#### CMP-SkillPicker, CMP-LocationPicker, CMP-RatingInput

- **SkillPicker:** MultiSelect over the platform taxonomy (MKT/PRF owns the taxonomy). Options show canonical name, aliases matched in secondary text, and category. Unknown text offers "Suggest this skill" (creates a suggestion, not a skill). Each selected skill can take a level (Beginner, Intermediate, Advanced, Expert) via a small select inside the token; level is text, not stars. Max selections set by the screen. Skill chips elsewhere render through `CMP-SkillChip` (section 7.8).
- **LocationPicker:** Combobox over a places service; modes City, Region, Country, Remote; supports "Remote (worldwide)" and "Remote (country)"; stores structured place plus display text; never asks for a street address unless the screen needs it. Accessible: results list per Combobox; map is optional and always has a text equivalent.
- **RatingInput:** 1 to 5 with text labels per value ("Poor" to "Excellent") shown on hover, focus and selection; implemented as a radio group; used for reviews. Display of a rating uses `CMP-Rating` (value and count text; stars are decorative).

### 7.4 Navigation components

#### CMP-Sidebar, CMP-NavRail, CMP-BottomTabBar, CMP-TopBar

Specified in `01_INFORMATION_ARCHITECTURE.md` section 3. Additional design-system requirements: item height 40 (44 on touch), icon 20, label `--ts-type-label`; current item `--ts-bg-selected` with 3 px bar; focus ring inset; badges `CMP-Badge`; sections announced via `aria-labelledby` on groups; collapse transition `--ts-dur-normal` width, none under reduced motion.

#### CMP-Tabs

- **Anatomy:** tab list (horizontal; scrolls with visible edge fades and keyboard-accessible arrows when overflowing), tabs (label, optional count, optional icon), indicator (2 px bottom bar plus bold label), panel.
- **Variants:** underline (page level), pill (within cards), vertical (settings on tablet, optional).
- **Behaviour:** tab changes update `?tab=` in the URL; panels are lazy loaded and keep state when switching back; unread counts in tabs follow badge rules; no more than 7 tabs, otherwise an overflow "More" menu.
- **Keyboard:** `Left/Right` move focus (automatic activation for fast panels, manual activation with `Enter`/`Space` for panels that load data), `Home/End`, `Tab` moves into the panel.
- **ARIA:** `role="tablist"`, `role="tab"` with `aria-selected`, `aria-controls`; panel `role="tabpanel"` `aria-labelledby`, `tabindex="0"` if it has no focusable first child.
- **Do/Don't:** use tabs for peers of the same object; don't use tabs for site navigation (use links).

#### CMP-Breadcrumbs, CMP-Pagination, CMP-Stepper

- **Breadcrumbs:** specified in `01` section 9.1.
- **Pagination:** `<nav aria-label="Pagination">`; anatomy: Previous, page numbers (current, first, last, neighbors, ellipsis), Next, optional page size select (25, 50, 100), result summary ("Showing 26 to 50 of 312"). Cursor-based lists show only Previous/Next and the summary of what is shown. Current page link has `aria-current="page"`; disabled ends use `aria-disabled`. Focus after page change moves to the table or list heading (programmatic), and the live region announces "Page 3 of 13". Rules for when to use pagination vs infinite scroll: `03` section 7.
- **Stepper:** wizard progress. Anatomy: ordered list of steps with state (complete with check, current with `aria-current="step"`, upcoming, error with icon), step number and title, optional "Optional" mark. Desktop: horizontal or vertical; phone: compact "Step 2 of 5: Experience" with a ProgressBar. Completed steps are links when the wizard allows returning; steps are not links when later steps depend on the current one. Text status for every step ("Complete", "Current", "Not started"), visually hidden if icons carry it.

#### CMP-Menu (dropdown menu), CMP-Accordion, CMP-SkipLink

- **Menu:** button that opens a list of actions. `role="menu"` and `menuitem` (with `menuitemcheckbox`/`menuitemradio` variants); opens on click or `Enter`/`Space`/`Down`; `Up/Down` move, `Home/End`, type-ahead, `Esc` closes and returns focus to the button, `Tab` closes. Destructive items are last, separated by a divider, styled `danger text`, and still require the confirmation policy of `03` section 9. Item max 9; longer lists become a Combobox or a dialog. Submenus are avoided; if needed at most one level and opened by `Right`.
- **Accordion:** headings with a button each (`aria-expanded`, `aria-controls`); allows multiple open by default; used for FAQs, settings groups and long forms; first item may be open by default; state not stored in URL except deep-linked FAQ items (`#faq-id`) which open and focus the target.
- **SkipLink:** first focusable element; visible on focus; text "Skip to main content"; second link "Skip to navigation" on pages with a sidebar [PROP].

#### CMP-CommandPalette, CMP-WorkspaceSwitcher

Behaviour in `01` sections 6 and 7. Visual: palette width 640 (max 92 vw), top aligned at 15 vh, `--ts-bg-raised`, elevation 3, row height 44, group headings overline, shortcut hints right aligned in `Kbd`. Switcher: listbox in a popover (desktop) or bottom sheet (phone), row height 56 with avatar, name, role chips, and badge.

### 7.5 Overlays

Selection guide (section 11 gives the full rule table): tooltip for a label, popover for rich non-modal content, menu for actions, dialog for a decision or short task, alert dialog for destructive confirmation, drawer for a detail or secondary task alongside the page, bottom sheet for the same on phone, toast for a transient result, banner for persistent system or page status.

#### CMP-Dialog

- **Anatomy:** scrim, container (max width 480 small, 640 default, 800 large; max height 90 vh), header (title h2, close button), body (scrolls), footer (actions right-aligned on desktop; stacked full-width on phone with primary on top).
- **Behaviour:** opening: focus moves to the first focusable element, or to the title (`tabindex="-1"`) when the body is long or the first control is destructive; closing returns focus to the trigger (or to a sensible element if the trigger is gone). Focus is trapped; the background is inert (`inert` attribute), page scroll locked. `Esc` and the close button close it; scrim click closes only non-destructive, non-form dialogs. A dialog with unsaved input intercepts close with the leave confirmation. Entrance: opacity plus 8 px translate, `--ts-dur-slow` (opacity only under reduced motion). On phone a Dialog becomes a full-screen sheet or bottom sheet when its content has a form or is taller than 60 percent of the viewport.
- **ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` title, `aria-describedby` for the first paragraph when it explains consequence.
- **Do/Don't:** do keep dialogs to one decision or task; don't stack dialogs (a second level is a replace, not a stack, except for confirmation of a destructive action inside); don't open a dialog on page load (except required consent or session expiry).

#### CMP-AlertDialog

- A Dialog with `role="alertdialog"` for destructive or irreversible confirmations. **Anatomy:** title states the action and object ("Delete resume "Product Manager 2026"?"), body states the consequence and whether it can be undone, footer: Cancel (secondary, initial focus) and the destructive action (danger, verb plus object: "Delete resume"). Scrim click does not close. For severe actions (delete account, delete organization, revoke API key), add a typed confirmation field ("Type DELETE" or the object name) enabled only on exact match (case-sensitive for names), plus re-authentication when required. Rules: `03` section 9.2.

#### CMP-Drawer and CMP-BottomSheet

- **Drawer:** side panel from the end edge, 400 (default) or 560 px wide, non-modal on wide screens when it shows a detail beside a list (the list stays interactive and keyboard reachable; `Esc` closes the drawer; focus moves into it on open and back to the invoking row on close), modal when it contains a form with unsaved changes. Linkable via `?open={id}`.
- **BottomSheet:** phone equivalent: rises from the bottom, handle bar (decorative), snap points 50 and 90 percent, swipe down to close (never the only close method: visible Close button), `Esc` on keyboards. Drag is an enhancement; a header action "Expand" exists for switch-access users.
- **ARIA:** modal variants as Dialog; non-modal drawer is `role="complementary"` labelled by its title.

#### CMP-Popover, CMP-Tooltip

- **Popover:** anchored panel for rich content (profile hover card, help text, filters). Opens on click/`Enter`; closes on `Esc`, outside click, or focus leaving; contents reachable by `Tab`; not opened by hover alone except profile hover cards, which also open by keyboard focus and are dismissible (`Esc`), hoverable and persistent (1.4.13). `aria-haspopup="dialog"` for non-menu content; width 240 to 360; flips to stay inside the viewport; on phone becomes a bottom sheet.
- **Tooltip:** a short text label (max 80 characters, no links, no interactive content) for an element that is focusable. Shown on hover after 500 ms and on keyboard focus after 0 ms; dismiss with `Esc`; remains while the pointer is over the tooltip; `role="tooltip"` and referenced by `aria-describedby` (not used as the sole accessible name, except icon-only buttons where it mirrors the `aria-label`). Not available on touch (information must not live only in a tooltip).

#### CMP-Toast

- **Anatomy:** icon, message (max 2 lines, 120 characters), optional action button (one), close button. Position: bottom center on phone (above tab bar), bottom start on desktop; stack max 3.
- **Behaviour:** success and info auto-dismiss after 6 seconds (pauses on hover and focus; 10 seconds when it has an action); errors that need action persist until dismissed (use Notice if the error is tied to a form); a toast is for the result of the user's own action, never for system announcements. Not used for anything the user must read to proceed (use inline notice). Undo toasts: 8 seconds with a visible countdown-free "Undo" button (no ticking timer).
- **ARIA:** container `role="region"` `aria-label="Notifications"` is not used; instead each toast is `role="status"` (polite) for success/info, `role="alert"` for errors; the live region exists in the DOM before the message is inserted. Focus is not moved to a toast. A keyboard shortcut `Alt T` focuses the toast stack so the action can be used [PROP]; and the toast action always has an alternative on the page.
- **Do/Don't:** do put the object in the message ("Resume saved"); don't toast validation errors; don't show two toasts for one event.

#### CMP-Lightbox

Image, video and document preview overlay: modal, arrows to move, `Esc` to close, zoom controls with keyboard alternatives, download, caption and alt text visible, focus trap; swipe on touch plus visible Next/Previous; pinch zoom allowed.

### 7.6 Feedback components

#### CMP-Notice (inline alert)

- **Anatomy:** status icon, title (optional), message, actions (up to 2), dismiss (optional). **Variants:** info, success, warning, danger; `compact` single-line. Matches as-built `Notice`. [SRC: apps/web/src/components/ui/Notice.tsx]
- **Behaviour:** inline notices sit directly above the content they concern. Static ones are in the reading order and not live regions. A notice added dynamically after an action uses `role="status"`; errors that block use `role="alert"`. Notices that stop a form submission appear at the top of the form with an anchor list of errors (`03` section 3.5).
- **Do/Don't:** do explain what happened, what it affects and what to do (error formula in `06` section 3); don't use a notice for marketing.

#### CMP-Banner

Page-level or app-level persistent message across the top of the content (system maintenance scheduled, offline, verification needed, trial ending, staff). Full width of the content area, one at a time per class with priority: security > outage > offline > account action > plan > announcement. Dismissible only when non-critical (dismissal stored per user per banner id, reappears if the condition changes). Role `status` unless critical (`alert`). Height 40 to 56; stacks at most 2.

#### CMP-EmptyState, CMP-ErrorState

- **Anatomy:** illustration (optional, 120 to 240), heading (h2 or h3), explanation (one or two sentences), primary action, optional secondary action or link. Formula and copy rules in `06` section 4; state catalogue in `03` section 12. Matches the as-built `EmptyState` and `LoadError`. [SRC: components/ui/EmptyState.tsx, LoadError.tsx]
- **Behaviour:** empty states are specific to cause: first-use, no results, nothing to do, cleared, permission (each different copy and action); error states offer a retry that re-runs only the failed request, plus a way to get help when retry fails twice.

#### CMP-OfflineIndicator, CMP-SaveIndicator, CMP-SyncStatus

- **OfflineIndicator:** persistent banner "You're offline. Changes will sync when you're back." in the shell; clears itself (announced politely "Back online").
- **SaveIndicator:** text status near the title of editors: "Saved", "Saving...", "Couldn't save. Retry", "Saved on this device. Will sync". Updates are polite announcements, debounced so "Saving" is not announced; only failures and the first "Saved" after an error are announced. Icon plus text; time since save in a tooltip ("Saved 2 minutes ago").
- **SyncStatus:** for offline queues: count of pending changes with a button "View pending", states: synced, syncing, paused (offline), conflict (needs choice), failed (needs action).

### 7.7 Data display components

#### CMP-Card

- **Anatomy:** container (`--ts-bg-surface`, `--ts-border-default`, `radius-md`, elevation 1), optional media, header (title h3/h4, subtitle, actions), body, footer. As-built `Card`.
- **Variants:** static, interactive (the whole card is one link, an overlay link on the title with `::after` stretched, not a nested-anchor wrapper), selectable (checkbox in the top corner, selected state `--ts-bg-selected` plus 2 px `--ts-action-bg` border), compact.
- **Behaviour:** one primary click target per card; secondary actions (bookmark, menu) are separate focusable controls above the stretched link; hover raises border color not elevation; skeleton mirrors the layout.
- **ARIA:** cards in a grid are a list (`<ul>`/`<li>`) when they are peers; the card title is a heading at the correct level.
- **Don't:** nest a button inside a link, nest interactive cards, or let cards become different heights in one row without alignment of actions at the bottom (use grid rows with footer pinned).

#### CMP-List and CMP-ListItem

- **Anatomy:** leading (avatar, icon, checkbox, drag handle), content (primary text, secondary text, meta), trailing (status, value, chevron, actions). Heights 56 (44 compact), up to 2 lines of secondary text.
- **Variants:** navigational (whole row is a link, chevron trailing), selectable, with-actions (swipe actions on phone are an enhancement; every swipe action has a visible alternative in the item menu), reorderable.
- **ARIA:** `<ul>` or `role="list"`; selectable lists use `listbox` only when it is a widget; otherwise checkboxes.

#### CMP-DataTable

The default for dense, comparable, multi-column data (candidates, applications, students, tickets, audit logs).

- **Anatomy:** toolbar (search, filters, column menu, density, export, bulk action bar), header row (sticky), body rows, footer (pagination and summary), empty/loading/error regions. Column parts: header cell with label, sort button and indicator, resize handle (optional), menu.
- **Columns:** at most 8 visible by default on desktop; a primary column (identity) is frozen on horizontal scroll; numeric columns right-aligned with `tabular-nums`; dates in a consistent short format with full timestamp in a tooltip; status columns use `CMP-StatusPill`; actions column last (kebab menu with at most 5 items; the single most common action is visible as a text button).
- **Selection:** checkbox column first; header checkbox selects all on page (indeterminate when partial); "Select all N" offers selecting all results across pages in the bulk bar (see `03` section 5).
- **Sorting:** one active sort by default, multi-sort with Shift for power users in admin; sort state in the URL; header `aria-sort="ascending|descending|none"`; the sort control is a button inside the `th`, announcing "Sort by Name, ascending".
- **Row interaction:** row click opens detail only when there is also a visible link in the row (the primary cell link); rows are not `role="button"`. Row hover `--ts-bg-hover`; selected `--ts-bg-selected` plus left 3 px bar.
- **Responsive:** below 768 px a table transforms: option A (default) card list: each row becomes a card with the primary column as title, 3 key fields, status, and a chevron; option B (for data that needs comparison) horizontal scroll with frozen first column and a visible scroll hint. The screen spec states which. Transformation preserves sort and filter controls (moved into a filter sheet). Column set on phone is declared per screen.
- **Semantics:** native `<table>`, `<caption>` (visually hidden if redundant with the heading), `<th scope="col|row">`; when virtualized or CSS grid is used, ARIA `role="grid"` is added only if cell navigation is implemented (`Arrow` keys between cells, `Enter` to edit); otherwise it stays a table. Row count and column count are announced (`aria-rowcount`, `aria-colcount`) for virtualized tables.
- **Keyboard:** `Tab` through interactive cells; if grid mode: arrows, `Home/End`, `Ctrl Home/End`, `Space` select row, `Enter` open.
- **States:** loading (skeleton rows, 8 rows), empty (zero results versus empty dataset), partial error (one column failed: cell shows "Couldn't load", table remains), refreshing (rows stay, subtle top progress), stale (timestamp "Updated 3 minutes ago" with Refresh).
- **Performance:** server pagination above 100 rows; virtualization above 500 visible rows; table never loads more than 200 rows on a phone page.
- **Do/Don't:** do keep column widths stable between loads; don't hide critical actions only in hover; don't truncate the primary identifier; don't put charts in cells except sparklines (with text value).

#### CMP-DescriptionList, CMP-StatTile, CMP-Timeline

- **DescriptionList:** `<dl>` of term/value pairs; stacked on phone, two-column grid on desktop with term column 30 percent; missing values show "Not provided" in muted text, not blank or a dash alone.
- **StatTile:** anatomy: label, value (`h3` size, tabular), delta (icon plus signed value plus period; color supplementary: text and arrow indicate direction), sparkline optional, link to the source report. Value formats: counts with thousands separators, percentages with up to 1 decimal, durations "3 d 4 h". Never shows a delta without a comparison period; never shows percentage with small denominators without the count ("33% (1 of 3)"). While loading: skeleton of the same size. When data is unavailable: "No data yet" with reason, not 0.
- **Timeline:** vertical list of events (time, icon, actor, description, optional detail). Used for application history, verification trail, audit, order. Newest first for activity feeds, oldest first for processes. Each item is a list item with `<time datetime>`; groups by day with sticky date headings; "Load older" button (not infinite) for audit.

#### CMP-Chart

Types: line, bar (vertical, horizontal, stacked, grouped), donut, sparkline, funnel, heatmap, radar (skills only), scatter (rare). Rules and specs in section 8.3.

#### CMP-Calendar

Month, week, day, agenda. Used for interviews, events, mentoring availability, assignment deadlines. Anatomy: header (range title, previous/next, Today, view switcher), grid, event blocks (title, time, status), side mini-calendar (desktop). Keyboard: grid navigation per DatePicker; `Enter` opens the event; events are links; on phone the default view is agenda (list by day) with a month strip; time zones shown on every event (viewer's zone with the event's zone in the detail); overlapping events lay out side by side up to 3 then "+N more". Drag to reschedule is an enhancement with a menu alternative (Reschedule). Color encodes calendar or type only with a text label and icon alongside.

#### CMP-KanbanBoard

Used for ATS pipelines, application trackers, task boards. Detailed in `03` section 6 and REFSCR-07. Anatomy: column header (name, count, WIP hint, add), cards (`CMP-CandidateCard` or generic), column footer. Keyboard drag alternatives: focus a card, `Space` to pick up, arrows to move between columns/positions, `Space` to drop, `Esc` to cancel, announced via live region ("Moved Sam Chen to Interview, position 2 of 6"); "Move to" menu on every card as a non-drag path.

#### CMP-TreeView

For hierarchical structures (course outline, folder, department tree, skills taxonomy). `role="tree"`, `treeitem`, `aria-expanded`, `aria-level`; arrows: Up/Down, Right expand/enter, Left collapse/parent, `Home/End`, `*` expand siblings, type-ahead; lazy loading children with a status row.

### 7.8 Domain composites

| Component                              | Anatomy                                                                                                                                                                                                           | Rules                                                                                                                                                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CMP-EvidenceCard`                     | Title, type icon (work, project, certificate, assessment, recommendation), issuer or organization, dates, `VerificationSeal`, skills (up to 3 `SkillChip` then "+N"), actions menu                                | Verified and self-reported variants differ by seal presence and a text label "Self-reported" on unverified; owner view shows verification progress; viewer view hides private fields                                                                   |
| `CMP-SkillChip`                        | Skill name, optional level text, optional evidence count with a verified tick                                                                                                                                     | Level is text ("Advanced"), not dots only; verified-by-evidence shows seal icon with `aria-label`; clicking opens skill detail popover                                                                                                                 |
| `CMP-JobCard`                          | Title (link), company logo and name, location and work mode, salary (if disclosed; the text "Not disclosed" is not shown), posted date, match explanation chip (if AIC), bookmark button, status (Applied, Saved) | Card is one stretched link; bookmark is a separate toggle IconButton with `aria-pressed`; salary shows currency and period; "Easy apply" style labels are not used unless the apply path is genuinely short                                            |
| `CMP-CourseCard`                       | Thumbnail 16:9, title, instructor, rating (value and count), duration, level, price or "Free" or "Included", progress bar when enrolled                                                                           | Price shows the currency and tax note per region; enrolled state replaces price with progress and "Continue"                                                                                                                                           |
| `CMP-CandidateCard`                    | Avatar, name, headline, location, top skills, verification summary, stage, last activity, match explanation, quick actions                                                                                        | Blind-review mode (hide name, photo, school, graduation year) is a card variant driven by org setting; hidden fields show "Hidden for fair review"                                                                                                     |
| `CMP-ApplicationTracker`               | Horizontal stepper of the stages the candidate may see, current stage, date entered, next action text                                                                                                             | Stage names are the employer's, mapped to candidate-facing names; rejection and withdrawal end states have their own compassionate copy                                                                                                                |
| `CMP-ScoreBar` and Scorecard           | Criteria rows (label, rating control, notes), overall recommendation (Strong yes, Yes, No, Strong no) as radio group, submit                                                                                      | Scores shown with text; hidden from other interviewers until the viewer submits (per ATS rule); autosave drafts                                                                                                                                        |
| `CMP-MessageThread` and `CMP-Composer` | Messages grouped by sender and day, timestamps, delivery and read state (text), attachments, typing indicator; composer with rich text light, attach, send                                                        | Section REFSCR-08; list is `role="log"` with polite live updates; new messages while scrolled up show a "New messages" pill; composer keeps drafts                                                                                                     |
| `CMP-NotificationItem`                 | Icon (type), title, summary, time, unread dot plus bold, actions (mark read, mute type)                                                                                                                           | Read state by icon and text, not weight alone; click navigates and marks read                                                                                                                                                                          |
| `CMP-MediaPlayer`                      | Video or audio surface, controls bar, captions, transcript panel, speed, quality, chapters, notes                                                                                                                 | Behavior in `03` section 14                                                                                                                                                                                                                            |
| `CMP-QuestionRenderer`                 | Stem, media, answer controls (single choice, multi choice, short text, long text, code, file, matching, ordering, numeric), flag for review, question navigator                                                   | Used by ASM and LRN quizzes; ARIA and accommodations per `04` section 11                                                                                                                                                                               |
| `CMP-Timer`                            | Remaining time (text), optional visual ring, warnings at configured thresholds                                                                                                                                    | Does not announce every second; announces at start, at 50 percent where set, at 10, 5, 1 minute and at 30 seconds, then at end; a "Hide timer" toggle exists (visual only, announcements remain); extra time accommodation adjusts the displayed total |
| `CMP-FilterBar`                        | Search field, filter chips, "Filters" button (opens panel/sheet), applied filter summary, "Clear all", saved views menu, result count live region                                                                 | Section 4 of `03`                                                                                                                                                                                                                                      |
| `CMP-BulkActionBar`                    | Selected count, actions, "Select all N", "Clear selection"                                                                                                                                                        | Section 5 of `03`                                                                                                                                                                                                                                      |
| `CMP-ConsentBanner`                    | Plain-language purpose, category toggles (necessary always on, analytics, personalization), Accept all, Reject all (equal prominence), Customize                                                                  | Reject is as easy as accept (same size and styling weight); stored consent has a version; re-asked when purposes change; copy in `06` section 6                                                                                                        |
| `CMP-MatchExplanation`                 | "Why this match" popover: top matching factors, each with evidence link, and missing factors; confidence in words ("Strong", "Good", "Partial"); AI marker                                                        | Always shows that the score is a suggestion, lists inputs used, never exposes protected attributes; "This isn't right" feedback action                                                                                                                 |
| `CMP-EntitlementGate`                  | Lock icon, plan name needed, what you get, upgrade or contact admin button                                                                                                                                        | Inline in place of the feature, not a full-page wall when partial value can be shown                                                                                                                                                                   |
| `CMP-AIMessage`                        | AI marker (sparkles plus "AI"), streaming text, sources/citations, actions (copy, regenerate, helpful, not helpful), "AI can be wrong" note on first use                                                          | See `03` section 16                                                                                                                                                                                                                                    |
| `CMP-Rubric`                           | Criteria by level matrix with descriptors, selected cell, points                                                                                                                                                  | Grid semantics, keyboard cell selection, text for selected level                                                                                                                                                                                       |
| `CMP-CertificateView`                  | Document-like surface (serif title), recipient, issuer, date, credential id, QR and URL for verification, download PDF, share                                                                                     | Always has the verification URL in text; PDF is accessible tagged PDF [PROP]                                                                                                                                                                           |

## 8. Data-display patterns

### 8.1 Choosing the pattern

| Data shape                                                                               | Pattern                                    | Why                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Many records, 4 or more comparable attributes, user sorts and filters, users act in bulk | `CMP-DataTable`                            | Scanning and comparing across rows                        |
| Few records (under 12), rich per-item content (media, description)                       | Card grid                                  | Each item is a unit                                       |
| Records with 1 to 3 attributes, mostly navigational                                      | `CMP-List`                                 | Fast scanning, works at every width                       |
| One record with many attributes                                                          | `CMP-DescriptionList` in a card per topic  | Reading, not comparing                                    |
| Process over time                                                                        | `CMP-Timeline` or `CMP-ApplicationTracker` | Sequence and dates                                        |
| Records in stages the user moves                                                         | `CMP-KanbanBoard` with a table alternative | Workflow, with list view for access and bulk              |
| Trend, composition, distribution, comparison                                             | `CMP-Chart`                                | Pattern recognition; always with a data table alternative |
| Single number with context                                                               | `CMP-StatTile`                             | At-a-glance status                                        |

Rule `NFR-DSY-018`: every board, chart and calendar view has an equivalent list or table view reachable from the same screen (view switcher), because they are the accessible and the low-bandwidth path.

### 8.2 Card, list and table rules

- Card grids: 1 column below 640, 2 from 640, 3 from 1024 (content area, not viewport), 4 only in the wide content area for compact cards (course thumbnails). Gap `--ts-space-4` phone, `--ts-space-6` desktop. Cards in a row share a height; footers align.
- Lists: dividers between items (`--ts-border-subtle`), no zebra striping. Group headers sticky when the list scrolls.
- Tables: header sticky under the page header (`--ts-z-sticky`); zebra striping off by default (hover and selection states carry row identity); horizontal rules `--ts-border-subtle`; at most one row action menu per row; row actions that apply to many rows live in the bulk bar.
- Counts: every list and table shows how many items match ("312 candidates") in a live region that updates after filters change.
- Sort indicators: arrow icon plus `aria-sort`; unsorted columns show a muted double-arrow on hover and focus only.
- Empty and loading states are mandatory per `03` section 12, and are the same height as the loaded state's minimum to avoid layout shift.
- Truncation, dates, money and numbers: dates "12 Mar 2026" in tables (locale aware), relative time ("2 days ago") for activity with absolute time in `<time>` and a tooltip; money with currency code or symbol according to locale and an explicit period ("per year"); numbers with locale grouping; units after the number with a thin space.

### 8.3 Charts

Charts exist to answer a question; the title states the question or the finding ("Applications by stage, last 30 days").

**Anatomy:** title (h3), subtitle (period, filters applied), legend, plot, axes with labels and units, tooltip, optional annotation, "View as table" toggle, download (PNG and CSV where permitted), source and "Updated {time}" line.

**Rules:**

- `NFR-DSY-019` Color is never the only differentiator: each series has a distinct marker shape (section 3.4) or line dash, and direct labels at line ends or bar ends where space allows; the legend is also a toggle (`aria-pressed`) that hides a series.
- `NFR-DSY-020` Non-text contrast: marks and axis lines are at least 3:1 against the chart background (the palette in section 3.4 satisfies this). Gridlines are decorative (`--ts-border-subtle`) and never carry information.
- `NFR-DSY-021` Every chart has a text alternative: a one-sentence summary above or in `aria-describedby` ("Applications rose from 120 to 180 between 1 and 30 March; Interview is the largest stage"), and a data table (the "View as table" view) with the same numbers; the SVG is `role="img"` with `aria-labelledby` the title and summary, and the table is the navigable alternative. Interactive points are reachable by keyboard: arrow keys move between data points, the tooltip content is announced.
- `NFR-DSY-022` Bar charts start at zero; line charts may truncate the axis only with an explicit axis break marker and note; no 3D, no dual-axis charts, no pie charts with more than 5 slices (use donut with at most 5 plus "Other", or a bar chart), no truncation of long labels without an alternative.
- `NFR-DSY-023` Small samples: when a rate is based on fewer than 5 items (or the privacy threshold in `OD-UX-11`), show the count instead of a percentage, or suppress with "Not enough data". For cohort and demographic breakdowns the minimum group size is the privacy threshold (default 5 [PROP]).
- Time axes use the user's time zone and say so; missing data shows a gap (not zero) with a legend entry "No data".
- Sparklines: no axes, a text value adjacent, never the sole carrier.
- Sequential scales use lightness steps and also numeric labels in cells (heatmaps print the value in each cell at sizes above 40 px).
- Animation: lines draw in at `--ts-dur-slow` once on first load, skipped under reduced motion; no re-animation on filter change (values tween at `--ts-dur-normal` or jump under reduced motion).
- Dashboards: at most 8 tiles above the fold on desktop and 4 on phone; the first tile answers the user's primary question for the role.
- Loading: chart-shaped skeleton of the plot area. Error: the chart region shows a `CMP-ErrorState` compact with Retry; other charts stay.

## 9. Form patterns

Behavioral timing for validation lives in `03` section 3. Visual and structural rules here.

- Single column; label above; 20 px gap between fields (desktop), 16 (phone); sections separated by `h2`/`h3` and 32 to 48 px gap; maximum form width `--ts-content-form` 640.
- Action bar: primary action left-aligned on desktop forms (reading order puts it after the last field), secondary (Cancel) after it; on phone, primary full width at the bottom, sticky above the on-screen keyboard if the form is long. Destructive form actions (Delete) are separated to the opposite side or into a danger zone section at the bottom of a settings page, with the section titled "Delete or deactivate".
- Required and optional: all fields are required unless labeled "Optional". Group of mutually dependent fields shows a legend.
- Help text appears below the label; format examples are in the help ("Example: 2024-05-31"), not in placeholders. Placeholders are only for non-essential examples at muted color and are never the sole instruction.
- Error message: below the field, danger icon plus text, 14 px; text tells how to fix it. Error summary at the top of the form after a failed submit (section 10 and `03` section 3.5).
- Inline success: only for checks the user is waiting on (username available), a check icon plus text.
- Long forms: grouped into sections with a sticky section nav on desktop and a Stepper (wizard) when more than 7 fields per logical stage or more than 3 stages; each stage valid on its own.
- Read-only view versus edit: view and edit are different modes of one screen when editing is rare (profile sections: view with "Edit" button opening inline or a dialog) and an always-on form for settings; edit in place keeps focus on the field edited and returns it to the Edit button on Save or Cancel.
- Sensitive fields (government ids, bank details, health): masked by default with Show, never autofilled into non-matching fields, `autocomplete="off"` where appropriate, never logged; a lock icon plus short explanation of why it is requested and who sees it.
- Defaults: opt-in for marketing and data sharing is off by default; privacy-preserving options are pre-selected (`04` section 8, `06` section 6).

## 10. Feedback patterns

| Need                                                        | Component                                         | Timing                                | Persistence                 | Announced as                     |
| ----------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- | --------------------------- | -------------------------------- |
| Result of the user's own quick action (saved, copied, sent) | Toast                                             | Immediately after server confirmation | 6 s                         | Polite                           |
| Result needing the user to act (failed save with retry)     | Notice inline near the object, plus SaveIndicator | Immediately                           | Until resolved              | Assertive if blocking            |
| Form submission failed                                      | Error summary at top, field errors                | On submit                             | Until fixed                 | Assertive once, focus to summary |
| Section or page level problem (cannot load)                 | `CMP-ErrorState` in the region                    | When request fails after retry policy | Until retried               | Polite                           |
| System condition (offline, maintenance)                     | Banner                                            | Immediately                           | While condition holds       | Polite (critical: assertive)     |
| New content arrived (messages, jobs)                        | Inline pill "N new"                               | On arrival                            | Until clicked               | Polite, rate-limited             |
| Background task progress (upload, export, import)           | Progress in place and a task tray entry           | While running                         | Until dismissed or complete | Polite at 25 percent steps       |
| Achievement and recognition (REP)                           | Inline celebration card, non-blocking             | On event                              | Dismissible                 | Polite                           |

Rules: no more than one toast at a time per event; no feedback that blocks the page except dialogs for decisions; success is shown only after confirmation unless the optimistic rule in `03` section 8.4 is met; every error has a retry or a path to help; feedback text follows `06`.

## 11. Overlay selection rules

| Situation                                      | Use                                          | Never                                                       |
| ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| Label for an icon or truncated text            | Tooltip                                      | Tooltip for essential information or on touch only elements |
| Extra info, filters, mini-profile, help        | Popover                                      | Popover containing a long form                              |
| List of actions                                | Menu                                         | Menu with more than 9 items, or navigation                  |
| Choose one option from a short list on phone   | Bottom sheet list                            | Native-looking custom wheel                                 |
| Decision or small task (rename, invite, share) | Dialog                                       | A dialog with more than one decision                        |
| Destructive or irreversible confirm            | AlertDialog                                  | Confirmation for undoable actions                           |
| View or edit a record next to a list           | Drawer (desktop), full page or sheet (phone) | Drawer over a drawer                                        |
| Multi-step task (apply, create job, import)    | Full-page wizard (`focus` shell)             | A dialog wizard on phone                                    |
| Transient result                               | Toast                                        | Toast for errors that need action                           |
| Persistent page-level status                   | Banner or Notice                             | Toast                                                       |
| Media or document preview                      | Lightbox                                     |                                                             |

Stacking: at most one modal layer at a time; a destructive confirmation may appear over a modal; popovers inside a modal render at `--ts-z-popover`. Focus and scroll lock behavior as in `CMP-Dialog`. `NFR-DSY-024`.

## 12. Loading skeletons

- Use skeletons for content regions that load structured data and take more than 300 ms; show nothing before 300 ms (prevents flash); keep skeleton visible at least 400 ms once shown. Spinners only inside buttons or for unstructured waits under 2 seconds.
- Skeleton shapes mirror the final layout (text lines at 100, 90 and 60 percent widths, avatar circles, card blocks, table rows with column placeholders); heights equal the loaded heights to prevent layout shift (CLS under 0.1, target 0.05).
- Color `--ts-bg-subtle` on `--ts-bg-surface` (1.2:1, decorative); shimmer gradient moves left to right over 1.4 s infinite; under reduced motion static with no shimmer. A skeleton container has `aria-busy="true"` and a visually hidden "Loading {region}" status; skeleton shapes are `aria-hidden`.
- After 8 seconds of loading, add the text "This is taking longer than usual" with a Retry; after the request timeout (15 seconds default), show the error state.
- Optimistic partial: where cached data exists, show cached content with a subtle "Updating" indicator instead of a skeleton (stale-while-revalidate), and mark it stale if older than the screen's freshness limit.
- Progressive loading order: page chrome (instant), header and primary content (first), secondary regions (independent skeletons that resolve independently), below-the-fold regions (on demand).
- Images and video: reserved aspect ratio box with dominant color; lazy loaded below the fold; `decoding="async"`.
- Route transitions: keep the old page visible until the new route's critical data arrives up to 300 ms, then show the new route's skeleton.

## 13. Consolidated design-system rules

| Id          | Rule                                                                                  | Test                |
| ----------- | ------------------------------------------------------------------------------------- | ------------------- |
| NFR-DSY-001 | No raw colors, spacing literals, z-index, durations or rgba in feature code           | Lint                |
| NFR-DSY-002 | Non-outcome stages render neutral or info; candidate-facing rejection renders neutral | Visual review       |
| NFR-DSY-003 | Font sizes in rem; usable at 200 percent text zoom and 400 percent reflow             | Browser zoom test   |
| NFR-DSY-004 | Minimum text size 12 px; inputs 16 px on touch                                        | CSS audit           |
| NFR-DSY-005 | Prose line length 45 to 80 characters                                                 | Visual              |
| NFR-DSY-006 | Weight is never the sole emphasis between statuses                                    | Review              |
| NFR-DSY-007 | Text spacing overrides do not clip content                                            | Bookmarklet test    |
| NFR-DSY-008 | Self-hosted fonts with metric-adjusted fallbacks, CLS under 0.01 from swap            | Performance test    |
| NFR-DSY-009 | Entrances and exits animate only opacity and transform                                | CSS lint            |
| NFR-DSY-010 | Reduced motion removes transforms, shimmer, spinners, auto-advance                    | Emulated media test |
| NFR-DSY-011 | No auto motion over 5 s without a control; no flashing over 3 per second              | Review              |
| NFR-DSY-012 | Motion is tied to cause                                                               | Review              |
| NFR-DSY-013 | z-index only via tokens; one portal root                                              | Lint                |
| NFR-DSY-014 | Theme applied before first paint                                                      | No flash test       |
| NFR-DSY-015 | Density never reduces targets below 24 px (pointer) or 44 px (coarse)                 | Target size test    |
| NFR-DSY-016 | Directional icons mirror in RTL, others do not                                        | RTL visual test     |
| NFR-DSY-017 | Icons follow the vocabulary; sparkles reserved for AI                                 | Review              |
| NFR-DSY-018 | Every board, chart, calendar has a list or table equivalent                           | Screen spec check   |
| NFR-DSY-019 | Charts: marker shape plus color plus direct label; legend toggles                     | Visual and keyboard |
| NFR-DSY-020 | Chart marks and axes at least 3:1                                                     | Contrast tool       |
| NFR-DSY-021 | Charts have summary text and a data table alternative                                 | Axe plus manual     |
| NFR-DSY-022 | Bar charts start at zero; no 3D, dual-axis; pie at most 5 slices                      | Review              |
| NFR-DSY-023 | Suppress small-sample percentages below threshold                                     | Data test           |
| NFR-DSY-024 | One modal layer at a time (except destructive confirm)                                | Interaction test    |

## 14. Conflicts, open decisions, risks

| Id        | Item                                                                                   | Detail                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-DSY-01  | Motion durations                                                                       | Legacy design doc says 120/200/320 ms; `tokens.ts` has 150/250/400. As-built values retained. [SRC: docs/experience/UI_UX_DESIGN_SYSTEM.md §3 vs packages/ui/src/tokens.ts] |
| C-DSY-02  | Radii                                                                                  | Legacy lists 6/10/16/50%; `tokens.ts` lacks radii. Legacy values adopted.                                                                                                   |
| C-DSY-03  | Legacy doc says "typography scale xs to 4xl"; `tokens.ts` adds fluid 5xl and 6xl       | Both retained; 5xl and 6xl for marketing only                                                                                                                               |
| OD-DSY-01 | Keep as-built motion durations or legacy ones?                                         | Default: as-built. Decides: design lead. Blocks: motion tokens                                                                                                              |
| OD-DSY-02 | Icon library: continue custom `Icons.tsx` or adopt a Lucide-compatible set             | Default: adopt compatible set, keep custom for domain icons. Decides: design lead                                                                                           |
| OD-DSY-03 | Dark mode image dimming default                                                        | Default on at 8 percent. Decides: design lead                                                                                                                               |
| OD-UX-11  | Minimum group size for analytics breakdowns                                            | Default 5 [PROP]. Decides: privacy officer. Blocks: ANL, INS reports                                                                                                        |
| RSK-UX-05 | Token drift between CSS and TypeScript                                                 | Generate both from one source (section 2.2)                                                                                                                                 |
| RSK-UX-06 | Spruce brand green equals success green; users confuse "primary action" with "success" | Success always has check icon and text; primary actions never use the check icon                                                                                            |
| RSK-UX-07 | Component catalogue grows faster than the team can maintain                            | Promotion rule: second meaningful reuse; each component entry owns tests                                                                                                    |

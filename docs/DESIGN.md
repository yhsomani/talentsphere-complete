# TalentSphere Design System

## Philosophy
Modern · Minimal · Professional · Trustworthy

The design must convey credibility (this is where careers are built) while remaining
approachable and fast for daily active use. No dark patterns. No attention traps.

---

## Color Palette

### Primary Brand
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4F46E5` (Indigo 600) | CTA buttons, active nav, key accents |
| `primary-hover` | `#4338CA` (Indigo 700) | Button hover state |
| `primary-light` | `#EEF2FF` (Indigo 50) | Highlighted backgrounds, tags |

### Neutrals
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F8FAFC` (Slate 50) | Page background |
| `card` | `#FFFFFF` | Card, modal, sidebar background |
| `text` | `#0F172A` (Slate 900) | Primary body text |
| `text-muted` | `#64748B` (Slate 500) | Secondary text, labels |
| `border` | `#E2E8F0` (Slate 200) | Card borders, dividers |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#10B981` (Emerald 500) | Success states, verified badges |
| `warning` | `#F59E0B` (Amber 500) | Pending states, warnings |
| `error` | `#EF4444` (Red 500) | Error messages, destructive actions |
| `info` | `#3B82F6` (Blue 500) | Informational callouts |

---

## Typography

### Font Family
- **Primary**: `Inter` (via Google Fonts or system font stack)
- **Mono**: `JetBrains Mono` or `Fira Code` (code blocks, skills tags)
- **Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| `display` | 36–48px | 800 | Hero section headlines |
| `h1` | 28–32px | 700 | Page titles |
| `h2` | 22–24px | 700 | Section headings |
| `h3` | 18–20px | 600 | Card titles |
| `body` | 14–16px | 400 | Standard content |
| `body-sm` | 12–13px | 400 | Labels, metadata |
| `caption` | 11px | 500 | Tags, timestamps, badges |

---

## Spacing
- Base unit: `4px`
- Scale: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96`
- Card padding: `24px` (desktop), `16px` (mobile)
- Section gap: `24–32px`

---

## Border Radius
| Context | Value |
|---------|-------|
| Cards | `16px` (`rounded-2xl`) |
| Buttons | `12px` (`rounded-xl`) |
| Inputs | `12px` (`rounded-xl`) |
| Badges / Tags | `8px` (`rounded-lg`) |
| Avatars | `9999px` (`rounded-full`) |
| Small chips | `6px` (`rounded-md`) |

---

## Shadows
| Name | Value | Usage |
|------|-------|-------|
| `xs` | `0 1px 2px rgba(15,23,42,0.05)` | Subtle card lift |
| `sm` | `0 4px 6px -1px rgba(15,23,42,0.07)` | Standard card |
| `md` | `0 10px 15px -3px rgba(15,23,42,0.08)` | Modal, dropdowns |
| `lg` | `0 20px 25px -5px rgba(15,23,42,0.10)` | Elevated elements |

---

## Components

### Button
- **Primary**: `bg-indigo-600 text-white` — apply, submit, primary CTA
- **Secondary**: `bg-slate-100 text-slate-800` — cancel, secondary actions
- **Outline**: `border border-slate-300 bg-white` — ghost/stroke variant
- **Danger**: `bg-rose-600 text-white` — delete, destructive
- **Ghost**: `text-slate-600 hover:bg-slate-100` — inline actions

Sizes: `sm (28px)`, `md (36px)`, `lg (44px)`

All buttons must have: loading state, disabled state, keyboard focus ring.

### Cards
- `bg-white rounded-2xl border border-slate-200 shadow-sm`
- Padding: `p-6` (24px)
- Hover state for clickable cards: `hover:shadow-md hover:border-slate-300 transition-all`

### Inputs
- `bg-white border border-slate-300 rounded-xl px-4 py-2.5`
- Focus: `ring-2 ring-indigo-500/20 border-indigo-400`
- Error: `border-red-400 ring-red-500/20`
- Label: always above input, `text-sm font-medium text-slate-700`

### Badges
- Skill tags: `bg-indigo-50 text-indigo-700 border border-indigo-100`
- Status: context color (green=active, amber=pending, red=rejected)
- XP/Level: `bg-amber-50 text-amber-700`

### Navigation (Sidebar)
- Width: `256px` (desktop), full-screen drawer (mobile)
- Active item: left border accent + `bg-indigo-50/80 text-indigo-700`
- Hover: `hover:bg-slate-50 hover:text-slate-900`

---

## UX Requirements

### Responsive Breakpoints
| Name | Min Width | Context |
|------|-----------|---------|
| `sm` | 375px | Small phones (min support) |
| `md` | 768px | Tablets, large phones |
| `lg` | 1024px | Laptop, desktop (sidebar shows) |
| `xl` | 1280px | Large desktop |

### Required States (Every Feature)
- ✅ **Loading state** — Skeleton placeholders, not spinners where possible
- ✅ **Empty state** — Illustrated callout with action CTA
- ✅ **Error state** — Red alert with retry option + error message
- ✅ **Success state** — Green toast or inline confirmation
- ✅ **Hover / Focus** — Visible keyboard focus rings (WCAG 2.1 AA)
- ✅ **Disabled** — `opacity-50 cursor-not-allowed`

### Accessibility
- All interactive elements must be keyboard accessible
- `aria-label` on icon-only buttons
- Color is never the only indicator (always add icon/text)
- Minimum touch target: `44×44px`
- Color contrast: at least 4.5:1 for body text (WCAG AA)
- All form inputs must have `<label>` elements

### Animation
- Transitions: `duration-150` for interactions, `duration-200` for panels
- Easing: `ease-out` for enter, `ease-in` for exit
- No jarring animations; subtle transforms (`scale-[0.98]` active states)

---

## Layout Patterns

### Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│  [Sidebar 256px] │ [Header sticky]                   │
│                  │─────────────────────────────────  │
│  Logo            │  [Page Content]                   │
│  Navigation      │                                   │
│  User XP         │                                   │
│                  │                                   │
└─────────────────────────────────────────────────────┘
```

### Card Grid
```
[Card 1] [Card 2] [Card 3]    (3-up, lg+)
[Card 1] [Card 2]              (2-up, md)
[Card 1]                       (1-up, sm)
```

### Form Layout
```
Label
[Input]
Error message (if any)
```

---

*Design System v1.0 — TalentSphere*

# TalentSphere Design System — Aether Slate & Orchid

## 1. Design Philosophy
**Aether Slate / Orchid** — Dark-First · High-Contrast · Tactile · Micro-Bordered · Ambient

TalentSphere's interface is engineered for serious technical professionals, ambitious learners, and precision recruiters. It avoids toy-like aesthetics in favor of a sleek, dark-first workspace with high-contrast typography, glassmorphic panels, and subtle ambient glows.

---

## 2. Color System & Design Tokens

### Core Neutral Palette (Obsidian & Slate)
| Token | Tailwind Value | Hex / Color | Usage |
|---|---|---|---|
| `bg-primary` | `slate-950` | `#020617` | Main canvas / page background |
| `bg-surface` | `slate-900/60` | `#0f172a` (60% alpha) | Cards, modals, drawers, sidebar (`backdrop-blur-xl`) |
| `bg-surface-elevated` | `slate-800/70` | `#1e293b` (70% alpha) | Hover states, active list items, tooltips |
| `border-subtle` | `slate-800/80` | `#1e293b` (80% alpha) | Card boundaries, dividers, table borders |
| `border-strong` | `slate-700` | `#334155` | Input borders, active element strokes |
| `text-primary` | `slate-100` | `#f1f5f9` | Primary headings, candidate names, job titles |
| `text-muted` | `slate-400` | `#94a3b8` | Subtext, labels, metadata, timestamps |
| `text-faint` | `slate-500` | `#64748b` | Placeholders, inactive icons, breadcrumb dividers |

### Accent Glows & Semantic Colors
| Token | Tailored Class | Color Accent | Semantics & Domain Usage |
|---|---|---|---|
| `accent-primary` | `indigo-500` / `orchid` | `#6366f1` / `#818cf8` | Primary CTAs, active sidebar pills, brand accents |
| `accent-success` | `emerald-400` / `glow-emerald` | `#34d399` | Verified credentials, solved challenges, XP progress, hires |
| `accent-challenge`| `purple-400` / `glow-purple` | `#c084fc` | Code Arena problems, algorithmic scores, difficulty tags |
| `accent-warning` | `amber-400` / `glow-amber` | `#fbbf24` | Review pending, leaderboard gold tier, expiring licenses |
| `accent-danger`  | `rose-400` / `glow-rose` | `#f43f5e` | Rejections, destructive deletions, test failure flags |

---

## 3. Typography Hierarchy

### Font Families
- **Interface & Display**: `Geist Sans` (variable geometric font designed for readability)
- **Code & Monospace**: `Geist Mono` / `JetBrains Mono` (code editor, diffs, terminal outputs, skill tags)
- **System Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Type Scale
| Level | Font Size | Line Height | Weight | Application |
|---|---|---|---|---|
| **Display** | 36px – 48px | 1.1 | 800 (Extrabold) | Landing hero headline, milestone screens |
| **H1** | 28px – 32px | 1.2 | 700 (Bold) | Page titles (`/jobs`, `/dashboard`, `/challenges`) |
| **H2** | 22px – 24px | 1.3 | 700 (Bold) | Section headers, modal titles, card groups |
| **H3** | 18px – 20px | 1.4 | 600 (Semibold) | Card titles, requisition headlines |
| **Body** | 14px – 16px | 1.5 | 400 (Regular) | General content, job descriptions, curriculum notes |
| **Body Small** | 12px – 13px | 1.4 | 400 / 500 | Form labels, helper captions, metadata |
| **Micro / Tag**| 10px – 11px | 1.3 | 600 (Semibold) | Badges, status pills, XP chips, tech tags |

---

## 4. Component Primitive Suite (`src/components/ui/index.tsx`)

Every component adheres to consistent variant states, focus rings, hover lifts, and accessibility standards:

### 1. Button
- **Primary**: `bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20`
- **Secondary**: `bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60`
- **Outline**: `border border-slate-700 hover:bg-slate-800/60 text-slate-200`
- **Danger**: `bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20`
- **Ghost**: `text-slate-400 hover:text-slate-100 hover:bg-slate-800/40`
- **Sizes**: `sm (32px)`, `md (40px)`, `lg (48px)`
- **Mandatory States**: `loading` (spinner + disabled), `disabled` (`opacity-50 cursor-not-allowed`), `focus-visible` ring.

### 2. Card
- Dark glass surface: `bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-sm`
- Interactive hover: `hover:border-slate-700 hover:shadow-md hover:shadow-slate-950/40 transition-all duration-150`

### 3. Input & Select
- Dark input field: `bg-slate-900/80 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5`
- Focus: `focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500`
- Error: `border-rose-500 focus:ring-rose-500/30`
- Label: uppercase tracking or clean semibold above input with required asterisk.

### 4. Badge / Tag
- Rounded pill (`rounded-full px-2.5 py-0.5 text-xs font-semibold`)
- Variants:
  - `emerald`: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
  - `indigo`: `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`
  - `purple`: `bg-purple-500/10 text-purple-400 border border-purple-500/20`
  - `amber`: `bg-amber-500/10 text-amber-400 border border-amber-500/20`
  - `rose`: `bg-rose-500/10 text-rose-400 border border-rose-500/20`

### 5. ProgressBar
- Ambient progress track with gradient indicator (`bg-gradient-to-r from-indigo-500 to-emerald-400`) and level markers.

### 6. EmptyState
- Elevated dark panel with icon container, headline, descriptive copy, and primary action CTA button.

---

## 5. Domain-Specific UI Patterns

### Recruiter 7-Stage Kanban Board (`src/app/jobs/[id]/applications`)
- 7 horizontal swimlanes: `Submitted` → `Screening` → `Review` → `Interview` → `Evaluation` → `Offer` → `Rejected`.
- Candidate card with applicant name, match %, applied date, and one-click quick actions.
- Slide-over evaluation drawer with full resume PDF preview and Scorecard evaluation rubric.

### Interview Scorecards Rubric (`src/features/applications/components/RecruiterPipelineBoard.tsx`)
- 1–10 numeric evaluation sliders across Technical, Communication, Culture Fit, and Problem Solving.
- Decision pills: `Strong Yes`, `Yes`, `No`, `Strong No`.
- Strengths and growth tags, qualitative feedback box, and historical scorecard review stream.

### HackerRank-Grade Code Arena (`src/app/challenges/[id]`)
- Two-column split layout: Left side problem description & I/O examples; Right side Monaco-style dark code editor.
- Bottom drawer for test case execution with input, output, expected output, and stdout log views.
- Success modal with XP celebration burst and dynamic level progress update.

### Immersive LMS Course Player (`src/app/courses/[id]/learn`)
- Centered video/lesson player with auto-play next lesson action.
- Collapsible curriculum sidebar drawer showing sections, completed checkmarks, and lesson duration.
- Bottom action bar with "Complete Lesson" toggle and dynamic XP credit trigger.

---

## 6. Accessibility & Responsiveness (WCAG 2.2 AA)
- **Keyboard Navigation**: Full Tab/Shift+Tab traversal with visible `ring-2 ring-indigo-400` focus outlines.
- **Color Contrast**: All body text maintains minimum 4.5:1 contrast against `#020617` and `#0f172a`.
- **Touch Targets**: Minimum 44×44px hit targets on all mobile buttons and links.
- **Responsive Breakpoints**:
  - `sm (375px)`: Single-column stacked layouts, mobile bottom/slide navigation drawer.
  - `md (768px)`: Two-column card grids, condensed filter bar.
  - `lg (1024px)`: Fixed 256px tactile sidebar, sticky header, full multi-column views.
  - `xl (1280px+)`: Wide desktop layout with expanded split-pane workspaces.

---

*Authoritative Design System v2.0.0 — Reconciled with Live Application Tokens.*

# Legacy UI/UX Design System (prior v6.0) merged and reconciled

Doc ID: UI-LEG-02 · Owner: Design System Lead (with Accessibility Lead) · Version 1.0 · Status: Draft for Review · Relates: `DESIGN_SYSTEM.md` (UI-01), `ACCESSIBILITY_SPEC.md`, `PROGRESSIVE_UX_AND_FEEDBACK.md`, `SCREEN_REGISTRY.md`, `UX_REVIEW_FIXES.md`, `../28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.md` (OPEN-50), `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/docs/experience/UI_UX_DESIGN_SYSTEM.md` (v6.0)

## 0. Frame

**Nothing is implemented.** The prior document's own banner said: sections 1 to 9 and the screen families are *intended* (a design target); its state list and micro-interactions were not verified against any running app. Here every item is a requirement candidate. Where the target `DESIGN_SYSTEM.md` is more detailed or different, **both values are kept** in the tables below and the choice is an open decision (OPEN-LGA-16).

## 1. Design intent (legacy; carried over)

The product should feel: trustworthy; calm; intelligent without being theatrical; dense enough for professionals; progressive rather than overwhelming; mobile-native; accessible.

Target comparison: `DESIGN_SYSTEM.md` section 1 (principles DP-1..DP-4, for example touch first and keyboard complete). The adjectives "calm" and "intelligent without being theatrical" and "dense enough for professionals" are not stated as DPs in the target and are kept here as tone requirements for copy and visual design.

## 2. Core rules (legacy; carried over)

- Mobile-first PWA composition.
- Progressive disclosure.
- Honest loading.
- Actionable empty states.
- Error recovery.
- Consistent keyboard/focus behaviour.
- Dark mode first-class.
- Motion communicates state.
- No critical information encoded only through colour.

Target comparison: covered by DP-* and the accessibility spec; "honest loading" and "actionable empty states" should be traced to `PROGRESSIVE_UX_AND_FEEDBACK.md`.

## 3. Design tokens (legacy vs target)

Legacy rule: use **one generated token source**; feature code never hard-codes raw values. (The prior attempt kept tokens in a shared UI package and told agents not to hard-code colours or spacing.) Target equivalent: `@ts/ui` as the single source (`DESIGN_SYSTEM.md` DP-3 and section 12).

| Token area | Legacy value | Target value (`DESIGN_SYSTEM.md`) | Status |
|---|---|---|---|
| Spacing grid | 4 px | 4 px base (`--ts-space-1: 4px` and scale) | Same |
| Colour | Semantic colour roles | Semantic roles with contrast ratios per token | Same intent |
| Typography | Scale `xs` to `4xl` | Defined in target section on typography (check scale names) | Verify names |
| Radii | 6 / 10 / 16 / 50% | 6 / 10 / 16 px, pill 999 px, full 50% | Compatible (target adds pill) |
| Motion durations | 120 / 200 / 320 ms ("initial tokens") | instant 80 / fast 150 / base 240 / slow 400 ms (max) | **Different.** Target values govern the draft; legacy values kept as a recorded alternative. |
| Focus tokens | Independent from brand tokens | `--ts-focus` never removed | Same |
| z-index | Layers owned centrally | not stated as a token family in the sections checked | **Gap.** Add a central z-index scale to the token list. |
| Theme | Existing "Aura" token family as the starting design language; all raw values from token definitions | No "Aura" family; target palette defined from scratch | **Conflict of origin.** "Aura" is a prior-attempt name; do not assume its values are available. OPEN-LGA-16. |

## 4. Component architecture (legacy; carried over)

Atoms, molecules, organisms, templates, feature pages. **Promotion rule:** a component stays feature-local until its **second meaningful reuse**, then is promoted to the shared library. Target: `DESIGN_SYSTEM.md` section 12 (`@ts/ui` ownership). The explicit second-reuse promotion rule is not stated in the target and should be added to the contribution guide for the shared UI package.

## 5. Canonical UI states (legacy vs target)

Legacy list (15 interaction states): IDLE, HOVER, FOCUS, PRESSED, LOADING, SUCCESS, ERROR, EMPTY, DISABLED, VALIDATION, PARTIAL, OFFLINE, SYNCING, PERMISSION_DENIED, RESTRICTED.

Legacy domain-lifecycle labels (8): PENDING, PROCESSING, VERIFIED, REJECTED, EXPIRED, REVOKED, DISPUTED, ARCHIVED.

Target vocabulary (`DESIGN_SYSTEM.md` section 6): default, hover, focus-visible, active/pressed, disabled (with reason), loading, error, success, read-only, selected, offline-pending.

| Legacy state | Target counterpart | Note |
|---|---|---|
| IDLE | default | rename |
| HOVER, FOCUS, PRESSED, LOADING, SUCCESS, ERROR, DISABLED | same | |
| EMPTY | not a component state in the target list | Add as a **view state** ("actionable empty state"), see section 2 |
| VALIDATION | not listed | Add (field/form validation state; `ErrorSummary` exists) |
| PARTIAL | not listed | Add (partial data or partial success) |
| OFFLINE, SYNCING | offline-pending | Target merges the two; keep a distinct "syncing" state for background sync visibility |
| PERMISSION_DENIED, RESTRICTED | not listed | Add (distinguish "not allowed" from "hidden by consent/purpose") |
| Domain lifecycle labels | evidence rungs, SM-* states | The target uses state-machine-specific labels; the legacy labels are a **generic badge vocabulary** and may be kept as the cross-domain status chip set |

Decision: OPEN-LGA-16.

## 6. Micro-interaction contract (legacy; carried over)

```text
Trigger -> User action -> State change -> Immediate feedback -> Result -> Next best action
```

Interactions for which behaviour must be defined: save/bookmark; autosave; upload/processing; assessment timer/submission; streaming AI; application submission; matching explanation; messaging; notification; offline sync; destructive actions.

The prior attempt also kept a **100-pattern micro-interaction register** in its root SSOT (Appendix D, patterns M-01..M-100 according to the target's own crosswalk). That register is in the protected SSOT and is tracked by `UX_PATTERN_SOURCE_CROSSWALK.md` (OPEN-50); this merge does not copy it.

## 7. Accessibility (legacy; carried over)

Target WCAG 2.2 AA. Required: keyboard navigation; visible focus; logical focus management; semantic HTML; labels and descriptions; screen-reader status messages; accessible dialogs; accessible tables; reduced motion; sufficient touch-target size; zoom/reflow support. Legacy rule BR-204: **accessibility is a release gate; WCAG 2.2 AA mandatory.** Target: `ACCESSIBILITY_SPEC.md`; GOAL-06.

## 8. UX acceptance checklist (legacy; carried over)

Every major feature needs: happy path; loading; empty; error; offline/reconnect where applicable; permission denied; destructive-action safety; keyboard/focus; reduced-motion behaviour.

## 9. Responsive behaviour (legacy; carried over)

| Class | Legacy behaviour |
|---|---|
| Mobile | Bottom navigation, bottom sheets, stacked cards, compact action bars |
| Tablet | Adaptive two-pane layouts where content warrants |
| Desktop | Sidebar navigation, denser tables, multi-column dashboards |

Rule: **do not simply scale a desktop layout down.** Target: sidebar (>= lg), icon rail (md), bottom nav (< md) from one nav manifest (`NAVIGATION_ARCHITECTURE.md`); consistent. Legacy BR-203 adds: mobile-first application must keep feature parity with desktop.

## 10. Core screen families (legacy; 22)

Landing; Auth; Onboarding; Dashboard; Profile; Evidence portfolio; Skill explorer; Goal/readiness; Learning catalog; Course player; Challenge/assessment; Job search/detail; Application tracker; Recruiter search/pipeline; Interview; Messages; Notifications; Communities; Institution admin; Admin/moderation; Settings/privacy; Career workspace.

Target: `SCREEN_REGISTRY.md` holds the detailed SCR-* registry. Families that deserve an explicit check there because the legacy lists them as first-class: **Skill explorer**, **Goal/readiness** and **Career workspace** (these correspond to legacy features F-84, F-91 and F-85/F-95 and to the career-graph question in OPEN-LGA-11), and **Communities** (legacy F-55).

## 11. Open items

| ID | Item |
|---|---|
| OPEN-LGA-16 | Choose motion durations, add missing states (EMPTY, VALIDATION, PARTIAL, PERMISSION_DENIED, RESTRICTED, SYNCING), add a z-index scale, decide whether any "Aura" values are reused, add the second-reuse promotion rule. Owner: Design System Lead. |

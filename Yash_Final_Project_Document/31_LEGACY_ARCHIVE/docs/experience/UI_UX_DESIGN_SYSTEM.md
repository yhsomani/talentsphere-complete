# TalentSphere — UI_UX_DESIGN_SYSTEM.md v6.0

> **Status: design target.** Sections 1 to 9 and the screen families are intended. The built screens are the files in `apps/web/src/pages/`, and the built tokens are in `packages/ui`. The state list (section 5) and micro-interactions (section 6) are not verified against the running app.

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

The 100-pattern micro-interaction register is canonical in [`SSOT.md`](../../../../SSOT.md), Appendix D. The copy that was here has been removed to keep one authority per topic.

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

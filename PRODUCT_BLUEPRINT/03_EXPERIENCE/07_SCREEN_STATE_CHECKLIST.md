# 07 Screen and State Checklist

Status: intended standard. This file gives module authors three things: (1) a checklist every screen must pass before it is called complete, (2) a template for a screen specification, and (3) ten fully worked reference screens that show the level of detail expected. The ten reference screens use ids `REFSCR-01` to `REFSCR-10`; they are cross-module patterns and are **not** entries in any module's `SCR-` register (module screens use `SCR-<MOD>-nnn` in `02_MODULES/`). Where a module screen follows a reference screen it cites it ("Pattern: REFSCR-02") and only specifies the differences. Rule ids use area code `SCR` (`NFR-SCR-nnn`).

How this connects: layout and navigation rules come from `01`, tokens and components from `02`, behaviors from `03`, accessibility from `04`, responsive and offline from `05`, copy from `06`.

## 1. Using this file

1. Write the screen spec with the template in section 3 inside the module's screen inventory (`CONVENTIONS` §8 item 7), expanding the inventory row where a screen is complex.
2. Walk the checklist in section 2 and mark every item Pass, N/A with reason, or a linked open item. N/A without a reason is a fail.
3. A screen is "specified" when all sections of the template are filled and the checklist has no unmarked items; "ready to build" when its acceptance criteria are traceable to `FR-` ids.
4. A screen copied from a reference screen keeps that screen's structure and states unless the spec states the deviation.

## 2. Per-screen checklist

Each item has an id (`CHK-nn`), the requirement, and the evidence expected in the screen spec.

### 2.1 Purpose and structure

| Id | Requirement | Evidence |
|---|---|---|
| CHK-01 | The screen has one stated purpose, one primary user task, and the role(s) it serves | Purpose line; primary action named |
| CHK-02 | Route, workspace, shell chrome (`app`, `pub`, `focus`) and parent route (for Back and breadcrumb) are stated and fit `01` namespaces | Route table row |
| CHK-03 | Page header defined: h1 text, status, at most one primary action, secondary actions, overflow | Header region spec |
| CHK-04 | Layout described for phone, tablet and desktop, with region order equal to reading order | Three wireframes or a table plus one wireframe per class |
| CHK-05 | Every region lists the components used (from `02`), with variants; any new component is proposed through the promotion rule | Region and component table |
| CHK-06 | Document title, `h1`, and focus target on arrival are stated | Title format; focus target |

### 2.2 Data

| Id | Requirement | Evidence |
|---|---|---|
| CHK-07 | Each displayed field names its source entity (`ENT-`), format, null display ("Not provided"), and privacy class | Data table |
| CHK-08 | Freshness: how current the data must be, how it refreshes (on load, interval, real time, manual), and stale behavior | Data table column |
| CHK-09 | Pagination or windowing rule (page size, cursor, virtualization) and maximum items | Data section |
| CHK-10 | Sorting, filtering and search options with defaults and URL parameters | Filters section |
| CHK-11 | Derived values state their formula and denominator, and small-sample suppression applies | Formula lines |

### 2.3 States (all must be addressed; mark N/A with reason)

| Id | State | Requirement |
|---|---|---|
| CHK-12 | Loading (initial) | Skeleton matching layout; height-stable |
| CHK-13 | Loading (refresh, partial) | Existing content retained; per-region skeletons |
| CHK-14 | Empty: first use | Copy per `06` section 4, one primary action |
| CHK-15 | Empty: no results / filtered | Clear-filters path |
| CHK-16 | Success | Inline or page; next best action |
| CHK-17 | Error: recoverable | Retry, preserved input |
| CHK-18 | Error: not recoverable / not found | Copy and exits |
| CHK-19 | Partial failure | Region-level failure, operation summaries |
| CHK-20 | Offline | Offline class per action (R, W, O, D), cached marker |
| CHK-21 | Permission denied | In-shell state; no leak of existence for private resources |
| CHK-22 | Rate limited | Notice and recovery |
| CHK-23 | Maintenance and degraded | Banner behavior, disabled actions |
| CHK-24 | Session expired | Resume in place |
| CHK-25 | Entitlement locked | `EntitlementGate` where the feature is plan-gated |
| CHK-26 | Conflict / stale | Where edits or concurrent changes occur |
| CHK-27 | Read-only / archived | Where objects can be archived or locked |
| CHK-28 | Long content and extremes | Very long names, 0, 1, many, 10,000 items, RTL, 40 percent text expansion |

### 2.4 Permissions and security

| Id | Requirement | Evidence |
|---|---|---|
| CHK-29 | Permission matrix: role x capability for view, create, edit, delete, export, each special action | Table |
| CHK-30 | Server enforces every permission; the UI hides or disables per `01` `NFR-IAX-010` | Statement and negative test |
| CHK-31 | Data classification of every field (public, member, private, sensitive, special category) and what each role sees | Data table |
| CHK-32 | Abuse controls: rate limits, bulk caps, enumeration resistance, audit logging for sensitive reads and writes | Security section |
| CHK-33 | Sensitive actions follow confirmation tiers (`03` section 9.2) and step-up where needed | Action table |

### 2.5 Interaction

| Id | Requirement | Evidence |
|---|---|---|
| CHK-34 | Every action: trigger, pending state, success result, failure result, idempotency, undo or confirm tier | Action table |
| CHK-35 | Validation timing per `03` section 3; messages from `06` section 3 | Form table |
| CHK-36 | Autosave class (8.1) and conflict behavior | Interaction section |
| CHK-37 | Drag and drop has non-drag alternative; bulk selection behaves per `03` section 5 | Where applicable |
| CHK-38 | Real-time behavior and degradation per `03` section 11 | Where applicable |
| CHK-39 | Leave-page protection where dirty | Where applicable |
| CHK-40 | Notifications triggered or consumed by the screen (template names) | Notifications line |

### 2.6 Responsive and PWA

| Id | Requirement | Evidence |
|---|---|---|
| CHK-41 | Phone, tablet, desktop behavior stated; table-to-card or scroll choice stated | Layout section |
| CHK-42 | Touch targets at least 44 px (coarse), gestures have alternatives | Statement |
| CHK-43 | Offline class and queueing behavior; sync conflicts | Offline column |
| CHK-44 | Data saver behavior (what is dropped) | Statement |
| CHK-45 | Deep link and `returnTo` behavior; share target or push entry if any | Routing section |

### 2.7 Accessibility

| Id | Requirement | Evidence |
|---|---|---|
| CHK-46 | Landmarks, heading outline, and focus order described | A11y section |
| CHK-47 | Keyboard map for every custom widget on the screen | A11y section |
| CHK-48 | Focus management for opens, closes, adds, removes, route arrival | A11y section |
| CHK-49 | Live region announcements listed with text and politeness | A11y section |
| CHK-50 | Non-color cues for every status and chart; text alternatives for charts | A11y section |
| CHK-51 | Reduced motion and flashing behavior | Statement |
| CHK-52 | Accommodations affecting the screen (assessments, interviews) | Where applicable |
| CHK-53 | The component acceptance checklist (`04` section 12) passes | Test note |

### 2.8 Content and analytics

| Id | Requirement | Evidence |
|---|---|---|
| CHK-54 | All copy follows `06`; key strings listed with catalog keys | Copy table |
| CHK-55 | Terms match the glossary | Lint |
| CHK-56 | Analytics events listed with names, properties, privacy class, trigger | Analytics table |
| CHK-57 | No personal data in analytics properties or URLs | Statement |
| CHK-58 | Acceptance criteria: at least three Given/When/Then including one negative case, traceable to `FR-` ids | Acceptance section |

### 2.9 Scoring

A screen is **Specified** when CHK-01 to CHK-58 are all Pass or N/A with reason. `NFR-SCR-001` states: no screen enters build planning with an unresolved item. A reviewer may spot-check by choosing five items at random.

## 3. Screen specification template

Copy this block into a module's screen inventory for each screen that is more than a trivial variation. Sections in order; none omitted ("n/a, reason").

```markdown
#### SCR-XXX-000 Screen name

**Pattern:** REFSCR-nn or none
**Route:** `/path/{id}` (workspace: personal | employer | institution | enterprise | console | public)
**Parent route (Back / breadcrumb):** `/parent`
**Roles:** XXX (view, act), YYY (view)
**Shell chrome:** app | pub | focus
**Purpose and primary task:** one sentence each
**Entry points:** nav item, link, notification, deep link, command palette
**Exits and next best actions:** list

##### Layout (phone / tablet / desktop)
Wireframe in text for each class, or one wireframe plus a table of deltas.

##### Regions and components
| Region | Components (CMP-) | Variants and notes |

##### Data
| Field or region | Entity (ENT-) | Format | Null display | Class | Freshness |
Pagination, sort, filters, search parameters (URL keys).

##### Actions
| Action | Trigger | Permission | Pending | Success | Failure | Undo or confirm tier | Idempotency | Offline class |

##### States
| State | Behavior (layout, copy key, actions) | for each of CHK-12 to CHK-28 or N/A with reason

##### Permissions
| Capability | Role: allowed / denied / scoped | Server rule (BR-) |

##### Real time and notifications
Updates received; notifications triggered (template names, opt-out class).

##### Analytics events
| Event | Trigger | Properties | Class |

##### Accessibility
Landmarks and headings; keyboard map; focus management; live announcements; non-color cues; reduced motion; accommodations.

##### Copy
| Key | Text | Notes |

##### Acceptance criteria
- Given / When / Then (positive)
- Given / When / Then (permission)
- Given / When / Then (negative or failure)
- Given / When / Then (accessibility)

##### Open items
OD-, RSK- links
```

### 3.1 Analytics event conventions

UI analytics events are not domain events (`EVT-`); they describe interface interactions for product analytics and are named `ui.{area}.{element}.{action}` in snake case where `action` is one of `view`, `click`, `submit`, `change`, `open`, `close`, `dismiss`, `select`, `scroll_end`, `error`, `retry`, `complete`, `abandon`. Examples: `ui.dashboard.next_action.click`, `ui.job_search.filter.change`.

Common properties on every event (set once by the shell): `screen_id`, `route_template` (with `{id}` placeholders, never the real ids), `workspace_type`, `role_set` (codes), `viewport_class`, `theme`, `app_version`, `session_id` (pseudonymous), `locale`. Never include: names, emails, phone, free text, search text, resume content, message content, exact salary, demographic data, raw ids of other people. Search query text is recorded only as a hash plus length and the count of filters unless the user has opted in to improvement analytics. Events respect consent: analytics beyond strictly necessary are off until consent (`06` section 6). Events are sampled for high-frequency types (`scroll_end`, `change` on sliders).

`NFR-SCR-002` Every screen emits at least `ui.{screen}.view` once per arrival and an `error` event on each error state shown.

### 3.2 Test id and copy key conventions

`data-testid` pattern: `{screen}-{region}-{element}` (`job-search-filters-clear`). Copy keys: `{module}.{screen}.{element}.{variant}` (`job.search.empty.noResults.title`).


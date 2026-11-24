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

## 4. Reference screens

Conventions in the wireframes: `[ ]` button, `( )` radio, `[x]` checked box, `[v]` select, `< >` link, `[====    ]` progress, `[ Skeleton ]` loading placeholder, `|` and `+--+` containers, `...` more content. Widths are indicative: desktop content area 1280 px wide, phone 360 px. Role codes per `CONVENTIONS` §5. Domain data names are examples of entities owned by other modules (`planned` where not yet specified).

### REFSCR-01 Dashboard (candidate home)

**Pattern for:** the Home screen of every workspace (employer, institution, enterprise and console homes reuse regions with different tiles).
**Route:** `/dashboard` (personal workspace). **Parent:** none (root). **Roles:** CAN, STD, INS, MNT, FRL (the Home for the personal workspace). **Chrome:** `app`.
**Purpose:** show what needs the user's attention today and the next best action toward their goal. **Primary task:** act on the top "needs attention" item. **Document title:** "Home - Personal - TalentSphere". **Focus on arrival:** `h1` "Home".

**Desktop wireframe (content area, 12 columns)**

```text
+------------------------------------------------------------------------------------------+
| Home                                                              [ + New v ]            |
| Good morning, Dana. Here's what needs you today.                                         |
+------------------------------------------------------------------------------------------+
| NEEDS YOUR ATTENTION (cols 1-8)                      | PROFILE STRENGTH (cols 9-12)      |
| [!] Confirm interview with Northwind  Tue 10:00 CET  | [========    ] 68 percent         |
|     [ Choose a time ]                                | 3 of 5 steps done                 |
| [i] Acme asked for a work sample      Due 14 Mar     |  [x] Add work history            |
|     [ Upload sample ]                                |  [x] Add 5 skills                |
| [i] Degree check needs one more detail               |  [ ] Verify one credential       |
|     [ Fix now ]                      < See all 5 >   |  [ ] Set job alerts   [ ] ...    |
+------------------------------------------------------+-----------------------------------+
| APPLICATIONS (cols 1-6)              | CONTINUE LEARNING (cols 7-12)                     |
| 4 active   1 interview   0 offers    | [thumb] Data analysis foundations                 |
| Applied > In review > Interview      | Module 3 of 8   [===========      ] 42 percent    |
| 2         1           1              | [ Continue lesson 3.2 ]                           |
| < View applications >                |                                                   |
+--------------------------------------+---------------------------------------------------+
| RECOMMENDED FOR YOU (cols 1-12)                     AI  < Why these? >                   |
| [JobCard] [JobCard] [JobCard] [JobCard]       Match: Strong skills match, 2 of 3 required |
| < See all recommended jobs >                                                             |
+------------------------------------------------------------------------------------------+
| VERIFICATION AND EVIDENCE (cols 1-6)       | CAREER GOAL (cols 7-12)                     |
| 6 verified, 2 pending, 1 needs action      | Goal: Data analyst   Readiness: Good        |
| < Open evidence >                          | Next: Learn SQL window functions < Plan >   |
+--------------------------------------------+---------------------------------------------+
```

**Phone wireframe (single column, bottom tab bar visible)**

```text
+------------------------------+
| Home                  [?] [B]|   app bar: title, search, bell (badge)
+------------------------------+
| Good morning, Dana           |
| NEEDS YOUR ATTENTION (3)     |
| [!] Confirm interview...     |
|     [ Choose a time ]        |
| [i] Acme asked for a sample  |
| < See all 5 >                |
| ---------------------------- |
| Profile strength 68 percent  |
| [=========      ] 3 of 5     |
| < Finish setup >             |
| ---------------------------- |
| Continue learning            |
| Data analysis foundations    |
| [ Continue lesson 3.2 ]      |
| ---------------------------- |
| Applications  4 active ...   |
| Recommended for you  AI      |
| [JobCard] (horizontal list)  |
+------------------------------+
| Home  Jobs  Learn  Msgs  Me  |
+------------------------------+
```

**Regions and components**

| Region | Components | Notes |
|---|---|---|
| Page header | h1, greeting paragraph (time of day from device clock), `CMP-Menu` "New" | Greeting uses the first name only when the user set one; otherwise "Welcome back" |
| Needs your attention | `CMP-List` of `CMP-NotificationItem`-style rows with inline primary action, `CMP-Notice` icon per severity | Max 3 shown, then "See all N" to `/notifications?filter=actions`; ordered by due time then severity; excludes informational items |
| Profile strength | `CMP-ProgressBar` with text, `CMP-List` of checklist items (links) | Appears until all done or dismissed; the percentage derives from the checklist, not from a hidden score |
| Applications | `CMP-StatTile` set (active, interview, offers) and a mini stage bar | Counts link to `/applications?status=...` |
| Continue learning | `CMP-CourseCard` compact with `CMP-ProgressBar` | Shows the most recently active enrollment; hidden if none |
| Recommended jobs | `CMP-JobCard` x4 (carousel replaced by a grid: 4 columns desktop, horizontal scroll list phone), `CMP-MatchExplanation`, AI marker | Hidden with a "Turn on recommendations" empty state if personalization off |
| Verification and evidence | `CMP-StatTile` trio and link | Counts from EVD; "needs action" count also appears in nav badge |
| Career goal | Goal summary and next step | From AIC and MKT; hidden if no goal, replaced by "Set a goal" card |

**Data**

| Region | Source | Freshness | Pagination | Privacy |
|---|---|---|---|---|
| Needs attention | Aggregated tasks from JOB, INT, EVD, BGV, LRN (planned) | Real time (push) with refresh on focus; stale after 60 s | Top 3 | Private |
| Profile strength | PRF checklist | On load | n/a | Private |
| Applications | JOB application counts by stage | On load, refresh on focus | n/a | Private |
| Continue learning | LRN enrollment progress | On load | n/a | Private |
| Recommended jobs | AIC recommendations (planned) | Cached 1 hour | 4 | Private; features used listed in "Why these?" |
| Evidence | EVD counts | On load | n/a | Private |

Each region loads independently; the page is interactive when the header and the first region resolve.

**Actions**

| Action | Permission | Pending | Success | Failure | Undo/confirm | Offline class |
|---|---|---|---|---|---|---|
| Inline task action (Choose a time) | CAN | Button loading | Item changes to "Confirmed", leaves list after 5 s with undo | Notice in row with Retry | Tier 0 (undo) | O |
| Dismiss a checklist item | CAN | none | Item removed | Toast failure | Tier 0 | W |
| Bookmark job | CAN | optimistic | Icon filled | Revert and toast | Tier 0 | W |
| "Why these?" | CAN | popover | Explanation | Compact error | none | R |
| Hide recommendations | CAN | | Region replaced by empty state | | Tier 0 | W |

**States**

| State | Behavior |
|---|---|
| Loading | Regional skeletons; no spinner; header text appears immediately |
| First run (new user) | Needs attention replaced by the onboarding checklist (`03` section 2); other regions show first-use empty states with one action each; no empty charts |
| Empty "needs attention" | "You're all caught up." with next best action (Find jobs) |
| Region error | Compact `ErrorState` in that region only with Retry; others unaffected |
| Offline | Cached tiles with "Saved 12 minutes ago"; inline actions `aria-disabled` "Needs a connection"; banner global |
| Restricted account | Single notice explaining restriction and allowed actions; other regions hidden (`01` as-built restricted nav) |
| Stale | "Updated 20 minutes ago. Refresh" at the top of Needs attention if over limit |
| Permission | Not applicable (own data); regions for capabilities not enabled are absent |
| Long content | Titles clamp to 2 lines; company names to 1 line with title attribute |
| 0/1/many | 0 interviews hides stage; 1 shows singular copy via ICU; counts over 99 show 99+ |
| RTL and expansion | Layout uses logical properties; progress bars mirror |

**Permissions:** CAN family: all regions own data only. STD adds a Campus tile (deadlines, drives). INS adds Studio tile (to grade, unanswered). MNT adds Sessions tile. FRL adds Contracts tile. Server returns only the user's data; tile visibility from the manifest.

**Notifications:** none triggered; consumes real-time task updates (`03` section 11: no reordering, "N new" pill).

**Analytics:** `ui.dashboard.view`; `ui.dashboard.task.click` (task_type); `ui.dashboard.task.complete` (task_type); `ui.dashboard.recommendation.click` (position); `ui.dashboard.recommendation_why.open`; `ui.dashboard.checklist_item.click` (item_key); `ui.dashboard.region.error` (region_key). No job ids of other users; job ids are not personal and allowed as `job_ref` hashed.

**Accessibility:** landmarks: `main` with `h1` Home; each tile is a `section` with `aria-labelledby` its `h2`; task list is a `ul`; inline action buttons named "Choose a time for interview with Northwind"; progress bar `role="progressbar"` with text; recommendation grid is a list; "New" pill live region polite; keyboard order follows visual order; focus after completing an inline task moves to the next task or the region heading; no autoplay; the carousel-like list on phone is a native horizontal scroller with visible scroll buttons for keyboard users. Reduced motion: no tile entrance animation.

**Copy keys (sample):** `shell.dashboard.title` "Home"; `shell.dashboard.attention.empty` "You're all caught up."; `shell.dashboard.rec.why` "Why these?".

**Acceptance criteria**

- Given a candidate with one interview to confirm, when Home loads, then that task is first in Needs your attention with a "Choose a time" button and the nav Interviews badge shows 1.
- Given the recommendations service times out, when Home loads, then only the recommendations region shows an error with Retry and every other region renders normally.
- Given the user is offline, when they open Home, then cached tiles show "Saved {time}", task buttons are `aria-disabled` with the reason, and no spinner remains.
- Given a screen reader user completes a task inline, when the item leaves the list, then focus lands on the next task and "Interview confirmed" is announced politely once.
- Negative: given a suspended account, when Home loads, then no recommendation or application regions are shown and the restriction notice lists allowed actions.

### REFSCR-02 List with filters (job search)

**Pattern for:** every searchable list (courses, candidates, mentors, gigs, events, students, applications). **Route:** `/jobs` (public and signed-in; query parameters below). **Parent:** none. **Roles:** GUE, CAN and others (read); actions needing sign-in prompt sign-in. **Chrome:** `pub` (signed out) or `app`. **Document title:** "Find jobs - TalentSphere" (with query: "{query} jobs - TalentSphere").

**Desktop wireframe**

```text
+----------------------------------------------------------------------------------------------+
| Find jobs                                                                                    |
| [ Search jobs, skills or companies...                    ] [ City or Remote  v ] [ Search ]  |
+----------------------------------------------------------------------------------------------+
| FILTERS            [Clear all]| 248 jobs   Applied filters: [Remote x] [Full-time x] [Data x]|
| > Work mode                   |                          Sort by [Best match v]  [Save search]|
|   [x] Remote  [ ] Hybrid  ... | +----------------------------------------------------------+ |
| > Job type                    | | [logo] Data Analyst                          [bookmark]| |
|   [x] Full-time [ ] Contract  | | Northwind - Berlin or Remote - $70k to $90k a year     | |
| > Experience level            | | Matches your SQL and Excel. Missing: Tableau   AI      | |
| > Salary  [ 40k ]----[ 120k ] | | Posted 2 days ago - Verified employer                  | |
|   [ ] Include jobs w/o salary | +----------------------------------------------------------+ |
| > Skills  [ Add skill... ]    | | [logo] Junior Data Engineer ...                         | |
| > Date posted                 | +----------------------------------------------------------+ |
| > Company [ Search... ]       |   ... 25 results per page                                    |
| > Verified employers only     |   < Previous  1 2 3 ... 10  Next >      Showing 1 to 25 of 248|
+-------------------------------+----------------------------------------------------------------+
```

**Phone wireframe**

```text
+------------------------------+
| Find jobs             [S] [B]|
| [ Search jobs...           ] |
| [ Filters (3) ]  [Sort v]    |
| 248 jobs                     |
| [Remote x][Full-time x] ...  |
| +--------------------------+ |
| | Data Analyst    [bookm.] | |
| | Northwind - Remote       | |
| | $70k-$90k   2 days ago   | |
| +--------------------------+ |
| ...                          |
| [ Load more (20) ]           |
+------------------------------+
| Home  Jobs  Learn  Msgs  Me  |
+------------------------------+
Filters sheet: header "Filters" [Close]; groups; bottom bar [Clear all] [Show 248 jobs]
```

**Regions and components:** search form (`CMP-SearchField`, `CMP-LocationPicker`, `[Search]` primary); filter panel (accordion groups: `CMP-Checkbox`, `CMP-Slider` + number inputs, `CMP-SkillPicker`, `CMP-Combobox`); applied filter chips (`CMP-Tag` filter/removable); toolbar (count live region, `CMP-Select` sort, `[Save search]` button); results list (`CMP-JobCard`); pagination (`CMP-Pagination` desktop; "Load more" button phone); saved searches menu.

**Parameters (URL):** `q`, `loc` (place id) and `radius` (km, 5/10/25/50/100), `mode` (repeat: remote, hybrid, onsite), `type` (repeat: full_time, part_time, contract, internship), `level` (repeat), `min_salary`, `max_salary`, `inc_nosalary` (0/1, default 1), `skill` (repeat, slug), `posted` (24h, 7d, 30d), `company` (id), `verified` (0/1), `sort` (`match`, `-posted`, `-salary`, default `match` if signed in with profile, else `-posted`; `relevance` when `q` present), `page` (1..40). Unknown values ignored.

**Data:** job summary from JOB (title, company, location, mode, salary range and currency and period when disclosed, posted date, employer verification), match explanation from AIC only when signed in with consent for personalization. Result count exact to 1,000 then "1,000+". Freshness: results fetched on parameter change; cached 5 minutes per query; "N new jobs" pill after 5 minutes of inactivity when new matches exist.

**Behavior:** filter changes apply after 300 ms (desktop) and update URL with `replace` while typing and `push` on commit; phone sheet applies on "Show N jobs". Zero-count facets disabled. "Save search" opens a dialog (name, alert frequency, channel) requiring sign-in (sign-in preserves filters via `returnTo`). Results region `aria-busy` during update with a thin top progress bar; old results stay.

**Actions:** Bookmark (optimistic, class W, requires sign-in: guests see sign-in dialog), Save search (O), Open job (navigation, focus on target h1), Clear all, Remove chip, Change sort (resets page 1, focus to results heading), Pagination.

**States:** loading (8 skeleton cards), empty first (guest default query always has results; if the index is empty "No jobs yet" for new regions), no results ("No jobs match your search" with remove-most-restrictive buttons and "Create an alert for this search"), error (region ErrorState with Retry; search form remains), offline (cached last query results marked "Saved {time}", filters disabled except removal, sort disabled), rate limited (notice and 10 s retry), partial (company logos failing fall back to initials), stale (pill), permission (none), long titles clamp 2 lines.

**Permissions:** public read; Bookmark, Save search, Match explanation need sign-in; employer-hidden jobs (confidential) never appear; blocked companies (user's block list) are excluded and a footnote "Hiding 3 companies you blocked. Manage" appears.

**Analytics:** `ui.job_search.view`; `ui.job_search.query.submit` (query_hash, query_length, filter_count); `ui.job_search.filter.change` (filter_key, value_count); `ui.job_search.sort.change` (sort_key); `ui.job_search.result.click` (position, page, job_ref); `ui.job_search.bookmark.click` (state); `ui.job_search.save_search.complete`; `ui.job_search.no_results.view` (filter_count); `ui.job_search.pagination.click` (page).

**Accessibility:** search form `role="search"`; filter panel `aside` labeled "Filters"; each group a `fieldset`/accordion; count in `role="status"` ("248 jobs"); results `ul`; JobCard stretched link with one tab stop for the card and one for the bookmark; salary slider has numeric inputs and `aria-valuetext`; chips removable by keyboard, `Delete` on a focused chip; after filter change via keyboard focus stays; after Apply on phone focus goes to the results heading; pagination moves focus to the heading and announces "Page 2 of 10".

**Acceptance criteria**

- Given a user selects Remote and Full-time, when they press Back after opening a job, then the results show with the same filters, page and scroll position.
- Given a filter combination with zero results, when it renders, then "No jobs match your search" shows with buttons to remove each filter and the number of jobs each removal would return.
- Given a guest taps the bookmark, when the dialog completes sign-in, then the job is bookmarked and the user returns to the same results.
- Given the user changes sort via keyboard, when results update, then focus remains on the sort control and the count is announced.
- Negative: given the URL contains `sort=hacker` and `min_salary=abc`, when the page loads, then those parameters are ignored, defaults apply, no error is shown, and the URL is corrected on the next change.

### REFSCR-03 Detail (job detail)

**Pattern for:** public or private object detail pages (course landing, company, candidate profile view, application detail). **Route:** `/jobs/{slug}-{id}`. **Parent:** `/jobs` (Back goes to results with filters). **Roles:** GUE and all (read). **Chrome:** `pub` or `app`. **Title:** "{Job title} at {Company} - TalentSphere". **Focus on arrival:** `h1` job title.

**Desktop wireframe**

```text
< Back to jobs
+---------------------------------------------------------------------+-----------------------+
| [logo] Data Analyst                                      [bookmark] | APPLY CARD (sticky)   |
| Northwind - Berlin, Germany or Remote - Full-time                   | $70,000 to $90,000    |
| Posted 2 days ago - 38 applicants      Verified employer            | per year (employer)   |
+---------------------------------------------------------------------+ [ Apply ]            |
| MATCH (signed in)                                           AI      | [ Save ]  [ Share ]   |
| Strong match. You have SQL, Excel. Missing: Tableau.  < Details >  | Closes 30 Apr 2026    |
+---------------------------------------------------------------------+-----------------------+
| About the role   (rich text, sanitized)                             | About Northwind       |
| Responsibilities / Requirements / Nice to have                      | 500 people, Fintech   |
| Skills: [SQL] [Excel] [Tableau]  (your match marked with text)      | < Company page >      |
| Benefits, Location, Hiring process (stages shown)                   | Recruiter: Sam K.     |
+---------------------------------------------------------------------+-----------------------+
| Similar jobs   [JobCard] [JobCard] [JobCard]                                                 |
+----------------------------------------------------------------------------------------------+
```

Phone: header block, match block, tabs "Overview / Company" or stacked sections; sticky bottom bar with `[ Apply ]` (primary, full width less icons) and bookmark icon; the Apply card content (salary, closing date) is part of the overview.

**Data:** Job (title, description rich text, requirements list, skills with required/preferred, salary disclosed range with currency and period and source label "Employer provided", location(s), work mode, type, level, posted date, closing date, applicant count (shown only if employer allows, rounded), pipeline stages summary (if employer shares), employer name, verification state, recruiter display name (if employer opts in), benefits). Company summary (EMP). Candidate-specific: match explanation, whether already applied or saved, profile completeness blockers for applying. Freshness: server-rendered for SEO with structured data (JobPosting JSON-LD); client refresh on focus for closed state.

**Actions:** Apply (signed out: sign in then wizard; signed in: starts REFSCR-04; if already applied the primary becomes "View application" with status), Save/Bookmark (W), Share (Web Share or copy link, O not required), Report job (dialog with reasons; tier 0; O), Follow company (W), Message recruiter (only if employer allows; needs sign-in), View match details (popover). Apply blocked states: profile missing required items shows inline list "Add these to apply: {items}" with links; job closed shows state; user is the poster's colleague sees "You can't apply to your own organization's job".

**States:** loading (header skeleton, description lines); not found or removed: HTTP 410 page "This job is no longer available" with 3 similar jobs and Back to search; closed: banner "Applications closed on {date}" Apply disabled with reason, Save kept; draft/unpublished viewed by owner: "Preview" banner; unverified employer: neutral notice "This employer hasn't been verified yet" with `Learn how we verify`; salary undisclosed: the field is omitted (not "Not disclosed" text) except "Salary not shown by employer" in the facts list for clarity; offline: cached viewed jobs readable, Apply "Needs a connection to start" (draft saves later), error with Retry; rate limited; permission (none for public); conflict none; very long description collapses with "Show more" after 600 words but all content in DOM for search and screen readers (collapse with `aria-expanded`).

**Permissions:** public read; sign-in required for match, save, apply, message; blocked users cannot apply (generic denied "You can't apply to this job"); jobs for restricted audiences (internal mobility ENT, institution drives) 404 for non-members.

**Analytics:** `ui.job_detail.view` (source: search/alert/share/recommendation); `ui.job_detail.apply.click`; `ui.job_detail.save.click`; `ui.job_detail.share.complete` (method); `ui.job_detail.match_details.open`; `ui.job_detail.report.complete` (reason_key); `ui.job_detail.scroll_end`.

**Accessibility:** single h1; sections as h2 ("About the role", "Requirements", "About the company"); skills list with match text ("SQL, you have this") not color alone; apply bar is a `region` labeled "Apply"; sticky bar does not cover focused content (scroll-padding); "Show more" toggle `aria-expanded`; structured text sanitized so headings in descriptions render at h3 or below; external links to employer site flagged "(opens in new tab)".

**Acceptance criteria**

- Given a signed-out visitor opens a job link from a message, when the page loads, then job details render without sign-in, and "Apply" leads to sign-in with `returnTo` set to this job.
- Given the user already applied, when they open the job, then the primary action reads "View application" and the status pill shows the current stage.
- Given the job was closed by the employer, when the page loads, then the HTTP status is 410 for removed jobs or 200 with a "closed" banner for closed-but-visible jobs, and Apply is `aria-disabled` with the reason.
- Negative: given the viewer's profile lacks a required resume, when they press Apply, then no wizard starts and the page lists the missing item with a link to add it, and focus moves to that list.
- Given a screen reader user, when the page loads, then the first heading announced is the job title and the match explanation is reachable by heading navigation.

### REFSCR-04 Form wizard (apply to a job)

**Pattern for:** multi-step creation or submission (create job, create course, import, checkout, mentor application). **Route:** `/applications/new/{jobId}/{step}` with `step` in `contact`, `resume`, `questions`, `documents`, `review`. **Parent:** `/jobs/{slug}-{id}` (Exit returns there). **Roles:** CAN family. **Chrome:** `focus`. **Title:** "Apply to {Job title} - Step {n} of {total} - TalentSphere". **Focus on step arrival:** the step heading.

**Desktop wireframe**

```text
+----------------------------------------------------------------------------------------------+
| Apply to Data Analyst at Northwind                                [ Save and exit ]          |
+--------------------+-------------------------------------------------------------------------+
| STEPS              |  Step 2 of 5: Resume                                                    |
| (v) Contact        |  Choose the resume Northwind will see.                                  |
| (2) Resume  <cur>  |  ( ) Data Analyst 2026 (saved Mar 3)     < Preview >                    |
| ( ) Questions      |  ( ) Generalist resume (saved Jan 9)     < Preview >                    |
| ( ) Documents      |  ( ) Upload a new resume   [ Choose file ]  PDF or DOCX, up to 10 MB   |
| ( ) Review         |  [x] Include my profile link (https://.../u/dana-kim)                   |
|                    |                                                                         |
| Saved 2 min ago   |                                    [ Back ]  [ Continue ]               |
+--------------------+-------------------------------------------------------------------------+
```

**Phone wireframe**

```text
+------------------------------+
| [X]  Apply          Saved    |
| Step 2 of 5: Resume          |
| [=========        ]          |
|                              |
| Choose the resume Northwind  |
| will see.                    |
| ( ) Data Analyst 2026        |
|     < Preview >              |
| ( ) Generalist resume        |
| ( ) Upload a new resume      |
|                              |
+------------------------------+
| [ Back ]       [ Continue ]  |  sticky action bar
+------------------------------+
```

**Steps and fields**

| Step | Fields | Required | Validation | Prefill |
|---|---|---|---|---|
| Contact | Full name, email (verified), phone (optional unless job requires), location (city, country), links (portfolio, optional up to 3) | Name, email | Email must be verified (else dialog "Verify your email to apply" with Resend); phone per `03` section 3.6 | From profile PRF |
| Resume | Choose existing resume, upload new, or build from profile; include profile link toggle | One resume | Type PDF/DOCX, 10 MB; scan must be Ready before Submit | Last used resume |
| Questions | Employer-defined: short text (max 500), long text (max 2000), single/multi choice, yes/no, number, date, file; knockout questions flagged internally (not visible to candidate as knockout) | Per question `required` flag | Per type; counters; no paste blocking | Reuse prior answers to identical standard questions (work authorization, notice period) with "Reuse" notice (`04` `NFR-AXS-044`) |
| Documents | Cover letter (rich text light or upload), certificates, work samples (up to 5 files, 20 MB each) | Per job config | As upload table `03` section 13 | Evidence picker from EVD (attach verified items) |
| Review | Summary per step with Edit links; consent checkbox for sharing profile data with employer (required, unticked); optional "Share demographic information" (voluntary section, separate, prefer not to say) | Consent | All previous steps valid | |

**Behavior:** autosave per step (class: draft, `03` section 8); `Continue` validates the current step only; Review shows a validity list; `Submit application` primary on Review; Back never loses data; deep link to a step with prior invalid steps redirects to the first incomplete; draft resumes from `/applications` ("Continue your application"); drafts expire after 90 days with a reminder at 7 days before [PROP]; Submit uses an idempotency key; duplicates blocked server side (one active application per job per user: second attempt shows "You've already applied. View application."); job closing during the draft shows banner "This job closed on {date}. Your draft is saved" and blocks submit; application edits after submit follow JOB rules (withdraw, update answers if employer allows).

**Actions:** Continue (validate and save, advance), Back, Save and exit (saves invalid data too, returns to job), Exit (X) with dirty prompt (autosave means no prompt unless pending), Submit application (O: offline shows "Ready to submit when you're online" and keeps draft; the user must press Submit after reconnect), Edit from Review, Upload file, Attach evidence.

**States:** loading (step skeleton), resume parse in progress (inline status "Reading your resume"), upload errors (per file states), validation errors (summary + inline), server error on submit (notice with Retry, same idempotency key), session expired (resume in place), job closed, job removed (410 page with draft kept for 30 days), offline (editing allowed; submit disabled with reason), rate limited, conflict (draft edited on another device: compare dialog per `03` section 8.3), conditional step count change announced ("Now 6 steps").

**Permissions:** CAN with verified email and profile minimum; HMG/REC of the same organization blocked from applying to own jobs (reason shown); suspended accounts blocked; applying on behalf of someone else not allowed.

**Notifications:** on submit: candidate "Application received" (template `application.submitted.candidate`), employer new applicant (`application.new.employer`); draft reminder (`application.draft.reminder`, opt-out class `reminders`).

**Analytics:** `ui.apply.view` (step); `ui.apply.step.complete` (step_key); `ui.apply.step.error` (step_key, error_count); `ui.apply.resume.upload.complete`; `ui.apply.submit.click`; `ui.apply.submit.complete`; `ui.apply.abandon` (last_step_key, on exit or 24 hours idle); no answers recorded.

**Accessibility:** `Stepper` as `nav` with `aria-label="Application steps"`, current `aria-current="step"`; the page `h1` is "Apply to {Job}", step heading is an `h2` and is the focus target on step change with the announcement "Step 2 of 5: Resume"; radio groups use `fieldset/legend`; resume previews open in a dialog (focus trap, `Esc`); error summary per step; time-based expiry none; phone sticky bar respects keyboard (hides when keyboard opens only if the Continue button remains reachable via the keyboard `Done`/`Go` key on the last field).

**Acceptance criteria**

- Given a candidate completes Contact and leaves, when they reopen the application later, then they land on Resume with Contact data saved and the draft listed in `/applications`.
- Given a required question is empty, when they press Continue, then no step change occurs, an error summary appears and focus moves to it, and the first invalid field is next in tab order.
- Given the network drops on Review, when they press Submit, then the button explains "Needs a connection", nothing is lost, and after reconnect pressing Submit sends once with the same idempotency key.
- Negative: given the candidate already has an active application for the job, when the wizard is opened via an old link, then they are redirected to the application detail with the message "You've already applied" and no second application is created.
- Given the job closes mid-draft, when they press Submit, then the server rejects, the UI shows the closed state and keeps the draft.

### REFSCR-05 Course player (lesson view)

**Pattern for:** consuming sequenced content (courses, onboarding academies, enterprise mandates). **Route:** `/learn/courses/{id}/lessons/{lessonId}`. **Parent:** `/learn/courses/{id}`. **Roles:** CAN, STD (enrolled or preview), INS (preview). **Chrome:** `app` with optional `focus` toggle (theater mode). **Title:** "{Lesson title} - {Course title} - TalentSphere". **Focus on arrival:** lesson `h1`.

**Desktop wireframe**

```text
+----------------------------------------------------------------------+-------------------------+
| < Data analysis foundations     Module 3: Queries  Lesson 2 of 6   [Theater] | COURSE OUTLINE     |
| +------------------------------------------------------------------+ | v 1 Getting started    |
| |                                                                  | |   (v) Welcome  3:10    |
| |                      VIDEO / CONTENT SURFACE                     | | v 2 Spreadsheets       |
| |                                                                  | |   (v) Formulas 8:20    |
| | [>] 04:12 / 12:30 ======o=============  [CC] [1x] [HD] [PiP] [FS] | | v 3 Queries            |
| +------------------------------------------------------------------+ |   (v) Select basics    |
| 3.2 Joining tables                                  [ Mark complete ] |   (>) Joining tables   |
| Tabs: [Overview] [Transcript] [Notes] [Q and A] [Resources]          |   ( ) Quiz: Joins      |
| Overview text...                                                     | Progress 42 percent    |
| [ < Previous ]                                      [ Next lesson > ] | Downloaded: 2 lessons  |
+----------------------------------------------------------------------+-------------------------+
```

**Phone wireframe**

```text
+------------------------------+
| < Course          3.2     [..]|
| +--------------------------+ |  video pinned at top (sticky)
| |      VIDEO               | |
| | [>] 04:12 ====o=======   | |
| +--------------------------+ |
| Joining tables               |
| [Overview][Transcript][Notes]|
| [Q and A][Outline]           |
| ... tab content scrolls ...  |
+------------------------------+
| [ < ]  [ Mark complete ] [ > ]|  sticky bar
+------------------------------+
```

**Regions and components:** header (course link, location in course), `CMP-MediaPlayer` (`03` section 14), lesson meta, action bar, `CMP-Tabs` (Overview, Transcript, Notes, Q and A, Resources), outline `CMP-TreeView`/accordion with status icons (completed check, current, locked, quiz, downloaded), progress.

**Content types:** video (default), reading (rich text), PDF/slides, interactive exercise, quiz (inline `CMP-QuestionRenderer`), code lab, discussion prompt, live session link. Each type specifies completion rule: video: watched at least 90 percent (or end reached) and required checks passed; reading: reached end and dwell above a minimum? (avoid dwell checks); manual "Mark complete" always available except where the instructor requires a quiz; quiz: score at least the pass mark; assignment: submitted (and graded if required). Completion rules are LRN-owned; the screen displays them ("Complete this lesson by watching it and passing the check").

**Data:** Lesson content and media (STU), enrollment progress, resume position, notes (user private), Q and A threads (LRN), transcripts, captions, outline with lock rules (sequential locks shown with reason "Finish Select basics to unlock"), downloaded status. Freshness: progress saves every 15 s of playback and on pause, end, tab hidden; position resume on next open.

**Actions:** Play and keyboard controls (`03` section 14.2), Mark complete (W; toggles with Undo), Next/Previous, jump via outline, add note at timestamp (W, autosave), bookmark (W), ask question (O), download lesson (D), change speed and captions (settings persisted), report content (O), theater mode (UI only), leave feedback (rating after course).

**States:** loading (player skeleton with poster, outline skeleton), video processing ("This video is still being prepared" for instructors; learners see "Not available yet"), network lost (player inline retry), buffering, locked lesson (reason and link to the blocker), not enrolled (preview-only lessons play; others show enroll prompt via `EntitlementGate`), enrollment expired or revoked (read-only access per policy and message), offline (downloaded lessons play; others "Download to watch offline"), content updated by the instructor while the learner is mid-lesson (banner "This lesson was updated. Reload" never auto reloads), completed (check, optional certificate path at course end), region blocked, DRM errors, session expired (resume in place), conflict (notes edited on two devices: merge append).

**Permissions:** enrolled learners view; previews per `preview` flag; INS course owners can preview with a "Preview mode" banner and no progress written; institution-assigned students with cohort rules; paid content requires entitlement (`CMP-EntitlementGate`); downloaded content respects license expiry.

**Notifications:** deadline reminders (`course.deadline.upcoming`), instructor replies (`course.qa.reply`), certificate issued (`course.certificate.issued`).

**Analytics:** `ui.player.view` (content_type); `ui.player.play`/`pause` (position_bucket); `ui.player.complete` (rule_met); `ui.player.speed.change`; `ui.player.captions.toggle`; `ui.player.note.add`; `ui.player.next.click`; `ui.player.error` (error_class); `ui.player.download.click`. Watch time sampled at 30 s granularity; no keystroke or screen content capture.

**Accessibility:** captions on by user setting; transcript tab synchronized and readable without the player; controls labeled and operable (`03` section 14.2); no autoplay; autoplay-next off by default with a visible 10 s countdown when on; progress `role="progressbar"`; outline is a tree with proper roles and arrow navigation; "Mark complete" is a toggle button `aria-pressed` with label constant ("Mark complete"); status icons have text ("Completed"); tab order: player, action bar, tabs, outline; at 200 percent zoom the outline moves below content (reflow); reduced motion disables hover previews.

**Acceptance criteria**

- Given a learner watches 90 percent of a video lesson that has no quiz, when playback ends, then the lesson is marked complete, the outline shows a check with text "Completed", and "Next lesson" receives focus only if the user activates it (no auto navigation).
- Given the learner closes the tab at 04:12, when they return, then the lesson opens at 04:12 with "Resume from 4:12" and a "Start over" link.
- Given the user is offline with the lesson downloaded, when they open it, then it plays, notes save locally, and on reconnect progress syncs with a summary toast.
- Negative: given the next lesson is locked by a prerequisite, when the user activates it in the outline, then it does not open and a message names the prerequisite with a link.
- Given a keyboard user focused on the player, when pressing `Space`, then play toggles and the page does not scroll; pressing `Esc` in fullscreen exits fullscreen only.

### REFSCR-06 Assessment runner

**Pattern for:** timed, integrity-sensitive tasks (employer assessments, course exams, challenges). **Route:** `/assess/{attemptId}/run`. **Parent:** `/assess` (Exit with confirmation). **Roles:** CAN, STD (attempt owner), invited guests with a limited session. **Chrome:** `focus`. **Title:** "{Assessment name} - In progress - TalentSphere". **Focus on arrival:** question heading.

**Desktop wireframe**

```text
+----------------------------------------------------------------------------------------------+
| SQL Fundamentals - Northwind            Time left [ 38:12 ] [Hide timer]    Saved 10 s ago  |
+----------------------+-----------------------------------------------------------------------+
| QUESTIONS            |  Question 4 of 12                              [ ] Flag for review    |
| (v)1 (v)2 (v)3 [4]  |  Write a query that returns each customer and their total orders.     |
| ( )5 (F)6 ( )7 ...   |                                                                       |
| ( )12                |  [ Code editor (SQL)                    ] [Plain text mode] [Run]     |
|                      |  [                                      ]                             |
| Legend: v answered   |  Output / test results (status region)                               |
| F flagged ( ) not    |                                                                       |
| [ Review and submit ]|  [ < Previous ]                                      [ Next > ]       |
+----------------------+-----------------------------------------------------------------------+
| Integrity: this attempt is monitored per the rules you accepted. < Rules >                   |
+----------------------------------------------------------------------------------------------+
```

**Phone wireframe**

```text
+------------------------------+
| SQL Fundamentals  [38:12]    |
| Q 4 of 12     [Flag] [List]  |
| +--------------------------+ |
| | Question text...         | |
| | ( ) A  ( ) B  ( ) C ...  | |
| +--------------------------+ |
+------------------------------+
| [ < Prev ]          [ Next > ]|
+------------------------------+
```

The question list opens as a bottom sheet. The code editor type is not offered on phones unless the module supports it (`05` MJ-04).

**Lifecycle:** Invitation → Pre-check (`/assess/{attemptId}/start`: rules, accommodations summary, device check, consent) → Run → Review → Submitted → Results (`/results`). An attempt has one state at a time: not started, in progress, paused (approved break), submitted, expired (auto-submitted), voided. Resumption after a technical break follows the policy: the attempt resumes with saved answers and the timer continues unless a platform fault is verified (then compensated time).

**Behavior:** autosave every answer on change and every 15 s (class: draft; local first); timer synchronized to server time (display from server `deadline`, never from the local clock; clock drift corrected on each save response); extra-time multiplier applied from the approved accommodation and shown ("Time includes your approved extra time"); warnings: polite announcement at 50 percent (if configured), 10 min, 5 min, 1 min (assertive at 1 min), 30 s; at deadline auto-submit with announcement "Time is up. Your answers were submitted."; question navigation unrestricted unless the assessment is sequential-only (then Previous is absent and stated up front); flag for review; Review screen lists status per question with counts and a "Submit" confirmation (tier 2 style text: "You have 2 unanswered and 1 flagged. You can't change answers after submitting."); Exit leaves the attempt running (timer continues) with a warning; `visibilitychange` and fullscreen exits are logged as integrity events per policy and disclosed in the rules (never silently); no screen capture unless the assessment declares proctoring and the user consented.

**Question types and renderers:** single choice, multiple choice, short text, long text (counter, no paste restriction unless disclosed), numeric, code (CMP-CodeEditor, run against sample tests, hidden tests on submit), file upload, ordering, matching, fill-in-the-blank, audio/video response (with accessible alternatives). Each has keyboard operation and a text alternative as in `04` section 11.2.

**Actions:** Answer, Next/Previous, Flag, Open list, Run code (O), Pause (approved breaks only), Request help (opens a support dialog, O), Submit (O: offline shows "Reconnect to submit; your answers are saved on this device"; the timer policy for offline periods is stated in the rules), Exit.

**States:** pre-check failures (camera, mic, network, battery, browser unsupported with alternatives: "Continue on a computer"), loading question (skeleton), question load failure (retry, timer paused for platform faults per policy), save failure (SaveIndicator "Couldn't save. Your answer is kept on this device. Retrying"), offline (editing continues locally, banner and status), session expired (resume in place without losing the timer), paused, time warning, auto-submitted, submitted success page ("Submitted. Results {when}"), voided (explains and offers appeal), accommodations active chip ("Adjustments applied"), rate limited code runs ("You can run code once every 5 seconds"), conflict (attempt opened on two devices: the later device takes over and the earlier shows "This attempt is open on another device").

**Permissions:** attempt owner only; invited guests with token scoped to the attempt; proctors and graders via separate screens; employers never see answers before submission; no peeking APIs. Answers and integrity logs are sensitive (retention per ASM).

**Analytics:** `ui.assess_run.view`; `ui.assess_run.question.view` (index); `ui.assess_run.answer.change` (question_type, no content); `ui.assess_run.flag.toggle`; `ui.assess_run.timer_warning.show` (threshold); `ui.assess_run.review.open`; `ui.assess_run.submit.complete` (reason: manual/auto); `ui.assess_run.error` (error_class); integrity events are domain events owned by ASM, not UI analytics.

**Accessibility:** question region is a `section` labeled by "Question 4 of 12"; navigator is a `nav` with a list of buttons with state text ("Question 6, flagged, answered"); timer is not announced every second; `Alt R` announces remaining time; `Hide timer` hides visual only; `Alt N`/`Alt P`/`Alt F`/`Alt Q` per `04` section 3.2; error summary on Review; code editor plain-text mode; math via MathML; images with authored alt text required at publish; extra time and breaks per `04` section 11; proctoring alternatives; high contrast and dark theme honored; no content flashing; focus after Next moves to the new question heading with announcement "Question 5 of 12".

**Acceptance criteria**

- Given a user with a 50 percent extra-time accommodation, when the attempt starts, then the timer shows the adjusted total, every section timer is scaled, and the attempt record stores the multiplier.
- Given the browser crashes with 12 minutes left, when the user reopens the attempt, then saved answers are restored, the timer reflects server time, and a notice states the time remaining.
- Given a screen reader user, when 1 minute remains, then an assertive announcement states it once, and `Alt R` repeats the remaining time on request.
- Negative: given the device is offline at the deadline, when time ends, then the app stores the final answers locally, shows "Time is up. Reconnect to submit", and on reconnect submits answers with their timestamps; the server accepts only answers saved before the deadline per its rules.
- Negative: given the user opens the attempt on a second device, when the second device loads, then the first shows "This attempt is open on another device" and becomes read-only.

### REFSCR-07 ATS pipeline board

**Pattern for:** stage-based workflows (applications, mentoring requests, gig proposals, placement drives). **Route:** `/employer/{org}/jobs/{id}/pipeline` (query `view=board|list`, `stage`, `assignee`, `q`, `sort`). **Parent:** `/employer/{org}/jobs/{id}`. **Roles:** REC, EAD (full); HMG (scoped to assigned jobs, limited actions). **Chrome:** `app`. **Title:** "Pipeline - {Job title} - {Org} - TalentSphere".

**Desktop wireframe**

```text
< Jobs / Data Analyst
Data Analyst - Berlin - Open       [Board | List]  [ Add candidate ]  [ ... ]
[ Search candidates ] [Stage v][Assignee v][Match v][Source v]  Selected: 0
+--------------+--------------+--------------+--------------+--------------+------------+
| New (18)     | Screen (12)  | Interview (6)| Offer (1)    | Hired (0)    | Closed (9) |
| +----------+ | +----------+ | +----------+ | +----------+ |              |            |
| |[ ] S.Chen| | |[ ] R.Vega| | |[ ] A.Roy | | |[ ] T.Ito | |  drop here   |            |
| | Strong   | | | Good     | | | Interview| | | Offer    | |              |            |
| | 3d  SQL  | | | 5d       | | | Tue 10:00| | | Sent     | |              |            |
| +----------+ | +----------+ | +----------+ | +----------+ |              |            |
| | ...      | | | ...      | |              |              |              |            |
+--------------+--------------+--------------+--------------+--------------+------------+
```

**Phone wireframe**

```text
+------------------------------+
| < Data Analyst       [Board|List]
| [New 18][Screen 12][Intv 6]> |   stage tabs (horizontal)
| [ Search ] [ Filters ]       |
| +--------------------------+ |
| | S. Chen          Strong  | |
| | Analyst at Contoso  3d   | |
| | [ Move to... ] [ ... ]   | |
| +--------------------------+ |
| ...                          |
+------------------------------+
Selection mode: top bar shows "2 selected" [Move] [Message] [...] 
```

**Card (CMP-CandidateCard compact):** avatar (or hidden in blind mode), name, headline or current role, match chip with explanation popover (words: Strong, Good, Partial), top three skills with verified marks, days in stage, source, assignee avatar, scorecard summary (n of m submitted), flags (needs action, duplicate), unread messages icon with text, checkbox. Whole card opens a drawer (`?open={applicationId}`), not a new page, on desktop; a full screen on phone.

**Rules and behavior:** columns are the job's stages (configured in JOB/ATS); column header shows count and optional WIP hint; stage order and names editable by REC/EAD in settings; moving a card requires the target stage's gate (reason for Not selected, schedule for Interview optional, offer details for Offer). Move methods: drag and drop (`03` section 6), keyboard pick-up, "Move to" menu on every card, bulk "Move to" in selection mode. A move to a rejecting stage opens a dialog: reason (required list), message template (preview, editable within guardrails), schedule send (default immediate [PROP: 24-hour delay option]); "Reject without message" allowed where the org policy permits. Moves are saved immediately with optimistic UI limited to non-notifying stages (internal); notifying moves wait for the server (pending state on the card). Concurrent changes: a card moved by someone else shows a toast "A. Roy was moved to Interview by Sam" and re-renders; same card dropped by two users resolves by server order with a notice to the later one.

**Filters, search and sort:** text search (name, skills, resume text where permitted), stage, assignee, match band, source, tags, date applied, scorecard status, "Needs action". Sort within columns: newest, oldest, match, last activity. Filters in URL. Counts per column reflect filters ("12 of 18").

**Bulk actions:** selection per column or across columns (`03` section 5): Move to stage, Assign recruiter, Add tag, Add to pool, Send message (template), Reject with reason. Limits: 100 per action synchronous; above this background task; ineligible items listed.

**Data:** Application summary (JOB/ATS), candidate summary respecting visibility and blind-review settings, scorecards (aggregates visible after the viewer submits their own), messages unread, schedule state. Freshness: real time (`03` section 11) with "N new" pill for new applicants; counts update silently; cards update in place.

**States:** loading (column skeletons, 3 per column), empty column ("No candidates in {Stage}" plus hint "Drag candidates here" and "Move to" alternative text), empty job ("No applicants yet" with Share job and Promote actions; entitlements gate promotion), filtered empty, error per column (Retry), offline (read cached board "Saved {time}"; moves disabled with reason; notes queueable), permission (HMG sees only their assigned stages and cannot move to Not selected if policy denies; actions `aria-disabled` with reason), rate limited (bulk), conflict (above), closed job (read-only board banner "Job closed. Reopen to move candidates"), large boards (virtualized columns above 100 cards; "Load more" per column), blind mode.

**Permissions:** REC and EAD: view all, move, reject, message, assign, export (EAD, audited); HMG: view assigned job applicants, comment, score, move only to review-type stages (policy); no access to candidates of other organizations; candidate PII fields (phone, email) are shown to REC and EAD after stage `Screen`? [PROP: gated by org setting]. Every view of a full profile, export and bulk reject is audit-logged.

**Notifications:** triggered: stage change messages to candidates (templates per `06` section 7), interview scheduling, assignment notifications to recruiters (`application.assigned`), new applicant digests.

**Analytics:** `ui.pipeline.view` (view_mode); `ui.pipeline.card.open`; `ui.pipeline.move.complete` (from_stage_type, to_stage_type, method: drag/keyboard/menu/bulk); `ui.pipeline.reject.complete` (reason_key); `ui.pipeline.filter.change`; `ui.pipeline.bulk.complete` (action, count_bucket); `ui.pipeline.error`.

**Accessibility:** board is a group of `region`s per column labeled "{Stage}, 12 candidates"; cards are `li` items; keyboard drag as `03` section 6 with announcements; the list view (table) is always available and the view choice is remembered per user (board is never forced); every action is available in both views; selection checkboxes with labels "Select Sam Chen"; match chip includes text; drawer focus management per `CMP-Drawer`; column scroll buttons for keyboard; "N new" pill polite; sticky column headers do not obscure focus.

**Acceptance criteria**

- Given a recruiter drags a card from Screen to Interview, when dropped, then the card appears at the drop position within 150 ms, saves, and an Undo toast appears; if the save fails the card returns to Screen with a message.
- Given a keyboard user focuses a card and presses `Space`, `Right`, `Space`, then the card moves to the next stage and "Moved Sam Chen to Interview, position 1 of 7" is announced.
- Given a recruiter selects 12 candidates and chooses Reject, when the dialog opens, then it states "12 candidates will be told they were not selected" with a reason required and templates, and the action is audit logged.
- Negative: given an HMG tries to move a candidate to Offer, when they use any method, then the action is unavailable (`aria-disabled` with "Only recruiters can send offers") and the server rejects direct API attempts with 403.
- Given a job with 1,500 applicants, when the board loads, then each column loads 50 cards with "Load more" and the list view offers pagination; no browser freeze.

### REFSCR-08 Messaging

**Pattern for:** conversation-based communication (candidate and recruiter messages, mentor chat, institution inbox, support tickets with threads). **Routes:** `/messages` (inbox), `/messages/{conversationId}`, `/messages/requests` (and the org-scoped equivalents under `/employer/{org}/messages`). **Parent:** `/messages` for a conversation. **Roles:** all signed-in users; initiating rules per relationship (below). **Chrome:** `app`. **Title:** "Messages - TalentSphere" / "{Participant name} - Messages - TalentSphere".

**Desktop wireframe (two panes plus optional details)**

```text
+----------------------------+---------------------------------------------+-------------------+
| Messages        [ New ]    | Sam Chen - Recruiter, Northwind     [i] [..]| DETAILS (opt.)    |
| [ Search messages ]        | Re: Data Analyst application                | Sam Chen          |
| [All][Unread][Requests (2)]| ------------------------------------------- | Northwind         |
| +------------------------+ |  Mon 3 Mar                                  | Linked job:       |
| | Sam Chen         10:42 | |  Sam: Hi Dana, thanks for applying...       | Data Analyst      |
| | Can you do Tuesday...  | |                          10:40              | Shared files (2)  |
| | (*) 2 unread           | |  You: Tuesday 10:00 works.      Delivered   | < Mute > < Block >|
| +------------------------+ |                          10:42              | < Report >        |
| | Priya (mentor)  Mon    | |  [ New messages v ]  (pill when scrolled up)|                   |
| | Thanks for the notes   | | +-----------------------------------------+ |                   |
| +------------------------+ | | Write a message...             [clip][>] | |                   |
|                            | +-----------------------------------------+ |                   |
+----------------------------+---------------------------------------------+-------------------+
```

**Phone:** inbox screen (list) → push to conversation screen with app bar (Back, name, info) and composer sticky at bottom; details open as a bottom sheet. Tablet: two panes without the details pane (details as a drawer).

**Regions and components:** inbox (`CMP-List` of conversations with avatar, name, last message preview (plain text, 1 line, hidden if "Hide details" or sensitive), time, unread badge text, mute icon, pin), search field, tabs (All, Unread, Requests, Archived), thread (`CMP-MessageThread`, `role="log"`), composer (`CMP-Composer`: rich text light, attach, emoji, templates for employer roles, Send), details pane (participants, linked object, shared files, notification and safety controls).

**Rules and behavior**

- **Who can message whom (MSG-owned; the screen enforces display):** candidates may reply in any conversation; candidates may start conversations only with connections, mentors they booked, or employers who messaged first or from an application context; employers (REC, HMG, EAD) may start with candidates who applied, opted in to be contacted, or via sourcing outreach within limits; messages from non-connections land in Requests until accepted; blocked users cannot message.
- **Sending:** `Enter` sends or inserts newline per setting (default: Enter sends on desktop, newline on phone); send creates a pending message (gray, "Sending" text), then Sent/Delivered/Read (text, not only ticks) where read receipts are enabled (setting; recruiters' read receipts respect candidate privacy rules: read receipts are off by default for candidates); failed sends stay in the thread with "Not sent. Retry or Delete". Optimistic append of the pending state only; the message is not "sent" until the server confirms.
- **Real time:** new messages append; if the user is within 80 px of the bottom the thread scrolls; otherwise a "New messages (3)" pill; typing indicator; presence only inside conversations (opt-out); reconnection resync (`03` section 11).
- **Attachments:** `03` section 13 (25 MB, scanned; images inline with alt text field optional; links previews off by default for privacy [PROP]); drag onto thread uploads; paste image supported.
- **Editing and deleting:** edit within 15 minutes with "Edited" marker (history retained for moderation); delete for me / delete for everyone within 24 hours leaving "Message deleted" placeholder; both with Undo for 8 s except delete for everyone requiring tier 1 confirm.
- **Safety:** each message menu has Report; conversation menu has Mute, Archive, Block, Report; unsolicited-message warnings ("This person isn't in your network. Be careful sharing personal information"); link safety interstitial for external links from unknown senders; off-platform contact requests flagged by TSF heuristics with a neutral notice.
- **Search:** inbox search over names and message text, local plus server; results highlight and open the thread at the message.
- **Templates and automation (employer roles):** canned replies with variables, preview before send; automated messages are labeled "Automated message".
- **Drafts:** per conversation, autosaved locally and server, shown in inbox as "Draft: ...".
- **Notification interplay:** viewing a thread marks it read after 1 second of visibility with focus; push suppressed while the thread is open.

**Data:** Conversation (participants, linked object ref, last message, unread count, muted, pinned, archived), Message (sender, body sanitized rich text, attachments, timestamps, status, edited flag, reactions optional), participant privacy flags. Pagination: inbox 30 per load; thread loads newest 50, older on scroll up with "Load earlier" at top. Retention per MSG policy; export in `/settings/data`.

**Actions:** Send (O; queueable offline as "Waiting to send" with W class: queued messages send in order on reconnect, user can cancel), Attach (O), Edit, Delete, React, Mute/Unmute (W), Archive (W, Undo), Pin (W), Block (tier 1 confirm), Report (O dialog), New conversation (recipient Combobox restricted to permitted recipients), Mark all read (W), Accept/Decline request (O).

**States:** loading (inbox rows skeleton, thread skeleton bubbles), empty inbox first use ("No messages yet. Messages from employers, mentors and connections appear here." + "Find people"), empty requests, no search results, thread not found/inaccessible (generic unavailable state), error (inbox Retry; thread Retry with composer preserved), offline (cached threads readable; composer enabled with queued sends; attachments disabled "Needs a connection"), reconnecting indicator, rate limited ("You're sending messages too quickly. Try again in 30 seconds."), blocked or restricted account (composer replaced by notice "You can't send messages to this person"), recipient left platform ("This person's account is closed"), muted, archived, large threads (virtualized after 500 messages), message too long (limit 5,000 characters with counter), rich content paste sanitized, RTL and bidi text (`dir="auto"` per message).

**Permissions:** participants only; staff access to message content only via TSF case with logged justification; employers see only conversations for their org (shared inbox with assignment) and cannot see other recruiters' private notes; candidate-facing sender identity is the recruiter's display name and org.

**Analytics:** `ui.messages.view`; `ui.messages.conversation.open` (relationship_type); `ui.messages.send.complete` (has_attachment, length_bucket); `ui.messages.send.error`; `ui.messages.request.accept`; `ui.messages.block.complete`; `ui.messages.report.complete`; no message text, names or ids of counterparties.

**Accessibility:** inbox is a `list`; each conversation is a link whose name includes name, unread count and time ("Sam Chen, 2 unread, 10:42"); thread `role="log"` with `aria-live="polite"` only for the focused thread and only when the announcement setting is on, announcing "{Name}: {first 100 characters}"; message groups by sender with `<time>`; delivery status is text; composer is a labeled textbox; `Ctrl Enter`/`Enter` behavior documented; attach button labeled; `Up` in empty composer edits last message; focus stays in the composer after sending; "New messages" pill is a button with count; no sound by default; keyboard path to message menu; emoji picker accessible with search and skin tone options; reduced motion removes the typing animation (text only).

**Acceptance criteria**

- Given a user is scrolled up reading older messages, when a new message arrives, then the scroll position does not change and a "New messages (1)" pill appears; activating it scrolls to the bottom and focuses the newest message.
- Given the network drops while sending, when the user presses Send, then the message shows "Waiting to send", survives a reload, and is delivered once in order on reconnect with no duplicate.
- Given a non-connection recruiter writes first, when the candidate opens messages, then the message is in Requests with a safety notice and no read receipt is sent until accepted.
- Negative: given the user is blocked by the other participant, when they open the thread, then the composer is replaced by "You can't send messages to this person" and the API rejects sends with 403 without revealing the block.
- Given a screen reader user focused in the composer, when a message arrives in the open thread, then it is announced once without moving focus.

### REFSCR-09 Settings (privacy and visibility)

**Pattern for:** account and organization settings, preference matrices, consent management. **Route:** `/settings/privacy` within the settings shell (`/settings/*`). **Parent:** `/settings` (account). **Roles:** all signed-in users (own data). **Chrome:** `app`. **Title:** "Privacy and visibility - Settings - TalentSphere".

**Desktop wireframe**

```text
+--------------------+---------------------------------------------------------------------+
| SETTINGS           | Privacy and visibility                          Saved just now          |
| Account            | Control who can see your profile and how your data is used.         |
| Security           |                                                                     |
| > Privacy      <cur| PROFILE VISIBILITY                                                  |
| Consent            | ( ) Private   Only you                                              |
| Notifications      | (o) Recruiters  Employers on TalentSphere who match your preferences|
| Connected accounts | ( ) Public    Anyone, including search engines                      |
| Accessibility      | < Preview what recruiters see >                                     |
| Language           |                                                                     |
| Data and export    | WHAT RECRUITERS CAN SEE                                             |
| Accommodations     | Phone number            [ Off ]  Only after you apply               |
|                    | Current employer        [ On  ]  Hide from my current employer: [x] |
|                    | Salary expectations     [ Off ]                                     |
|                    | Open to work            [ On  ]  Visible only to recruiters         |
|                    |                                                                     |
|                    | DATA USE                                                            |
|                    | Personalized recommendations  [ On ]   < What data is used? >      |
|                    | Improve TalentSphere with my usage data [ Off ]                     |
|                    |                                                                     |
|                    | DELETE OR DEACTIVATE                                                |
|                    | [ Deactivate account ]   [ Delete my account ]                      |
+--------------------+---------------------------------------------------------------------+
```

**Phone:** `/settings` is a list of sections (push navigation); each section is a single column; the save indicator sits in the app bar; the danger zone is the last section with extra spacing; sub-nav is the section list itself (no persistent left rail). Tablet: rail replaced by a 240 px sub-nav at 900 and up.

**Structure rules:** Settings shell has a left sub-navigation (`nav` "Settings sections"), one section per route, each section grouped by `h2` headings, controls in `CMP-Field` rows (label left, control right on desktop; stacked on phone). Controls that take immediate effect are `CMP-Switch` or radio groups that save on change; forms that need multiple fields use a Save button section. A page does not mix patterns without a visual divider and clear labeling ("Changes below are saved when you press Save").

**Settings and defaults (this screen)**

| Setting | Control | Default | Effect | Confirm |
|---|---|---|---|---|
| Profile visibility | Radio group (Private, Recruiters, Public) | Private [PROP] | Controls profile discoverability and `/u/{handle}` access | Moving to Public shows a tier 1 dialog explaining search engine indexing and its delay in removal |
| Field-level visibility (phone, current employer, salary, open to work) | Switches | Off for phone and salary, On for open to work (only if Recruiters or Public) | Per-field exposure; "Hide from my current employer" excludes the verified employer domain | none; Undo toast |
| Hide from specific companies | Combobox adding companies to a block list (up to 100) | empty | Excludes them from seeing the profile | none |
| Personalized recommendations | Switch | On [DEC-REQ `OD-SET-privacy`: consent-based default in some jurisdictions is Off] | Uses profile and activity for recommendations | Turning off explains the effect |
| Improve with usage data | Switch | Off | Analytics beyond necessary | none |
| Search history | Switch plus "Clear history" | On | Local and account search suggestions | Clear is tier 0 with Undo |
| Message read receipts | Switch | Off | Visible read status | none |
| Presence | Switch | On within conversations | | none |
| Deactivate account | Button | n/a | Hides profile and pauses notifications, reversible by sign in | Tier 1 dialog |
| Delete account | Button | n/a | Tier 3 typed confirm with 14-day cooling-off | Re-authentication required |

**Behavior:** every change saves immediately with `SaveIndicator` (Saving, Saved, Couldn't save. Retry); a failed save reverts the control to its previous state and announces the failure; changes made on another device are reflected on focus (stale values refresh; if the control is being edited, the conflict flow applies); a preview link opens `/profile/preview` showing exactly what a recruiter sees under the current settings; changes are audit logged for privacy-related fields (user-visible "Settings history" under Data and export). Consent-bearing switches show a consent version and date in the detail ("You agreed on 12 Mar 2026 to version 3"), and withdrawal is as easy as granting.

**Data:** SET and PRF preference entities; consent records (SET) with version and timestamp; block list; read model of what is visible.

**States:** loading (section skeleton rows), error (page-level ErrorState with Retry; individual save failures inline), offline (settings readable from cache; changes queued W with "Waiting to sync" per control; consent changes require connection: O, disabled with reason "Privacy changes need a connection so we can apply them everywhere"), permission (none; org-managed policy overrides show "Set by your organization" with a lock icon and reason; institution-managed students see locked rows), restricted account (read-only privacy and export/deletion available per the as-built restricted behavior), conflict (above), rate limited (rapid toggling), session expired (re-auth dialog), long lists (block list virtualized beyond 50), RTL.

**Permissions:** self only; support (SUP) cannot change another user's privacy settings (can view history with justification); org admins can set org-level defaults and locks only in their workspace settings (`/employer/{org}/settings`), not personal privacy.

**Analytics:** `ui.settings_privacy.view`; `ui.settings_privacy.visibility.change` (from, to); `ui.settings_privacy.field.change` (field_key, state); `ui.settings_privacy.consent.change` (consent_key, state); `ui.settings_privacy.preview.open`; `ui.settings_privacy.save.error`; `ui.settings_privacy.delete.start`. No identifiers beyond consent keys.

**Accessibility:** settings nav `aria-current="page"`; radio group `fieldset/legend` with descriptions via `aria-describedby`; each switch has a visible label and description, `role="switch"`; state text "On"/"Off" visible; save status in a polite live region (only the first Saved after an error and failures announced; routine saves announce "Saved" at most once per 10 seconds); danger zone headed and separated; locked rows have text reason not only a lock icon; dialogs per `CMP-AlertDialog`; page remains usable at 400 percent zoom with single column.

**Acceptance criteria**

- Given a user switches "Open to work" off, when the switch changes, then it saves within 1 s, "Saved" appears, and recruiters no longer see the flag in the preview.
- Given the save request fails, when the user toggles a switch, then the switch returns to its previous position within 150 ms, an inline error with Retry appears, and the failure is announced assertively once.
- Given an institution locked "Profile visibility" for a student, when the student opens the screen, then the radio group is `aria-disabled`, shows "Set by Northfield University" and lists what is allowed.
- Negative: given the user selects Public, when the dialog appears, then no change is applied until "Make profile public" is confirmed; cancelling leaves the previous value.
- Given a screen reader user toggles three switches quickly, when saves complete, then at most one "Saved" announcement is made.

### REFSCR-10 Admin table (moderation cases)

**Pattern for:** operational lists in the Console (support tickets, users, orgs, payments, audit log, verification cases). **Route:** `/console/moderation/cases` with query `status`, `severity`, `type`, `assignee`, `age`, `q`, `sort`, `page`, `open`. **Parent:** `/console/moderation`. **Roles:** MOD (full for assigned queues), PAD (all), SAD (read). **Chrome:** `app` with the staff stripe. **Title:** "Cases - Moderation - Console - TalentSphere".

**Desktop wireframe**

```text
[Staff] TalentSphere Console                                               Search  Help  Dana M.
+------------------+---------------------------------------------------------------------------+
| Trust and safety | Cases                                                [ Export ] [ Views v]|
|  Queue           | [ Search case id, user, text ] [Status v][Severity v][Type v][Assignee v] |
|  > Cases     <cur| Applied: [Open x] [High x]                          212 cases  Clear all  |
|  Appeals         | [ ] Case        Type        Severity  Status    Assignee    Age    SLA    |
|  Policies        | [ ] #4821 Post  Harassment  High      Open      Unassigned  2h     1h 20m |
| Support          | [ ] #4820 Job   Scam        High      In review Priya R.    5h     DUE    |
| ...              | [ ] #4819 Msg   Spam        Low       Open      Unassigned  1d     OK     |
|                  |  ...                                                                      |
|                  | 25 per page [v]   < Prev  1 2 3 ... 9  Next >                             |
|                  +---------------------------------------------------------------------------+
|                  | BULK (when selected): 3 selected  [ Assign to me ] [ Assign to... ] [ ... ]|
+------------------+---------------------------------------------------------------------------+
Row click or Enter on case id opens a right drawer (?open=4821) with evidence, history, actions.
```

**Phone:** table becomes a card list (case id, type, severity pill, status, SLA, assignee) with filter sheet; drawer becomes a full-screen detail; bulk actions limited to Assign (destructive moderation actions are desktop only: notice "Open on a larger screen to take enforcement actions").

**Columns (default, reorderable per user, saved view):** Select, Case id (link, frozen), Subject type (icon plus text), Reason category, Severity (pill with icon: High, Medium, Low), Status (Open, In review, Awaiting info, Resolved, Appealed), Assignee, Reporter count, Age (relative; absolute in tooltip), SLA state (text: OK, Due in 1 h 20 m, Overdue; color plus icon), Last activity. Hidden by default: reporter ids (restricted), account age, region.

**Behavior:** default sort SLA ascending then severity descending; sort by header buttons; saved views ("My queue", "Unassigned high severity", custom) stored per user and shareable by link (query string); counts update live (no row reordering without the "N new" pill); row selection model per `03` section 5 with limit 200; bulk actions: Assign (me, person, queue), Change status, Add label. Enforcement actions (remove content, suspend, ban) are only in the case drawer, never bulk (`NFR-SCR-003`), require a reason from a policy-linked list, preview of the notice the user will receive, and for account-level actions tier 4 two-person approval or step-up per policy. Every read of sensitive evidence is audit logged with an auto-recorded reason (opening the drawer) and sensitive images blurred by default with "Show" (tier 0, logged, optional wellness warning). Export (CSV) permitted for MOD leads and PAD, limited to filtered rows (max 10,000), watermarked with exporter and time, audited, excluding personal contact data.

**Data:** Case (TSF), subject summary, reports, policy references, history timeline, SLA computations (TSF rules), assignment. Freshness: real time list refresh with "N new" pill; opened drawer updates live with conflict notice if another agent edits.

**States:** loading (8 skeleton rows), empty queue ("No cases match these filters" and "Queue is clear" variants), error per request (Retry, with request id), partial (a column failing shows "Couldn't load"), offline (console is online-only: banner "The console needs a connection" and actions disabled), permission (items outside the agent's region or queue invisible; direct URL shows unavailable state; no leak), step-up required (re-auth screen in place), rate limited, conflict (case claimed by another agent: toast and row update, action blocked with "Assigned to Priya R."), stale, very large result sets (counts capped "10,000+"; require narrowing for export).

**Permissions (role x capability)**

| Capability | MOD | PAD | SAD | SUP |
|---|---|---|---|---|
| View queue and cases in assigned scope | allow | allow (all) | read | deny |
| Assign to self | allow | allow | deny | deny |
| Assign to others | MOD lead only | allow | deny | deny |
| Change status | allow | allow | deny | deny |
| Enforcement action in drawer | allow with reason | allow | deny | deny |
| Account-level enforcement (suspend, ban) | request (two-person) | approve | deny | deny |
| View sensitive evidence (unblurred) | allow, logged | allow, logged | allow, logged | deny |
| Export | lead only | allow | deny | deny |
| View audit trail of a case | allow | allow | allow | deny |

**Analytics:** console analytics are operational and internal: `ui.console_cases.view`; `ui.console_cases.filter.change`; `ui.console_cases.bulk.complete` (action, count_bucket); `ui.console_cases.drawer.open`; `ui.console_cases.error`. Content of cases is never in analytics; reviewer activity metrics derive from domain events (`EVT-TSF`, planned), not UI events.

**Accessibility:** native `table` with caption "Moderation cases" (visually hidden), `th scope`, `aria-sort` on sortable headers, row header is the Case id link; selection checkboxes labeled "Select case 4821"; the drawer is a non-modal complementary region with focus managed per `CMP-Drawer` (focus to its title on open, back to the row on close); SLA and severity not color alone (text and icon); live region for "N new cases" polite at most once per minute; keyboard shortcuts in the case drawer documented (`J/K` next/previous case, `A` assign to me, `E` change status) as single-key shortcuts that are disableable and active only in the drawer with focus outside text fields; bulk bar toolbar; sensitive images have text alternatives written by the system ("Image reported as {category}; blurred") and blur toggle accessible; at 200 percent zoom columns collapse to the card layout.

**Acceptance criteria**

- Given 212 open cases, when a moderator filters Severity High and opens a case with `Enter`, then the drawer opens with focus on its title, the URL contains `open=4821`, and `Esc` closes it returning focus to the same row.
- Given three cases selected, when "Assign to me" is chosen, then all three show the assignee, an audit entry is written per case, and an Undo toast restores previous assignees for 8 s.
- Given a case is claimed by another moderator while the first has it open, when the first tries to act, then the drawer shows "Assigned to Priya R." and enforcement actions are `aria-disabled`.
- Negative: given a moderator without export permission, when they open Views, then Export is absent from the DOM and a direct export request is rejected with 403 and audited.
- Negative: given sensitive evidence, when the case opens, then images are blurred; revealing logs the access and the reveal does not persist after closing the drawer.

## 5. How module screens relate to the reference screens

| Module screen type | Pattern | Differences to specify |
|---|---|---|
| Home or dashboard of any workspace | REFSCR-01 | Tiles, data sources, role-specific actions |
| Search or browse lists (courses, mentors, gigs, events, candidates, students, applications, tickets, users) | REFSCR-02 (or REFSCR-10 in Console) | Filters, card or row design, sort options, permissions |
| Object pages (course landing, company, candidate profile, application, mentor, gig, event) | REFSCR-03 | Regions, actions, closed or restricted states |
| Creation or submission wizards (create job, create course, mentor application, checkout, import) | REFSCR-04 | Steps, fields, review, draft rules |
| Content consumption (lesson, article, recording, webinar) | REFSCR-05 | Completion rule, content types |
| Timed or integrity sensitive tasks (assessment, coding challenge, exam) | REFSCR-06 | Question types, integrity rules, accommodations |
| Stage-based workflow (pipeline, mentoring requests, gig proposals, drives) | REFSCR-07 | Stages, gates, card content, roles |
| Conversation features (messages, mentor chat, support thread, comment threads) | REFSCR-08 | Who can start, retention, safety |
| Settings, preferences and consent | REFSCR-09 | Settings table, defaults, confirmations |
| Admin and operational tables | REFSCR-10 | Columns, bulk limits, audit, step-up |

## 6. Consolidated rules

| Id | Rule | Test |
|---|---|---|
| NFR-SCR-001 | No screen enters build planning with an unresolved checklist item (CHK-01 to CHK-58) | Review gate |
| NFR-SCR-002 | Every screen emits `ui.{screen}.view` once per arrival and an `error` event for each error state | Analytics test |
| NFR-SCR-003 | Enforcement, deletion of other people's data, payments and publication are never bulk actions on phone and require explicit per-item confirmation or tiered approval where bulk exists | Spec review and test |
| NFR-SCR-004 | Every list, board and chart screen offers a table or list equivalent (`02` `NFR-DSY-018`) | Screen spec |
| NFR-SCR-005 | Every action lists its offline class (R, W, O, D) | Spec lint |
| NFR-SCR-006 | Every screen spec states focus on arrival, landmark structure and live announcements | Spec lint |
| NFR-SCR-007 | Each screen defines its null display and error copy keys per `06` | Copy lint |
| NFR-SCR-008 | Permission matrix entries map to `BR-` rules enforced server-side | Security test |

## 7. Open decisions and risks

| Id | Question | Options | Default proposal | Decides | Blocks |
|---|---|---|---|---|---|
| OD-SCR-01 | Draft expiry for applications | 30, 90, 180 days | 90 days with reminder | Product owner | JOB |
| OD-SCR-02 | Employer view of candidate contact details before an application advances | Always; after Screen; after candidate consent | After Screen stage, org setting | Product owner and privacy officer | ATS |
| OD-SCR-03 | Read receipts defaults for candidates and recruiters | Off for candidates, on for recruiters; off for both | Off for both, opt-in | Privacy officer | MSG |
| OD-SCR-04 | Reject message delay option | Immediate only; delay options | Immediate default, 24-hour delay optional | Product owner | ATS |
| OD-SCR-05 | Single-key shortcuts inside console drawers | Allowed; disallowed | Allowed, disableable | Security and accessibility lead | ADM |

### 7.1 Risks

| Id | Risk | Mitigation |
|---|---|---|
| RSK-SCR-01 | Screen specs become inconsistent across authors | Checklist gate and reference screens as patterns; periodic spec audit |
| RSK-SCR-02 | Reference screens are treated as pixel designs | They are behavior and structure patterns; visual design follows `02` tokens and components |
| RSK-SCR-03 | Spec effort too heavy for trivial screens | Template permits "n/a, reason"; trivial variations cite the pattern and list deltas only |

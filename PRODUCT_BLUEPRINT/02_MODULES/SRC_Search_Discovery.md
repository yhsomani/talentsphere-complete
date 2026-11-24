# SRC — Search & Discovery

> Status: intended product specification. Nothing here is a claim that anything is built. Legacy inputs: `SSOT.md` F-20 Command Search, F-32 Saved Searches & Job Alerts, F-34 Multi-Entity Backend Search, F-84 Skills Graph & Taxonomy (§9.1), F-92 Advanced Recruiter Search, F-147 Unified Search & Discovery, F-04 job search (§9.2), BR-141..BR-148, BR-263..BR-268 (referenced by F-147; their text is not defined in the legacy registries, so rules below are re-derived).

## 1. Purpose, outcomes and boundaries

### 1.1 Purpose

SRC is the discovery layer of the platform: one global command search, per-entity search (jobs, people, courses, companies, challenges, content), filters, facets, sorting, saved searches and alerts, typo tolerance, synonyms and the governed skills taxonomy, transparent ranking, search history and privacy, recruiter talent search with fairness controls, and the indexing lifecycle that keeps all of it correct and permission-safe.

### 1.2 Outcomes

1. A user finds the right job, person, course, company, challenge or piece of content in a few keystrokes, including when they mistype or use a different word for the same skill.
2. A user can see why a result appears and can turn off personalization.
3. Search never reveals anything the viewer is not allowed to see: not as a result, a count, a facet value or an autocomplete suggestion.
4. Recruiters can find candidates by skills and verified evidence without protected attributes influencing selection, and every search is auditable.
5. Zero results, errors and degraded modes are explained and recoverable.
6. The index stays fresh, and deletions and privacy changes take effect fast.

### 1.3 In scope, out of scope, owned vs consumed

| Area                                                                 | Owned by SRC           | Not owned (owner)                                                                |
| -------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| Search UI, query processing, ranking, facets, suggestions            | Yes                    | Entity data and detail pages: owning modules (JOB, LRN, ASM, NET, EMP, PRF)      |
| Skills taxonomy, synonyms, skill relationships, emerging-skill queue | Yes                    | Market signals (demand, salary premium): MKT (planned)                           |
| Saved searches and alert scheduling                                  | Yes                    | Email/push delivery: NTF (planned)                                               |
| Recruiter talent search, fairness controls, audit                    | Yes                    | Talent pools, outreach, pipelines: ATS (planned)                                 |
| Index pipelines, versions, evaluation                                | Yes                    | Underlying engine selection (decision recorded as OD-SRC-01)                     |
| Visibility inputs (discoverability, blocks, section visibility)      | Consumed (PRF)         | Setting them: PRF, SET                                                           |
| Evidence facets (rung, issuer class, freshness)                      | Consumed (EVD)         | Computing them: EVD                                                              |
| Identity-verified facet                                              | Consumed (BGV, opt-in) | Verification: BGV                                                                |
| Personalized recommendations ("jobs for you")                        | Not owned              | AIC (planned); SRC provides search only, but shares the "why this result" format |
| Plans and entitlements limiting search features                      | Consumed (BIL)         | Defined in BIL                                                                   |

### 1.4 Boundaries that are easy to confuse

- **Search vs recommendations:** search answers a query the user typed or filters they chose. Recommendations (AIC) are unprompted suggestions. Both use the same explanation card style, but ranking logic is separate.
- **Talent search (SRC) vs talent pools (ATS):** SRC finds candidates; ATS stores pools, notes, stages and outreach.
- **Skills taxonomy (SRC) vs skill claims (EVD) vs profile skills (PRF):** SRC governs the canonical list; EVD and PRF reference it.

## 2. Roles and permission matrix

`Y` allowed, `-` not allowed, `V` within viewer permissions, `A` with audit, `L` limited (public data only, capped).

| Capability                                           | GUE                       | CAN/STD/FRL | INS/MNT            | REC                           | HMG           | EAD                 | IAD/PLO                   | MOD | SUP | PAD                           | SAD | API |
| ---------------------------------------------------- | ------------------------- | ----------- | ------------------ | ----------------------------- | ------------- | ------------------- | ------------------------- | --- | --- | ----------------------------- | --- | --- |
| Global command search                                | L                         | Y           | Y                  | Y                             | Y             | Y                   | Y                         | Y   | Y   | Y                             | Y   | -   |
| Search jobs, courses, companies, challenges, content | L                         | Y           | Y                  | Y                             | Y             | Y                   | Y                         | V   | V   | Y                             | Y   | V   |
| Search people (professional directory)               | L (public indexable only) | V           | V                  | V                             | V             | V                   | V (own institution scope) | A   | A   | A                             | A   | V   |
| Recruiter talent search                              | -                         | -           | -                  | Y (verified org, entitlement) | Y (delegated) | Y                   | -                         | -   | -   | A                             | A   | Y   |
| Save searches and alerts                             | -                         | Y           | Y                  | Y                             | Y             | Y                   | Y                         | -   | -   | -                             | -   | -   |
| Manage own recent searches and personalization       | -                         | Y           | Y                  | Y                             | Y             | Y                   | Y                         | Y   | Y   | Y                             | Y   | -   |
| View ranking explanation                             | Y                         | Y           | Y                  | Y                             | Y             | Y                   | Y                         | Y   | Y   | Y                             | Y   | Y   |
| View candidate-side search appearance insights       | -                         | Y (own)     | Y (own)            | -                             | -             | -                   | -                         | -   | -   | -                             | -   | -   |
| Curate taxonomy and synonyms                         | -                         | -           | -                  | -                             | -             | -                   | -                         | -   | -   | Y (taxonomy editor)           | Y   | -   |
| Propose a skill or synonym                           | -                         | Y           | Y (course authors) | Y                             | -             | -                   | -                         | -   | -   | -                             | -   | -   |
| Tune ranking, run relevance evaluation               | -                         | -           | -                  | -                             | -             | -                   | -                         | -   | -   | Y (dual approval for release) | Y   | -   |
| View fairness audit reports                          | -                         | -           | -                  | -                             | -             | Y (own org summary) | -                         | -   | -   | Y                             | Y   | -   |
| Run reindex, view index health                       | -                         | -           | -                  | -                             | -             | -                   | -                         | -   | -   | Y                             | Y   | -   |
| View search analytics (aggregate)                    | -                         | -           | -                  | -                             | -             | Y (own org)         | Y (own institution)       | -   | -   | Y                             | Y   | -   |

Staff access to people search is for support and moderation inside a case and is audited. "Taxonomy editor" is a PAD sub-role `[PROP]` (OD-SRC-09).

## 3. Sub-module map

```mermaid
flowchart LR
    A["A Entity search (FR-SRC-001 to 008)"] --> B["B Query and results experience (009 to 016)"]
    B --> C["C Saved searches, alerts, history (017 to 019)"]
    B --> D["D Permission and privacy (020)"]
    D --> E["E Recruiter talent search (021 to 024)"]
    F["F Index and platform (025 to 034)"] --> A
    F --> E
```

| Sub-module | Name                            | Features                      |
| ---------- | ------------------------------- | ----------------------------- |
| A          | Entity search                   | FR-SRC-001 to 008             |
| B          | Query and results experience    | FR-SRC-009 to 016             |
| C          | Saved searches, alerts, history | FR-SRC-017 to 019             |
| D          | Permission and privacy          | FR-SRC-020                    |
| E          | Recruiter talent search         | FR-SRC-021 to 024, FR-SRC-035 |
| F          | Index, taxonomy and platform    | FR-SRC-025 to 034             |

## 4. Feature specifications

### Sub-module A: Entity search

### FR-SRC-001 — Global command search

- **Sub-module:** A Entity search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-20 Command Search (⌘K); §11 keyboard shortcuts `⌘K`, `/`, `Esc`, arrow keys]
- **Purpose and outcome:** From any screen the user opens one box, types, and jumps to a result or runs an action. Success is reaching a destination in under 5 seconds without leaving the keyboard.
- **Roles and permissions:** `all signed-in roles: use` · `GUE: public results only`
- **Preconditions and entry points:** Any page. Entry: `⌘K` or `Ctrl+K`, `/` (when not typing in a field), search icon in the header.
- **User interactions and actions:**
  1. Press the shortcut; a modal palette opens with focus in the input and shows "Recent" and "Suggested actions".
  2. Type; results appear grouped: Actions, Jobs, People, Courses, Companies, Challenges, Content, Pages (settings, help).
  3. Use `↑`/`↓` to move, `Enter` to open, `Ctrl/⌘+Enter` to open in a new tab, `Tab` to switch group filter, `Esc` to close.
  4. Type a prefix: `>` for actions only, `@` for people, `#` for skills, `/` for pages.
  5. Press "See all results" (or `Shift+Enter`) to go to the full results page (FR-SRC-002) with the same query.
- **System behaviour:** Query goes to the unified suggest endpoint (≤ 100 ms target for autocomplete, ≤ 300 ms p95 for results `[SRC: SSOT F-147]`), debounced 120 ms; results are limited to 3–5 per group; actions are role-gated and context-aware (e.g., "Post a job" only for REC/EAD). Recent items are kept locally and optionally synced (FR-SRC-019). Results use the same permission filter as full search (BR-SRC-001). The palette caches nothing about other people's private data.
- **UI elements and controls:** Modal dialog (role `dialog`, labelled), combobox input with listbox results, group headings, keyboard hint chips, "See all results" button, loading skeleton, empty state.
- **Configuration options:** Platform: groups, per-group limit, action registry. User: disable palette shortcut (default on), include people in palette (default on).
- **Business rules:** BR-SRC-001, BR-SRC-002, BR-SRC-028, BR-SRC-027.
- **Validation:** query ≤ 256 chars; strips control characters.
- **Inputs and outputs:** In: query text, context (current page). Out: grouped result list with ids, titles, snippets, destination URLs.
- **Filters, sorting, search:** Group filter via prefix or Tab; ranking by relevance with recency boost for recent items.
- **Notifications and communication:** n/a — no notifications.
- **Error handling and edge cases:** Backend slow (> 1 s) → shows skeleton then partial results with note "Some results are still loading". Backend down → degraded mode (FR-SRC-034). Pointer-only users get a visible search button. Screen reader announces "n results available" via live region. Palette opened inside a form → focus returns to the previously focused element on close.
- **Dependencies:** FR-SRC-010, FR-SRC-020, FR-SRC-034, role action registry.
- **Security and privacy:** No personal data of others in suggestions beyond permitted public fields; query text is not logged raw if it matches identifier patterns (BR-SRC-014).
- **Acceptance criteria:**
  1. Given the user presses `⌘K` and types "react", when results load, then grouped results appear and `Enter` opens the focused one.
  2. Given a candidate, when typing `> post job`, then no "Post a job" action appears.
  3. Given a hidden profile that matches the query, when a non-owner searches, then it does not appear. (negative)

### FR-SRC-002 — Search results page and entity tabs

- **Sub-module:** A Entity search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 "unified index... multi-faceted filtering"; F-34 Multi-Entity Backend Search]
- **Purpose and outcome:** A full page presents results by entity type with filters, sorting and paging. Success is a shareable URL that reproduces the results.
- **Roles and permissions:** `GUE (public), all signed-in roles: use`
- **Preconditions and entry points:** Query submitted. Entry: `/search?q=...&type=...`; "See all results".
- **User interactions and actions:**
  1. Submit a query in the header search box.
  2. See tabs: All, Jobs, People, Courses, Companies, Challenges, Content, each with a count.
  3. On "All" see top 3–5 per entity with "See all".
  4. Choose a tab; apply filters (FR-SRC-012) and sort (FR-SRC-013).
  5. Scroll with "Load more" or numbered pages; open a result; use the browser back button to return to the same state.
- **System behaviour:** State (query, tab, filters, sort, cursor) is encoded in the URL so it is shareable and restorable. Counts per tab come from the same permission-filtered queries (approximate above 1000 as "1000+", BR-SRC-021). Result cards use entity-specific templates. Each card has "Why this result" (FR-SRC-015). Cursor-based pagination, 20 per page default, 100 max `[SRC: SSOT F-04]`; deep paging capped at 1000 results (BR-SRC-019).
- **UI elements and controls:** Search input with clear button, tabs with counts, filter panel (collapsible on mobile as a drawer), sort select, result list (`ol`), pagination or "Load more", result count live region.
- **Configuration options:** Platform: page size, tab order. User: default tab, results density (comfortable, compact).
- **Business rules:** BR-SRC-001, BR-SRC-019, BR-SRC-020, BR-SRC-021.
- **Validation:** URL params validated; unknown `type` → "All"; page size 1–100.
- **Inputs and outputs:** In: URL state. Out: result page with facets, counts and cursors.
- **Filters, sorting, search:** As per entity; see FR-SRC-012 and FR-SRC-013.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Invalid cursor (expired) → restart from first page with notice. Query empty and no filters → show recent searches and popular categories rather than everything. Query only stop-words → treated as empty with hint. Shared link with filters the viewer can't use (e.g., recruiter-only filter) → filter dropped with notice.
- **Dependencies:** FR-SRC-003 to 008, FR-SRC-012, FR-SRC-013, FR-SRC-020, FR-SRC-028.
- **Security and privacy:** Shared URLs contain only query parameters, no personal data other than the typed query.
- **Acceptance criteria:**
  1. Given a query and Jobs tab, when the URL is copied and opened by another user, then the same query and filters are applied under that user's permissions.
  2. Given counts above 1000, when displayed, then they show "1000+".
  3. Given an expired cursor, when requested, then the first page loads with a notice instead of an error. (negative)

### FR-SRC-003 — Job search

- **Sub-module:** A Entity search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 steps 1–2 (facets, ranking weights, "Why am I seeing this?"); BR-016 no applications to closed jobs]
- **Purpose and outcome:** Candidates find relevant open jobs with precise filters. Success is a ranked, explainable list with correct freshness.
- **Roles and permissions:** `GUE, CAN, STD, FRL, INS, MNT: search published jobs` · `REC/HMG/EAD: search own org's jobs including drafts and closed`
- **Preconditions and entry points:** Published jobs indexed. Entry: `/jobs`, tab in search, command palette.
- **User interactions and actions:**
  1. Type keywords (title, skill, company) and set location (typeahead with radius) or "Remote".
  2. Apply filters: work mode, job type, level, salary range (and "show jobs without pay"), skills (canonical multi-select), company, posted within (24 h, 7 d, 30 d), easy-apply, visa sponsorship, education level, language, "from verified employers".
  3. Sort by relevance, newest, salary (high to low where disclosed), distance.
  4. Save the search (FR-SRC-017); hide a job; bookmark a job (JOB owns these actions).
- **System behaviour:** Index fields: title, description, requirements, skills (canonical ids), company, location (place id and geo point), work mode, type, level, salary range (if disclosed), posted date, status. Closed or expired jobs are removed from results within 5 minutes and direct links answer 410 `[SRC: SSOT F-04]`. Default relevance ranking uses documented weights: skill match 0.45, experience 0.20, location 0.10, title 0.10, organization rating 0.10, recency 0.05 `[SRC: SSOT F-04]`; the personalized components (skill and experience match) apply only for signed-in users with personalization on (BR-SRC-015); for guests only text relevance, title, location and recency apply. The organization-rating input is retained from legacy with a disclosure and an OD (OD-SRC-03). No paid boosts in organic ranking (BR-SRC-038).
- **UI elements and controls:** Search box, location combobox with radius slider, filter panel, sort select, job cards (title, company, location, work mode, pay, skills chips, posted date, "Why this result"), save-search button.
- **Configuration options:** Platform: ranking profile version, boosts none. User: personalization on/off, default location.
- **Business rules:** BR-SRC-001, BR-SRC-004, BR-SRC-005, BR-SRC-015, BR-SRC-022, BR-SRC-024, BR-SRC-038.
- **Validation:** salary min ≤ max; radius 1–200 km; posted-within enumerated; up to 10 skills.
- **Inputs and outputs:** In: query, filters, sort, cursor. Out: job result cards, facet counts.
- **Filters, sorting, search:** Facets: work mode, type, level, company, skills, location region, posted-within, salary band. Sort: relevance, newest, salary, distance.
- **Notifications and communication:** Saved search alerts (FR-SRC-018).
- **Error handling and edge cases:** Job closes while viewing → card shows "Closed" on click and opens a similar-jobs list. Location unknown → suggestions; if none, ignore location with notice. Salary filter excludes undisclosed pay unless "include jobs without pay" is checked. Duplicate postings (same employer, same text) collapsed with "n similar".
- **Dependencies:** JOB (planned), FR-SRC-010–016, FR-SRC-033.
- **Security and privacy:** Draft and private jobs only to org members; applicant data never indexed.
- **Acceptance criteria:**
  1. Given a closed job, when 5 minutes have passed, then it no longer appears in results.
  2. Given a salary filter 80–100k, when applied, then jobs without disclosed pay are excluded unless the include option is checked.
  3. Given a guest, when searching, then no personalized score components are used. (negative)

### FR-SRC-004 — People search

- **Sub-module:** A Entity search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 (people in unified index)]; [PROP] design
- **Purpose and outcome:** Users find other professionals (to connect, message, mentor or invite) within each person's privacy settings. Success is correct, privacy-respecting results.
- **Roles and permissions:** `CAN/STD/FRL/INS/MNT/REC/HMG/EAD: search` · `GUE: only people with indexable public profiles, capped` · `IAD/PLO: institution members within scope`
- **Preconditions and entry points:** Entry: `/search?type=people`, `@` prefix in palette, network pages.
- **User interactions and actions:**
  1. Search by name, headline, skill, company, school, or location.
  2. Filter by: connection degree (1st, 2nd, others), current company, past company, school, location, skills, languages, industry, "open to mentoring" (MNT), "open to freelance" (FRL).
  3. Open a profile, connect, message (NET and MSG, planned).
- **System behaviour:** Only profiles that are `published`, not suspended, not blocked for the viewer, and whose visibility allows the viewer appear (BR-SRC-001, BR-SRC-036). Snippets show only fields visible to the viewer. Recruiter-style filters (availability, salary, work authorization, evidence rung) are not available here (FR-SRC-021 only). Name search supports transliteration and diacritics. Results for guests show only users who enabled search-engine visibility (PRF BR-PRF-038) and are capped at 20 results with no deep paging (BR-SRC-026). Suggestions never list people who haven't made their profile discoverable to that viewer class.
- **UI elements and controls:** People cards (photo, name, headline, location, mutual connections, top skills, "Connect"), filter panel.
- **Configuration options:** Platform: guest cap. User: "Appear in people search" (via PRF visibility and SET).
- **Business rules:** BR-SRC-001, BR-SRC-003, BR-SRC-026, BR-SRC-035, BR-SRC-036.
- **Validation:** query ≥ 2 chars for people; name queries rate limited (FR-SRC-029).
- **Inputs and outputs:** In: query, filters. Out: people cards.
- **Filters, sorting, search:** Sort: relevance (default), mutual connections, recent activity (only if the person allows activity display).
- **Notifications and communication:** None.
- **Error handling and edge cases:** Person changes visibility while results are displayed → card click shows 404-equivalent. Common names → disambiguation by company and location in cards. Under-18 accounts never indexed for general people search.
- **Dependencies:** PRF visibility (FR-PRF-013/016/017), NET (planned), FR-SRC-020.
- **Security and privacy:** No contact data indexed; scraping defenses (FR-SRC-029); blocked parties receive empty results as if the person didn't exist.
- **Acceptance criteria:**
  1. Given a person with Experience set to Connections, when a stranger searches their former employer, then the person is not matched through that field.
  2. Given a viewer blocked by the person, when searching the person's exact name, then the person does not appear.
  3. Given a guest, when requesting page 2 of people results, then it is refused. (negative)

### FR-SRC-005 — Course search

- **Sub-module:** A Entity search
- **Priority / tier:** Must · R3
- **Source:** [SRC: SSOT F-147; F-07 LMS]; [PROP] facets
- **Purpose and outcome:** Learners find courses by topic, skill, level and format. Success is relevant, current course listings with transparent ranking.
- **Roles and permissions:** `GUE, CAN, STD, INS, MNT, REC: search published courses` · `IAD: also institution-private courses` · `INS: own drafts`
- **Preconditions and entry points:** Published courses indexed. Entry: `/learn`, tab in search.
- **User interactions and actions:**
  1. Query by topic, skill, instructor or institution.
  2. Filter: skill, level, format (video, text, interactive, live), duration band, language, price (free, paid, subscription), rating (≥ 4), certificate offered, institution, "has captions".
  3. Sort: relevance, newest, rating, shortest, popularity.
- **System behaviour:** Indexed fields: title, outcomes, skills, syllabus text, instructor, institution, level, format, language, duration, price class, rating summary (shown only above a minimum review count), update date. Institution-private and draft courses appear only for authorized users. Ranking: text relevance, skill match to query, quality signals (completion rate, rating with minimum n, content freshness), not instructor or institution payment (BR-SRC-038). Courses with accessibility features can be filtered (captions, transcripts).
- **UI elements and controls:** Course cards (title, instructor, level, duration, rating, price), filter panel, sort select.
- **Configuration options:** Platform: ranking profile; minimum review count for rating (default 5 `[PROP]`).
- **Business rules:** BR-SRC-001, BR-SRC-004, BR-SRC-022, BR-SRC-038.
- **Validation:** price and duration ranges valid; rating filter 1–5.
- **Inputs and outputs:** In: query, filters. Out: course cards.
- **Filters, sorting, search:** As above.
- **Notifications and communication:** Saved search alerts (FR-SRC-018) for new courses matching.
- **Error handling and edge cases:** Course unpublished → removed ≤ 15 minutes. Learner already enrolled → card shows "Continue". Language filter with no results → suggests other languages.
- **Dependencies:** LRN, STU (planned), INS (planned), FR-SRC-014.
- **Security and privacy:** Private institution courses never leak in counts.
- **Acceptance criteria:**
  1. Given a free-course filter, when applied, then only free courses appear.
  2. Given a course with 2 reviews, when displayed, then no star rating is shown.
  3. Given an institution-private course, when a non-member searches its exact title, then it doesn't appear. (negative)

### FR-SRC-006 — Company search

- **Sub-module:** A Entity search
- **Priority / tier:** Should · R2
- **Source:** [SRC: SSOT F-147 (companies); F-56 Organization & Institution Pages]
- **Purpose and outcome:** Users find employers and institutions and check their jobs and information. Success is correct organization matches with verified status.
- **Roles and permissions:** `all: search public organization pages`
- **Preconditions and entry points:** Organization pages published (EMP planned). Entry: tab in search; `/companies`.
- **User interactions and actions:**
  1. Query by name, industry or location.
  2. Filter: industry, size band, location, "verified employer", "hiring now", institution type.
  3. Open a company page; follow; view jobs.
- **System behaviour:** Organization name matching handles legal-name variants and common abbreviations (alias list). "Verified employer" is a status from EMP. "Hiring now" means ≥ 1 open job. Duplicate organizations are merged via an alias map managed by EMP and PAD. No ratings are shown unless EMP publishes aggregated reviews meeting thresholds (MKT/EMP rules).
- **UI elements and controls:** Company cards (logo, name, industry, location, verified badge, open jobs count).
- **Configuration options:** Platform: size bands.
- **Business rules:** BR-SRC-001, BR-SRC-004.
- **Validation:** query ≥ 2 chars.
- **Inputs and outputs:** In: query, filters. Out: company cards.
- **Filters, sorting, search:** Sort: relevance, most open jobs, alphabetical.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Company with the same name in different countries → location shown. Suspended company → hidden. Claimed vs unclaimed pages labeled.
- **Dependencies:** EMP (planned), FR-SRC-003.
- **Security and privacy:** Only public organization data indexed.
- **Acceptance criteria:**
  1. Given "Acme Inc" and "ACME Incorporated" in the alias map, when searching "acme inc", then one entry appears.
  2. Given "hiring now", when applied, then only organizations with open jobs show.
  3. Given a suspended company, when searched by exact name, then it doesn't appear. (negative)

### FR-SRC-007 — Challenge search

- **Sub-module:** A Entity search
- **Priority / tier:** Should · R3
- **Source:** [SRC: SSOT F-147; F-08 Challenges Arena]; [PROP] facets
- **Purpose and outcome:** Candidates find practice challenges, contests and assessments by skill and difficulty. Success is a relevant list with status and eligibility.
- **Roles and permissions:** `GUE (public challenges), CAN, STD, INS, REC (own org assessments): search`
- **Preconditions and entry points:** Entry: `/challenges`, search tab.
- **User interactions and actions:**
  1. Query by title, skill, language or topic.
  2. Filter: skill, difficulty, type (practice, contest, assessment, hackathon task), language/runtime, duration, status (open, upcoming, closed), "I haven't attempted", "has certificate".
  3. Sort: relevance, newest, most attempted, difficulty.
- **System behaviour:** Index covers public and eligible challenges only; private assessments (recruiter custom assessments) are never searchable by candidates; custom assessment search is available only to the creating org. Attempt status for the viewer is joined at render time. Hidden test cases and solutions are never indexed. Contest challenges before start show title and date only.
- **UI elements and controls:** Challenge cards (difficulty badge text, skills, status, duration).
- **Configuration options:** Platform: difficulty scale.
- **Business rules:** BR-SRC-001, BR-SRC-002.
- **Validation:** enumerated filters.
- **Inputs and outputs:** In: query, filters. Out: challenge cards.
- **Filters, sorting, search:** As above.
- **Notifications and communication:** Alerts for new challenges by skill (FR-SRC-018).
- **Error handling and edge cases:** Challenge withdrawn after contest integrity issue → removed. Time zones for start times use viewer's zone.
- **Dependencies:** ASM (planned).
- **Security and privacy:** Solutions and hidden tests never indexed; assessments invitation-only are excluded.
- **Acceptance criteria:**
  1. Given the skill filter "SQL", when applied, then only SQL challenges appear.
  2. Given "I haven't attempted", when applied, then challenges with an attempt by the viewer are excluded.
  3. Given an invitation-only custom assessment, when a candidate searches its title, then it doesn't appear. (negative)

### FR-SRC-008 — Content search (posts, articles, discussions, events)

- **Sub-module:** A Entity search
- **Priority / tier:** Should · R3
- **Source:** [SRC: SSOT F-147 (discussions, articles, events); F-54 Content Publishing]
- **Purpose and outcome:** Users find posts, articles, newsletters, discussions and events they are allowed to see. Success is relevant, permission-correct content results.
- **Roles and permissions:** `GUE (public content), signed-in roles per post visibility`
- **Preconditions and entry points:** Content published (NET, EVT planned). Entry: tab Content, group in palette.
- **User interactions and actions:**
  1. Query keywords, hashtags (`#python`) or author (`@name`).
  2. Filter: type (post, article, discussion, event, newsletter), date range, author, community, language, "from my network".
  3. Sort: relevance, newest.
- **System behaviour:** Visibility (public, connections, organization, private) enforced per item against the viewer (BR-SRC-001). Edited or deleted content reindexes/removes within 5 minutes. Ranking: text relevance, recency, quality signals (reports, engagement), not purely popularity; a chronological sort is always offered `[SRC: SSOT BR-124 analog]`. Muted or blocked authors are excluded for the viewer. Moderated content removed by TSF is purged from the index immediately.
- **UI elements and controls:** Content cards with type badge, snippet with highlighted terms, author, date.
- **Configuration options:** Platform: quality signal weights.
- **Business rules:** BR-SRC-001, BR-SRC-003, BR-SRC-022.
- **Validation:** date range valid; hashtag format.
- **Inputs and outputs:** In: query, filters. Out: content cards.
- **Filters, sorting, search:** As above.
- **Notifications and communication:** Alerts (FR-SRC-018) for saved content searches.
- **Error handling and edge cases:** Content deleted after click → 404 page with search link. Language mismatch → language badge.
- **Dependencies:** NET, EVT (planned), TSF (planned).
- **Security and privacy:** Private content only to authorized audiences; highlights never show text from non-visible fields.
- **Acceptance criteria:**
  1. Given a connections-only post, when a non-connection searches its text, then it doesn't appear.
  2. Given "sort newest", when selected, then results order by date desc.
  3. Given a post removed by moderation, when searched within a minute, then it doesn't appear. (negative)

### Sub-module B: Query and results experience

### FR-SRC-009 — Query syntax and operators

- **Sub-module:** B Query and results experience
- **Priority / tier:** Should · R2
- **Source:** [PROP]
- **Purpose and outcome:** Users can express precise queries; casual users aren't punished by syntax. Success is predictable behavior for quoted phrases, exclusion and fields.
- **Roles and permissions:** `all: use` · `talent search: extended boolean (FR-SRC-021)`
- **Preconditions and entry points:** Any search box.
- **User interactions and actions:**
  1. Type words (implicit AND); `"exact phrase"` for phrases; `-word` to exclude; `OR` between terms; `title:engineer` or `company:acme` for fields; `skill:python`.
  2. Press the "?" syntax help link to see examples.
  3. When the syntax is invalid (unmatched quote), the system searches as plain words and shows a hint.
- **System behaviour:** Parser produces a structured query tree; field operators map only to allowed fields per entity; unknown fields are treated as plain text. Complexity limits: ≤ 256 characters, ≤ 20 terms, ≤ 5 nested groups; talent search allows ≤ 15 clauses (BR-SRC-027). Quoted phrases and field-prefixed values disable typo tolerance and synonyms for those parts. Operators are language-independent.
- **UI elements and controls:** Search input, inline hint chip showing interpreted query ("Searching for: …"), syntax help popover.
- **Configuration options:** Platform: allowed fields per entity.
- **Business rules:** BR-SRC-027, BR-SRC-016, BR-SRC-017.
- **Validation:** length and term limits; `-` only as prefix of a term.
- **Inputs and outputs:** In: raw query. Out: parsed query tree and interpretation text.
- **Filters, sorting, search:** n/a — parser.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Query over limit → truncated with notice. Only exclusions (`-word`) → hint "Add a word to search". Operator-injection attempts (`*`, regex characters) are escaped.
- **Dependencies:** FR-SRC-011, FR-SRC-014.
- **Security and privacy:** Parser is safe against query injection; no raw engine syntax passes through.
- **Acceptance criteria:**
  1. Given `"data analyst" -intern`, when searched, then results contain the phrase and exclude "intern".
  2. Given `skill:python`, when searched, then it matches the canonical skill.
  3. Given a regex-like input `.*`, when searched, then it is treated as text. (negative)

### FR-SRC-010 — Autocomplete and suggestions

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 "autocomplete < 100ms"; F-84 typeahead over `canonical_name` + `aliases`]
- **Purpose and outcome:** As the user types, relevant completions and entities appear fast. Success is p95 under 100 ms for completion lists.
- **Roles and permissions:** `all: use`
- **Preconditions and entry points:** Focus in a search box or an entity picker (skill, location, company).
- **User interactions and actions:**
  1. Type 2+ characters; suggestions appear in a listbox: query completions, matching entities (skills, companies, titles), recent searches.
  2. Arrow keys move; `Enter` selects; `Esc` closes; `→` accepts inline completion.
  3. Selecting a skill or company applies it as a filter chip rather than text.
- **System behaviour:** Prefix and fuzzy matching over a dedicated suggest index built from: popular queries (anonymized, min frequency threshold), titles, canonical skills with aliases, company names, place names. Suggestions are permission-safe: people names appear only for entities the viewer may see; popular-query suggestions require ≥ 20 distinct users to prevent leaking rare or personal queries (BR-SRC-014). Offensive and sensitive completions are blocked (BR-SRC-035). Debounce 100 ms; cancels stale requests.
- **UI elements and controls:** Combobox with `aria-expanded`, `aria-activedescendant`, highlighted matched text, entity-type icons with labels, "remove from history" `x` on recent items.
- **Configuration options:** Platform: min chars (2), max suggestions (8), blocklist. User: show recent searches.
- **Business rules:** BR-SRC-001, BR-SRC-014, BR-SRC-035.
- **Validation:** length ≤ 100 for suggest queries.
- **Inputs and outputs:** In: prefix, context entity. Out: suggestions list.
- **Filters, sorting, search:** Ranked by prefix match, popularity, personalization (if on), entity type context.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Slow response → previous suggestions remain until new arrive (no flicker). No suggestions → list hidden. Right-to-left languages supported.
- **Dependencies:** FR-SRC-011, FR-SRC-014, FR-SRC-019, FR-SRC-030.
- **Security and privacy:** No suggestion derived from a single user's private activity for others.
- **Acceptance criteria:**
  1. Given typing "pyth", when suggestions load, then "Python" skill appears within 100 ms p95.
  2. Given a rare query typed by only 3 users, when others type its prefix, then it is not suggested.
  3. Given a private person's name, when a non-permitted viewer types it, then no suggestion appears. (negative)

### FR-SRC-011 — Typo tolerance and spelling correction

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 "typo tolerance active"; audit tests cite Levenshtein fuzzy scoring BR-266]
- **Purpose and outcome:** Misspelled queries still find the right items without surprising rewrites. Success is correct results for 1–2 character errors and a visible correction message.
- **Roles and permissions:** `all: use`
- **Preconditions and entry points:** Any text query.
- **User interactions and actions:**
  1. Type "javascirpt developer".
  2. See results for "javascript developer" with a line "Showing results for javascript developer. Search instead for javascirpt developer".
  3. Click "Search instead for…" to force literal search.
- **System behaviour:** Edit distance 1 allowed for terms of 4–7 chars, 2 for ≥ 8 chars; none for ≤ 3 chars and for quoted, field-prefixed or numeric tokens (BR-SRC-016). High-confidence corrections (the corrected form has substantially more matches or is a known entity) are applied automatically with a visible notice; low-confidence ones show "Did you mean…" without changing results. Corrections use taxonomy terms, titles and company names as the dictionary, not the raw query log, to avoid propagating misspellings. Transposition and keyboard-neighbor errors count as one edit.
- **UI elements and controls:** Correction banner with "Search instead" link, "Did you mean" link.
- **Configuration options:** Platform: edit-distance thresholds, confidence cutoffs.
- **Business rules:** BR-SRC-016, BR-SRC-017.
- **Validation:** n/a.
- **Inputs and outputs:** In: terms. Out: corrected terms and confidence.
- **Filters, sorting, search:** Exact matches rank above fuzzy matches.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Names (people, companies) are corrected conservatively (never auto-rewritten in people search). Languages without dictionaries → fuzzy only. Correction yields zero results → revert to literal and show zero-results guidance.
- **Dependencies:** FR-SRC-010, FR-SRC-030.
- **Security and privacy:** Corrections never expose entities not permitted.
- **Acceptance criteria:**
  1. Given "javascirpt", when searched in jobs, then JavaScript jobs appear with a correction notice.
  2. Given a quoted phrase with a typo, when searched, then no correction is applied.
  3. Given a 3-character term "sql" mistyped "sqk", when searched, then no automatic correction occurs. (negative)

### FR-SRC-012 — Filters and facets

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 step 1 "filters are URL-encoded (shareable)"; F-147 multi-faceted filtering]
- **Purpose and outcome:** Users narrow results with typed filters and see counts that help rather than mislead. Success is consistent filter behavior across entities.
- **Roles and permissions:** `all: use (filters availability per role and entity)`
- **Preconditions and entry points:** Results page or entity page.
- **User interactions and actions:**
  1. Open the filter panel (side panel on desktop, drawer on mobile).
  2. Select facet values (checkboxes), enter ranges (min/max inputs), pick dates, toggle switches.
  3. See active filters as removable chips and a "Clear all" button.
  4. See facet counts update after each change ("disjunctive" counts for the facet being edited).
  5. Press "Show more" to expand long facets with an in-facet search.
- **System behaviour:** Filters of the same facet are OR; across facets AND. Facet counts are computed under the viewer's permissions, approximate above 1000 ("1000+"), and for people facets suppressed below k = 5 to avoid re-identification of rare combinations (BR-SRC-021). Filter state is in the URL. A facet value that yields no results is hidden or disabled with count 0. Skill facets use canonical skill ids and include hierarchical expansion one level by default (BR-SRC-018).
- **UI elements and controls:** Checkbox groups with counts, range inputs, date pickers, switches, chips, "Clear all", "Show more", apply button on mobile.
- **Configuration options:** Platform: facets per entity, max values shown (10).
- **Business rules:** BR-SRC-018, BR-SRC-020, BR-SRC-021.
- **Validation:** ranges valid; unknown facet values are dropped with a notice.
- **Inputs and outputs:** In: filter selections. Out: facet buckets and results.
- **Filters, sorting, search:** n/a — this feature is the filter mechanism.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Conflicting filters (min > max) → inline error. Filter on a deprecated skill → remapped via taxonomy redirect with notice. Facet service timeout → results shown without counts and a notice.
- **Dependencies:** FR-SRC-020, FR-SRC-030.
- **Security and privacy:** Counts never reveal hidden entities; small-cell suppression.
- **Acceptance criteria:**
  1. Given two selected work modes, when applied, then results match either mode.
  2. Given a people facet with fewer than 5 matches, when displayed, then the count is suppressed.
  3. Given a filter value not in the allowed list, when passed in the URL, then it is dropped. (negative)

### FR-SRC-013 — Sorting

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 "Default sort: relevance"; F-92 "Sort options: relevance, recent activity, readiness score"]
- **Purpose and outcome:** Users change result order with clear, predictable options. Success is stable, explained ordering.
- **Roles and permissions:** `all: use`
- **Preconditions and entry points:** Results list.
- **User interactions and actions:**
  1. Open the Sort select; options depend on the entity.
  2. Pick one; the URL updates and the first page reloads.
- **System behaviour:** Options: Jobs (relevance, newest, salary, distance), People (relevance, mutual connections), Courses (relevance, newest, rating, duration, popularity), Companies (relevance, open jobs, A–Z), Challenges (relevance, newest, most attempted, difficulty), Content (relevance, newest), Talent search (relevance, recent activity if allowed, evidence strength, availability; see FR-SRC-021). Ties are broken by stable secondary keys (recency then id) so paging is deterministic. "Newest" uses the publication date, not edit date, so reposting or editing can't game order. Sorting by an attribute that is only available for some items puts items missing the attribute last.
- **UI elements and controls:** Select (listbox pattern), current sort label.
- **Configuration options:** Platform: options per entity; user: default sort per entity (saved).
- **Business rules:** BR-SRC-022.
- **Validation:** sort key must be in the entity's allowed list.
- **Inputs and outputs:** In: sort key. Out: ordered results.
- **Filters, sorting, search:** This feature is the sort mechanism.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Invalid sort in URL → default sort with notice. Distance sort without location → disabled with hint.
- **Dependencies:** FR-SRC-015, FR-SRC-033.
- **Security and privacy:** Recent-activity sort only if the person allows activity display.
- **Acceptance criteria:**
  1. Given "newest", when selected, then results are ordered by publication date.
  2. Given distance sort and no location, when attempted, then it's disabled with a hint.
  3. Given a sort key `salary` on the courses tab via URL, when loaded, then it falls back to relevance. (negative)

### FR-SRC-014 — Synonyms and skills taxonomy expansion

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-84 (aliases, relationships, canonical skills); BR-141, BR-144, BR-146]; [PROP] disclosure to user
- **Purpose and outcome:** A search for one term also finds equivalent terms and related skills, visibly. Success is better recall without hidden surprises.
- **Roles and permissions:** `all: benefit` · `taxonomy editor: curate (FR-SRC-030)`
- **Preconditions and entry points:** Any text or skill search.
- **User interactions and actions:**
  1. Search "JS developer".
  2. See results including "JavaScript" and an inline note "Also showing: JavaScript. Search only for exact terms".
  3. Click the note to see the expansion list and toggle off individual expansions.
  4. In skill facets, selecting "Python" optionally includes sub-skills (e.g., "Django") when the user ticks "Include related skills".
- **System behaviour:** Expansion sources: (a) aliases of canonical skills (JS to JavaScript) always; (b) curated synonym sets (e.g., "UX designer" and "user experience designer"); (c) hierarchical children (one hop default, max 5 hops overall `[SRC: SSOT BR-146]`) only when the user opts in; (d) `correlates_with` is never used for retrieval (recommendation only). Expansions are directional (e.g., "software engineer" includes "backend engineer" but not vice versa) and cross-language for skills. Expansion terms are scored lower than exact matches. Quoted terms and `skill:` fields suppress expansions.
- **UI elements and controls:** Expansion notice with popover, toggle switches for each expansion, "Include related skills" checkbox in skill facet.
- **Configuration options:** Platform: synonym sets, expansion depth. User: turn off expansions globally (default on).
- **Business rules:** BR-SRC-017, BR-SRC-018, BR-SRC-016.
- **Validation:** expansion depth ≤ 5.
- **Inputs and outputs:** In: terms. Out: expanded term set and the explanation.
- **Filters, sorting, search:** Ranking: exact > alias > synonym > related.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Ambiguous alias (e.g., "Go" language vs verb) → only expanded in skill context or with disambiguation; term mapped to multiple skills → suggests choices. Deprecated skill alias → redirected via `supersedes`.
- **Dependencies:** FR-SRC-030, EVD/PRF skill references.
- **Security and privacy:** None beyond standard.
- **Acceptance criteria:**
  1. Given "JS", when searching jobs, then jobs tagged JavaScript appear and the notice lists JavaScript.
  2. Given the user toggles off the expansion, when results refresh, then only literal "JS" matches appear.
  3. Given a quoted `"JS"`, when searched, then no expansion is applied. (negative)

### FR-SRC-015 — Ranking and ranking transparency

- **Sub-module:** B Query and results experience
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 step 2 "Why am I seeing this?" disclosure; F-147 ranking relevance + recency + engagement + quality; BR-124 analog "ranking factors disclosed on demand"]
- **Purpose and outcome:** Every ranked list can explain itself. Success is a per-result and per-list explanation that matches how ranking really works.
- **Roles and permissions:** `all: view explanations` · `PAD: manage ranking profiles (FR-SRC-027)`
- **Preconditions and entry points:** Results list. Entry: "Why this result" link on each card; "How results are ranked" link on page footer.
- **User interactions and actions:**
  1. Click "Why this result" to open a popover: matched terms, matched skills, filters satisfied, boosts applied (recency, location), personalization influence (if any), and any expansion used.
  2. Click "How results are ranked" to open the public explanation page per entity: inputs, what is not used (protected attributes, payment), and when it was last changed.
- **System behaviour:** The ranking service returns, for each result, a structured explanation (feature contributions grouped into human-readable reasons, top 3–5). Explanations are generated from the same scoring features, not separately authored text, and tested for consistency (BR-SRC-004). Ranking profiles are versioned with a public changelog (BR-SRC-030). Protected attributes and paid placement are never ranking inputs (BR-SRC-004, BR-SRC-038). Personalization reasons ("Because you viewed similar jobs") appear only if personalization is on.
- **UI elements and controls:** "Why this result" button (focusable, popover with Esc), "How results are ranked" page.
- **Configuration options:** Platform: ranking profile per entity; disclosure copy.
- **Business rules:** BR-SRC-004, BR-SRC-005, BR-SRC-030, BR-SRC-039.
- **Validation:** explanation must exist for every ranked result (contract test).
- **Inputs and outputs:** In: result id and query context. Out: explanation object.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Explanation service failure → popover shows "Explanation unavailable" and results still render. Sorted-by-newest lists explain "Sorted by date, not relevance".
- **Dependencies:** FR-SRC-027, FR-SRC-016.
- **Security and privacy:** Explanations never reveal other users' private data or exact scores for talent search candidates beyond criteria matched.
- **Acceptance criteria:**
  1. Given a job result, when "Why this result" is opened, then it lists matched skills and recency boost consistent with scoring.
  2. Given personalization is off, when opened, then no personalized reason appears.
  3. Given a request for an explanation of a result not visible to the viewer, when sent, then 404. (negative)

### FR-SRC-016 — Personalization controls

- **Sub-module:** B Query and results experience
- **Priority / tier:** Should · R3
- **Source:** [SRC: SSOT F-147 "personalization (based on user history)"]; control [PROP]
- **Purpose and outcome:** Users choose whether their activity shapes their own results. Success is a clear switch with immediate effect and data deletion.
- **Roles and permissions:** `all signed-in: control own`
- **Preconditions and entry points:** Settings > Search; banner on first search ("Personalize results?").
- **User interactions and actions:**
  1. Toggle "Use my activity to improve my results" (default on for signed-in users `[PROP]` OD-SRC-05).
  2. Choose which signals count: searches, views, saves, applications.
  3. Press "Clear my search activity" to delete stored signals.
- **System behaviour:** Personalization features are computed per user from the allowed signals and used only for that user's own results; off means ranking uses only query, filters and public item signals. Turning off deletes the personalization profile within 24 h and ranking stops using it immediately. Personalization is never used for recruiter talent search of candidates (BR-SRC-015) and never uses protected attributes. The "Why" popover reflects the setting.
- **UI elements and controls:** Switch with description, per-signal checkboxes, "Clear" button with confirmation.
- **Configuration options:** Platform: default state (OD-SRC-05); user: switches.
- **Business rules:** BR-SRC-015, BR-SRC-014.
- **Validation:** n/a.
- **Inputs and outputs:** In: settings. Out: updated settings and deletion confirmation.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Confirmation toast.
- **Error handling and edge cases:** Deletion job delay → ranking stops using signals at once. Region with consent-first law → default off (SET region rules).
- **Dependencies:** SET (planned), FR-SRC-015.
- **Security and privacy:** Signals are stored per user with pseudonymous ids; deletion verified.
- **Acceptance criteria:**
  1. Given the switch off, when searching jobs, then no personalized reasons appear.
  2. Given "Clear my search activity", when pressed, then the personalization profile is deleted within 24 h.
  3. Given a recruiter doing talent search, when personalization is on for their own account, then it does not affect candidate ranking. (negative)

### Sub-module C: Saved searches, alerts, history

### FR-SRC-017 — Saved searches

- **Sub-module:** C Saved searches, alerts, history
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 step 7; F-32 Saved Searches & Job Alerts]
- **Purpose and outcome:** Users save a query-with-filters to reuse and monitor it. Success is a named saved search that reproduces results.
- **Roles and permissions:** `CAN/STD/FRL/INS/MNT/REC/HMG/EAD/IAD: create, edit, delete own`
- **Preconditions and entry points:** Signed in; a search with at least one query or filter. Entry: "Save search" button on results.
- **User interactions and actions:**
  1. Press "Save search"; enter a name (default suggested from the query); choose alert frequency (none, instant, daily, weekly).
  2. See saved searches at `/searches`; run, rename, edit filters, pause, delete.
  3. Open a saved search; it loads the URL state with a badge "n new since last visit".
- **System behaviour:** Stored as a structured query (entity, terms, filters, sort) and not a raw URL. Limit 25 per user `[PROP]` (BR-SRC-011). Duplicate detection warns if an identical search exists. "New since last visit" counts compare to the stored last-seen watermark. Talent searches are saved separately (FR-SRC-021) with additional audit and entitlements. Saved searches with filters that later become invalid (deprecated skill) are migrated via taxonomy redirects.
- **UI elements and controls:** Save dialog (name input, frequency select), list with menu (Run, Edit, Pause, Delete), "n new" badge, limit meter.
- **Configuration options:** Platform: limit; user: default frequency.
- **Business rules:** BR-SRC-011, BR-SRC-012.
- **Validation:** name 1–60 chars; unique per user; frequency enumerated.
- **Inputs and outputs:** In: structured query, name, frequency. Out: saved search record.
- **Filters, sorting, search:** List sorted by last used; text filter by name.
- **Notifications and communication:** Alerts per FR-SRC-018.
- **Error handling and edge cases:** 26th search → "Delete one to save another". Entity no longer available (e.g., feature disabled) → search paused with notice. Saved search by a user who later loses entitlement (recruiter plan) → paused, not deleted.
- **Dependencies:** SM-SRC-01, FR-SRC-018, ENT-SRC-04.
- **Security and privacy:** Saved queries are personal data; included in export and erasure; never visible to others.
- **Acceptance criteria:**
  1. Given a job search with filters, when saved, then opening it reproduces the same filters.
  2. Given 25 saved searches, when saving a 26th, then it is rejected with the limit message.
  3. Given another user's saved search id, when requested, then 404. (negative)

### FR-SRC-018 — Search alerts

- **Sub-module:** C Saved searches, alerts, history
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-04 step 7 "Job alert emails sent when new matches appear (new-only, no backfill)"; F-32]
- **Purpose and outcome:** Users are told about new matching items at the frequency they choose. Success is timely, non-duplicative, permission-safe alerts.
- **Roles and permissions:** `owner: configure` · `system: evaluate and send`
- **Preconditions and entry points:** Saved search with frequency ≠ none. Entry: saved search settings; alert email links.
- **User interactions and actions:**
  1. Choose frequency and channels (email, push, in-app) per saved search.
  2. Receive an alert with up to 10 new items, a "See all n new" link and "Why you got this" text.
  3. Press "Unsubscribe" (one click) or "Pause 30 days" from the alert.
- **System behaviour:** Evaluation job runs per frequency: instant (within 15 min of indexing for matching new items), daily digest (local 8:00 `[PROP]`), weekly. Only items created or newly matching since the last evaluation are included (no backfill on first save) `[SRC: SSOT F-04]`. Items are re-checked against the viewer's permissions and current status at send time (BR-SRC-012). Digest dedupes items already alerted. Rate limit: max 3 instant emails per day per user, overflow rolls into digest `[PROP]`. Searches unopened for 90 days with no clicks trigger a "still interested?" prompt, then auto-pause after 14 more days. One-click unsubscribe headers (RFC 8058) are included `[SRC: SSOT BR-123 analog]`.
- **UI elements and controls:** Frequency select, channel checkboxes, alert email template (`src.alert.digest`), unsubscribe and pause links.
- **Configuration options:** User: frequency, channels, quiet hours (via NTF). Platform: caps.
- **Business rules:** BR-SRC-011, BR-SRC-012, BR-SRC-037.
- **Validation:** channel must be enabled by the user in NTF preferences.
- **Inputs and outputs:** In: saved search and watermark. Out: alert deliveries.
- **Filters, sorting, search:** Items ordered by relevance then date.
- **Notifications and communication:** Email, push, in-app via NTF; opt-out class `search_alerts`.
- **Error handling and edge cases:** Search returns > 10 new → top 10 and the "n more" link. Alert evaluation failure → retried; no duplicate sends (idempotency key = search id + window). User blocked or entitlement lapsed → alert skipped and paused. Item removed before send → omitted.
- **Dependencies:** NTF (planned), SM-SRC-01, ENT-SRC-05, ENT-SRC-06.
- **Security and privacy:** Alert content contains only items the user can see; emails avoid sensitive snippets.
- **Acceptance criteria:**
  1. Given a daily alert, when 3 new matching jobs are indexed, then one digest lists them once.
  2. Given a job closed before the send, when the digest is built, then it is excluded.
  3. Given the user unsubscribes by one click, when the next evaluation runs, then no further alert is sent. (negative)

### FR-SRC-019 — Recent searches and history management

- **Sub-module:** C Saved searches, alerts, history
- **Priority / tier:** Should · R2
- **Source:** [PROP]
- **Purpose and outcome:** Users quickly repeat past searches and can control or erase them. Success is a private, deletable list.
- **Roles and permissions:** `signed-in users: view, delete, pause own history` · `GUE: device-local only`
- **Preconditions and entry points:** Focus in an empty search box; Settings > Search.
- **User interactions and actions:**
  1. See "Recent searches" (up to 20) when the box is focused; click to rerun; `x` removes one.
  2. Open Settings > Search history; "Clear all"; toggle "Save my searches" (default on).
  3. "Pause history" stops recording until resumed.
- **System behaviour:** History entries (query, entity, filters, time) are stored per user (server-side if signed in so they sync across devices; device-local for guests, in browser storage and optional). Retention 90 days `[PROP]` (OD-SRC-06). Queries matching identifier patterns (email, phone, national id formats, card numbers) are not stored (BR-SRC-014). Deleted entries are removed from personalization signals. History is never visible to other users or recruiters.
- **UI elements and controls:** Recent list, remove buttons, settings switch, "Clear all" with confirm.
- **Configuration options:** Platform: retention, max entries. User: pause.
- **Business rules:** BR-SRC-013, BR-SRC-014.
- **Validation:** n/a.
- **Inputs and outputs:** In: queries. Out: list.
- **Filters, sorting, search:** Most recent first; dedupe identical queries.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Storage unavailable (private browsing) → feature degrades silently. History paused → no list shown with note. Account erased → all deleted.
- **Dependencies:** SET (planned), ENT-SRC-03.
- **Security and privacy:** Server-side history encrypted at rest; excluded from analytics at the user level.
- **Acceptance criteria:**
  1. Given a search, when the box is focused later, then the query appears in Recent.
  2. Given "Clear all", when confirmed, then the list is empty on all devices.
  3. Given a query containing a phone number pattern, when searched, then it is not saved to history. (negative)

### Sub-module D: Permission and privacy

### FR-SRC-020 — Permission and visibility filter (RLS-safe search)

- **Sub-module:** D Permission and privacy
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 "RLS scoping, 0 RLS leakage"; F-92 "Zero stealth-mode leakage"; F-12 section visibility]
- **Purpose and outcome:** Search results, counts, facets, suggestions and alerts respect every visibility and privacy rule, in real time. Success is zero leakage in audits.
- **Roles and permissions:** `system: enforce` · `SAD: audit`
- **Preconditions and entry points:** Every query.
- **User interactions and actions:**
  1. Users see only items permitted to them; no visible controls other than the owner-side settings in PRF/EMP/NET.
  2. SAD runs leakage audits using synthetic viewers.
- **System behaviour:** Two layers: (1) index-time document ACL (audience class, org ids, owner id, visibility flags per field-group) and (2) query-time permission checks against the source of truth for the final result page (re-check at hydration), so lag in indexing never exposes data (BR-SRC-001, BR-SRC-003). Fields are indexed into audience-specific field groups (public, connections, recruiter, owner) so a match on a non-visible field-group is never produced and highlights never use them. Blocks, stealth, discoverability, under-18 exclusion, suspended and erased entities are enforced here. Counts and facets are computed from permission-filtered candidate sets. A synthetic leakage test suite runs in CI and nightly in production with canary entities.
- **UI elements and controls:** none (admin audit dashboard: SCR-SRC-026).
- **Configuration options:** Platform: audience classes, re-check policy (always for people and private content).
- **Business rules:** BR-SRC-001, BR-SRC-002, BR-SRC-003, BR-SRC-007, BR-SRC-036.
- **Validation:** every indexable document must declare an audience policy or it is rejected.
- **Inputs and outputs:** In: viewer context, candidate hits. Out: permitted hits.
- **Filters, sorting, search:** n/a — enforcement layer.
- **Notifications and communication:** Leak detection alert to SAD and PAD.
- **Error handling and edge cases:** Source-of-truth unavailable during re-check → fail closed (drop the hit). Policy change in flight → newer policy wins at query time. Index document without an audience policy → not indexed and an alert is raised.
- **Dependencies:** PRF, EMP, NET, JOB, LRN, TSF (policy sources), FR-SRC-025.
- **Security and privacy:** This feature is the privacy control; the test suite is part of the release gate.
- **Acceptance criteria:**
  1. Given a profile switched to hidden, when searching its exact name within a second, then it does not appear even if the index is stale.
  2. Given a stealth-mode candidate, when a recruiter searches matching terms, then the candidate is absent from results and counts.
  3. Given the source-of-truth check fails, when a hit is hydrated, then the hit is dropped, not shown. (negative: fail closed)

### Sub-module E: Recruiter talent search

### FR-SRC-021 — Recruiter talent search

- **Sub-module:** E Recruiter talent search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-92 steps 1–2, 7–8 (filters, ranking, privacy, stealth)]
- **Purpose and outcome:** Recruiters find candidates who match role needs and have consented to be found. Success is a ranked, explainable result list limited to discoverable candidates.
- **Roles and permissions:** `REC, HMG (delegated), EAD: search` · `API: via org key` · `PAD/SAD: audit`
- **Preconditions and entry points:** Verified employer organization (EMP), talent search entitlement (BIL), recruiter completed fair-hiring training acknowledgment `[PROP]`. Entry: `/recruiter/search`.
- **User interactions and actions:**
  1. Enter keywords or a job title; add structured filters: skills (canonical, with proficiency and evidence filters, FR-SRC-023), location with radius and "willing to relocate", years of experience band, availability (open to work), education level, languages, work authorization (only for candidates who shared it), salary expectation range (only shared), assessment results (band), credentials, industries.
  2. Choose sort: relevance, recent activity (if allowed), evidence strength, availability.
  3. Open "Blind review mode" (FR-SRC-022) if desired.
  4. Open a result in a side panel (evidence tab, profile) without leaving the list; add to a pool (ATS), message or hide.
  5. Save the search as a talent search with optional alerts for new matching candidates.
- **System behaviour:** Candidate set is limited to profiles that: are published; are not stealth; have discoverability allowing recruiters (or applied to this org's job); do not block the recruiter or org; are not under 18; and for each filter use only fields the candidate shared with recruiters (BR-SRC-007, BR-SRC-001). Query-time enforcement overrides index state. Ranking uses documented factors: skill match (weighted by evidence rung and freshness, shown), experience relevance, location, availability; protected attributes and proxies are excluded (BR-SRC-006). Every query, view and export is logged (BR-SRC-008): recruiter, org, parsed query, result count, viewed profiles. Result window max 1000 per query; rate limit per recruiter (e.g., 200 searches and 300 profile views per hour `[PROP]`). Result cards show why each matched (criteria) and no hidden score. Entitlement-based credit consumption is defined in BIL.
- **UI elements and controls:** Search bar, filter panel, results list with cards (name or blind label, headline, location, top matched skills with evidence chips, availability, match reasons), side panel, "Save search", "Blind mode" toggle, sort select.
- **Configuration options:** Org: default blind mode, required filters, hidden filters. Platform: rate limits, result window, entitlement.
- **Business rules:** BR-SRC-001, BR-SRC-006, BR-SRC-007, BR-SRC-008, BR-SRC-009, BR-SRC-027, BR-SRC-040.
- **Validation:** ≤ 15 boolean clauses; skills from canonical list; salary range valid; radius ≤ 200 km.
- **Inputs and outputs:** In: query and filters. Out: candidate cards with explanations.
- **Filters, sorting, search:** As above.
- **Notifications and communication:** Alerts for saved talent searches (daily or weekly, in-app and email), class `recruiting_alerts`.
- **Error handling and edge cases:** Candidate withdraws consent while recruiter views → next read shows "Candidate unavailable" (consent revocation effective at next query, never later than 24 h in index). Over rate limit → 429 with retry time. Query too broad (> 1000) → prompt to narrow and show top 1000 only. Entitlement lapsed → read-only saved searches.
- **Dependencies:** PRF (FR-PRF-013, 016, 017, 033, 034), EVD (FR-EVD-026), EMP, BIL, ATS (planned), FR-SRC-020, FR-SRC-022, FR-SRC-023.
- **Security and privacy:** Org audit visible to EAD; staff audit; anti-scraping controls (FR-SRC-029); candidates can see aggregate appearance counts (FR-SRC-024).
- **Acceptance criteria:**
  1. Given a discoverable candidate matching all filters, when a recruiter searches, then the candidate appears with match reasons.
  2. Given a candidate who blocked the recruiter's organization, when searched, then the candidate does not appear.
  3. Given a salary filter, when a candidate hasn't shared salary with recruiters, then the candidate isn't excluded or included by salary (the filter doesn't apply to them) and the UI says "salary filter applies only to candidates who share it". (negative)

### FR-SRC-022 — Fairness controls for talent search

- **Sub-module:** E Recruiter talent search
- **Priority / tier:** Must · R4
- **Source:** [PROP]; relates to SSOT F-119 DE&I Analytics and BR-158 (k-anonymity); [DEC-REQ] OD-SRC-04
- **Purpose and outcome:** Talent search does not use protected attributes, reduces identity cues in first-pass review, and is monitored for disparate impact. Success is documented, auditable controls.
- **Roles and permissions:** `REC/HMG/EAD: use blind mode` · `EAD: view org fairness summary` · `PAD/SAD: configure and audit`
- **Preconditions and entry points:** Talent search active.
- **User interactions and actions:**
  1. Recruiter toggles "Blind review" (names, photos, schools' names, graduation years, pronouns hidden; skills, experience and evidence shown); org admins may set it on by default.
  2. Recruiter sees a note on the list "Ranking uses: skills, evidence, experience, location, availability. It does not use name, photo, age, gender, or similar".
  3. Optional "Shuffle equal matches" so ties are randomly ordered per session.
  4. EAD opens "Fair search" report: distribution of shortlisted vs viewed candidates by voluntary demographic cohorts (when the data exists and k ≥ 10), and alerts.
- **System behaviour:** Excluded from ranking and filtering: name, photo, age/date of birth, gender, pronouns, ethnicity, religion, disability, marital status, nationality, graduation year as an age proxy (graduation year shown only as range "years of experience"), address, and language of native origin except as a listed skill requirement. Filters offering such attributes don't exist. Proxy detection: new filter or ranking features undergo a proxy review before release (BR-SRC-030). Blind mode is applied server-side to the payload. Periodic audits (monthly) compute selection-rate ratios per cohort using aggregated voluntary data from ATS (planned) with k-anonymity; alerts if ratio falls below configured thresholds (default four-fifths rule `[PROP]`); results go to PAD and, for org-level, to EAD. The platform maintains an audit-ready documentation pack for automated-decision-tool regulations (e.g., bias audits) as OD-SRC-04 requires legal input.
- **UI elements and controls:** Blind review toggle (persisted), ranking disclosure note, shuffle toggle, fair-search report with data tables.
- **Configuration options:** Org: default blind mode. Platform: thresholds, k.
- **Business rules:** BR-SRC-006, BR-SRC-009, BR-SRC-010, BR-SRC-032.
- **Validation:** feature release requires proxy review sign-off.
- **Inputs and outputs:** In: recruiter actions and ATS aggregates. Out: blinded payloads, reports.
- **Filters, sorting, search:** Report filter by role family, period.
- **Notifications and communication:** Alert to PAD on adverse-impact threshold; EAD summary monthly.
- **Error handling and edge cases:** Insufficient volume → "Not enough data". Blind mode on, recruiter tries to message candidate → name is revealed only when the recruiter moves the candidate to a stage that requires identity (ATS), logged. Voluntary data absent → no cohort analysis, only process metrics.
- **Dependencies:** ATS (planned), ANL (planned), FR-SRC-021.
- **Security and privacy:** Demographic data is voluntary, separated, aggregate-only here; no individual-level protected attributes enter SRC.
- **Acceptance criteria:**
  1. Given blind mode on, when results load, then payloads exclude names, photos, school names and pronouns.
  2. Given a proposed ranking feature correlated with age, when submitted for release, then release is blocked pending proxy review.
  3. Given an attempt to filter by gender via the API, when sent, then the request is rejected. (negative)

### FR-SRC-023 — Evidence-aware filters and talent result cards

- **Sub-module:** E Recruiter talent search
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-92 "skills ... with proficiency + verification filter"; BR-064]
- **Purpose and outcome:** Recruiters can ask for verified skills and see how strong evidence is, without excluding candidates who haven't had the chance to verify. Success is opt-in filters with clear labels.
- **Roles and permissions:** `REC/HMG/EAD: use`
- **Preconditions and entry points:** Talent search.
- **User interactions and actions:**
  1. In the skills filter, choose a skill and a minimum evidence level: Any (default), Artifact-backed, Peer-attested, Authority-verified; optionally issuer class and freshness.
  2. Toggle "Identity verified (candidate chose to show)" (BGV, opt-in mark).
  3. See cards with evidence chips and a one-line summary ("Python: verified by assessment, current").
  4. Open the evidence tab (EVD FR-EVD-030).
- **System behaviour:** The default is **Any**, so candidates without evidence are still retrievable and the UI says "Filtering by evidence hides candidates who haven't added evidence yet" when a minimum is chosen (BR-SRC-040). Filters evaluate only evidence visible to recruiters or shared with them (BR-SRC-001, EVD BR-EVD-025). Self-declared proficiency is labeled "claimed". The identity facet uses only users who chose to show the mark (BGV BR-BGV-015). Background-check results are never searchable (BR-BGV-013). Evidence strength sorting uses EVD's disclosed composite for sorting only.
- **UI elements and controls:** Skill filter rows with evidence select, identity toggle, evidence chips on cards, notice text.
- **Configuration options:** Org: default evidence level (Any). Platform: facet availability.
- **Business rules:** BR-SRC-001, BR-SRC-040, BR-SRC-009.
- **Validation:** evidence level enumerated; issuer class enumerated.
- **Inputs and outputs:** In: evidence filters. Out: filtered candidates, chips.
- **Filters, sorting, search:** Facets: evidence level per skill, issuer class, freshness, identity verified.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Evidence revoked after indexing → query-time re-check drops the match. EVD unavailable → evidence filters disabled with notice; candidates not excluded.
- **Dependencies:** EVD (FR-EVD-001, 026, 027, 030), BGV (FR-BGV-004), FR-SRC-021.
- **Security and privacy:** Only recruiter-visible evidence used; counts of hidden evidence not exposed.
- **Acceptance criteria:**
  1. Given "Python, authority-verified", when searched, then only candidates with such visible evidence appear.
  2. Given the default "Any", when searched, then candidates with only claimed Python also appear and are labeled claimed.
  3. Given a candidate whose verifying credential is private, when filtered, then they are not matched via that credential. (negative)

### FR-SRC-024 — Candidate-side search appearance insights

- **Sub-module:** E Recruiter talent search
- **Priority / tier:** Could · R4
- **Source:** [PROP]
- **Purpose and outcome:** A candidate sees how often they appear in recruiter searches and what could improve discoverability, without naming recruiters. Success is aggregate, privacy-safe insight.
- **Roles and permissions:** `CAN/STD/FRL: view own`
- **Preconditions and entry points:** Discoverable profile. Entry: Profile views page (PRF) "Search appearances".
- **User interactions and actions:**
  1. See weekly counts: appearances in recruiter results, profile opens from search, top matched skills.
  2. See suggestions ("Add evidence for Python to improve match quality").
  3. Turn the insight off.
- **System behaviour:** Counts aggregated weekly; breakdown by industry or org size is shown only if ≥ 5 events (BR-SRC-031). No recruiter or organization identity shown (named viewers are PRF profile views). Insights never include the search queries of recruiters. Suggestions derive from public product rules, not recruiter query content.
- **UI elements and controls:** Weekly chart with data table, suggestions list, off switch.
- **Configuration options:** User: on/off.
- **Business rules:** BR-SRC-031.
- **Validation:** n/a.
- **Inputs and outputs:** In: appearance events. Out: aggregates.
- **Filters, sorting, search:** Date range.
- **Notifications and communication:** Optional weekly summary (class `profile_activity`, default off).
- **Error handling and edge cases:** Low volume → "Not enough data yet". Candidate non-discoverable → panel explains how to opt in.
- **Dependencies:** PRF, FR-SRC-021.
- **Security and privacy:** Aggregates only; no query text.
- **Acceptance criteria:**
  1. Given 12 appearances in a week, when viewed, then the count displays.
  2. Given 3 appearances, when viewing the industry breakdown, then it is suppressed.
  3. Given the candidate is in stealth, when viewing, then appearances show 0 and an explanation. (negative)

### Sub-module F: Index, taxonomy and platform

### FR-SRC-025 — Indexing pipeline and document lifecycle

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 `search_index` (derived), "search maturity roadmap (Postgres FTS → hybrid → dedicated engine)"; F-34]; freshness targets [PROP]
- **Purpose and outcome:** Source-module changes reach the search index quickly and correctly, including removals and visibility reductions. Success is measured freshness and zero stale exposures.
- **Roles and permissions:** `system: run` · `PAD/SAD: view health, replay, repair` · `owning modules: publish change events`
- **Preconditions and entry points:** Source modules emit change events (create, update, delete, visibility change). Entry: event consumers; admin Index health page.
- **User interactions and actions:**
  1. Operators open Index health: per entity type lag, queue depth, failure counts, last successful sync, document counts versus source counts.
  2. Operators replay a failed batch or reindex one entity by id.
  3. Owning-module teams register a new indexable entity by supplying a schema (fields, audience policy, field groups).
- **System behaviour:** SM-SRC-05 per document: `pending`, `indexed`, `hidden`, `deleted`. Pipeline: change event → outbox → indexer worker → document builder (reads source of truth, builds audience-specific field groups, normalizes skills to canonical ids, locations to place ids) → engine write. Idempotent by (entity, id, version). Targets: jobs and content ≤ 5 min; people profiles and courses ≤ 15 min; deletions and visibility reductions ≤ 15 min (BR-SRC-003, BR-SRC-024); erasure-driven removals ≤ 24 h. Only fields allowed for search are indexed; private data classes (contact data, salary expectation, work authorization, BGV data, private evidence) are never indexed (BR-SRC-002). A nightly reconciliation compares source and index counts and checksums and repairs drift. Query-time checks (FR-SRC-020) cover the lag window.
- **UI elements and controls:** Admin health dashboard with data tables, replay and reindex buttons with confirmation, entity registration form (schema editor with audience policy required).
- **Configuration options:** Platform: freshness targets per entity, batch sizes, retry policy.
- **Business rules:** BR-SRC-002, BR-SRC-003, BR-SRC-024.
- **Validation:** schema must declare audience policy and field groups; field names unique; entity must have an owner role.
- **Inputs and outputs:** In: change events. Out: index documents, health metrics.
- **Filters, sorting, search:** Dashboard filters by entity type and status.
- **Notifications and communication:** Alerts to PAD when lag exceeds 2× target or reconciliation drift > 0.5 % `[PROP]`.
- **Error handling and edge cases:** Poison event → dead-letter queue with alert; document builder error → doc stays `pending` and old version remains until fixed unless the change was a visibility reduction (then hidden immediately). Out-of-order events → version check discards stale ones. Source unavailable → retry with backoff, no deletion based on a failed read.
- **Dependencies:** All source modules (JOB, PRF, LRN, ASM, EMP, NET, EVT, EVD), PLT outbox (planned).
- **Security and privacy:** Index is a derived store holding personal data of people; encrypted at rest; access limited to the search service; erasure propagation tested.
- **Acceptance criteria:**
  1. Given a job is closed, when 5 minutes pass, then the job document is `deleted` or `hidden` and absent from results.
  2. Given a profile switched to private, when the event is processed, then the document is hidden within 15 minutes and immediately filtered at query time.
  3. Given a document schema without an audience policy, when registered, then it is rejected. (negative)

### FR-SRC-026 — Index versioning, reindex and rollback

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Should · R3
- **Source:** [SRC: SSOT F-147 search maturity roadmap] and [PROP]
- **Purpose and outcome:** Mappings, analyzers and ranking features can change without downtime or inconsistent results. Success is a blue-green style swap with validation and rollback.
- **Roles and permissions:** `PAD (dual approval to swap), SAD: approve emergency swaps`
- **Preconditions and entry points:** Admin Index versions page.
- **User interactions and actions:**
  1. PAD creates a new index version from a schema or analyzer change; it builds in the background.
  2. PAD reviews validation: document count parity, sample query parity, latency, permission-leak canary tests.
  3. A second approver approves; the alias swaps atomically.
  4. PAD can roll back to the previous version within the retention window (7 days `[PROP]`).
- **System behaviour:** SM-SRC-02. The new version is built from the source of truth while live changes are dual-written. Validation compares top-k results on a judgment set (FR-SRC-027) and runs the leak canaries (FR-SRC-020). The swap changes the read alias only; writes continue to both until retirement. Failed validation blocks the swap. Retired versions are deleted after the window.
- **UI elements and controls:** Versions table with state, progress bars, validation report, Approve and Swap buttons, Roll back button.
- **Configuration options:** Platform: retention window, validation thresholds.
- **Business rules:** BR-SRC-025, BR-SRC-030.
- **Validation:** two distinct approvers; validation passed; canary tests passed.
- **Inputs and outputs:** In: schema or analyzer definitions. Out: index versions.
- **Filters, sorting, search:** Versions list by state.
- **Notifications and communication:** Swap and rollback notices to PAD.
- **Error handling and edge cases:** Build fails → `failed` with log; old version continues. Swap during peak → blocked by a change-window rule. Rollback after documents were deleted in the new version → deletions reapplied to the old version by replay.
- **Dependencies:** FR-SRC-025, FR-SRC-027.
- **Security and privacy:** Old versions contain deleted data until retired; retention window must not exceed erasure SLAs, so rolled-back versions replay deletions before going live.
- **Acceptance criteria:**
  1. Given a validated version and two approvals, when swapped, then queries use the new version without errors.
  2. Given a failed leak canary, when requesting swap, then it is blocked.
  3. Given a single approver, when swapping, then rejected. (negative)

### FR-SRC-027 — Relevance evaluation and ranking tuning console

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Should · R3
- **Source:** [PROP]; ranking transparency [SRC: SSOT F-04 step 2]
- **Purpose and outcome:** Ranking and synonym changes are measured before release and can be rolled back. Success is a documented evaluation per release and no blind tuning.
- **Roles and permissions:** `PAD (relevance engineer): author, evaluate` · `PAD + SAD: approve release` · `others: none`
- **Preconditions and entry points:** Admin Relevance console.
- **User interactions and actions:**
  1. Create or edit a ranking profile (weights per entity) or a synonym set change as a draft.
  2. Select judgment sets (query, result, graded relevance labels) and run offline evaluation: nDCG@10, MRR, zero-result rate, coverage, and fairness checks for talent search (FR-SRC-022).
  3. Run a shadow test: new profile scores live queries without affecting users; compare differences.
  4. Request approval; a second approver reviews the evaluation report and releases.
  5. Roll back instantly.
- **System behaviour:** SM-SRC-04. Profiles are immutable versions with change notes; the public "How results are ranked" page and changelog update on release (BR-SRC-039). Evaluation excludes protected-attribute features (checked by a feature allowlist per entity; new features need a proxy review). Judgment sets are maintained by trained raters with agreement checks; no user data is used without anonymization. Release is gated: offline metrics must not regress beyond thresholds, and the fairness check must pass for talent search.
- **UI elements and controls:** Profile editor with weight sliders and numeric inputs, evaluation runner, comparison tables, shadow results, approve, release and rollback buttons.
- **Configuration options:** Platform: metric thresholds, feature allowlist.
- **Business rules:** BR-SRC-004, BR-SRC-030, BR-SRC-039, BR-SRC-006.
- **Validation:** weights non-negative and sum per profile rules; features from allowlist; dual approval.
- **Inputs and outputs:** In: profile draft, judgment sets. Out: evaluation report, release.
- **Filters, sorting, search:** Release history by entity.
- **Notifications and communication:** Release notices to PAD and support.
- **Error handling and edge cases:** Insufficient judgment coverage (< 100 queries `[PROP]`) → release blocked. Shadow errors → test aborted. Rollback while a reindex is in progress → serialized.
- **Dependencies:** FR-SRC-015, FR-SRC-026, FR-SRC-022.
- **Security and privacy:** Judgment sets contain no personal data of real users beyond public entities; access audited.
- **Acceptance criteria:**
  1. Given a draft profile with nDCG regression above threshold, when requesting release, then it is blocked.
  2. Given an approved release, when published, then the "How results are ranked" changelog shows the new version.
  3. Given a feature not on the allowlist, when added, then rejected. (negative)

### FR-SRC-028 — Zero-result, empty and error states

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT §11.2 canonical UI states]; recovery contract [SRC: SSOT §5.3]
- **Purpose and outcome:** Whenever search yields nothing or fails, the user gets an explanation and a next step. Success is lower abandonment and no dead ends.
- **Roles and permissions:** `all`
- **Preconditions and entry points:** Any search surface.
- **User interactions and actions:**
  1. When no results: see "No results for 'x'" with suggestions: check spelling (Did you mean), remove a filter (one-click chips for the filters that most reduce results), broaden location, try related skills (taxonomy), or browse categories.
  2. Press "Save this search and alert me" to be notified when matches appear.
  3. For first-visit empty queries: see recent searches, popular categories, tips.
  4. On errors: see a retry button and what still works.
- **System behaviour:** The service computes "relaxation suggestions" by testing removal of each filter and returning counts for the top 3 (only counts the viewer is permitted to see; small-cell suppression applies). It never says "no such person exists" for hidden entities; the message is the same as for non-existing (BR-SRC-023). Zero-result queries are logged (aggregate, redacted) to improve synonyms and content gaps (FR-SRC-031). Recruiters see "No discoverable candidates match; candidates may have limited visibility" without counts of hidden people.
- **UI elements and controls:** Empty-state panel with icon and text, suggestion chips, "Save this search" button, retry button, category links.
- **Configuration options:** Platform: copy per entity and locale; max suggestions (3).
- **Business rules:** BR-SRC-023, BR-SRC-021.
- **Validation:** n/a.
- **Inputs and outputs:** In: failing query and filters. Out: suggestions.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Saved-search alert (FR-SRC-018) if chosen.
- **Error handling and edge cases:** Relaxation suggestion count 0 for all → show category browse only. Network error → offline banner with retry (PWA planned: cached recent results only for the user's own saved searches). Rate limited → shows when to retry.
- **Dependencies:** FR-SRC-011, FR-SRC-014, FR-SRC-017, FR-SRC-034.
- **Security and privacy:** Suggestion counts respect permissions and small-cell rules.
- **Acceptance criteria:**
  1. Given a query with filters returning nothing, when displayed, then at least one relaxation suggestion with a count appears if any exists.
  2. Given a hidden profile's exact name, when searched by a stranger, then the message is identical to a name that doesn't exist.
  3. Given a relaxation that would reveal fewer than 5 people, when computed for people search, then the count is suppressed. (negative)

### FR-SRC-029 — Abuse protection and anti-scraping

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-96 "Public verify endpoint rate-limited"; hardening controls §15.7] and [PROP]
- **Purpose and outcome:** Search can't be used to harvest profiles, enumerate people or overload the service. Success is bounded data exposure per actor.
- **Roles and permissions:** `system: enforce` · `PAD/SAD: review signals, block actors` · `SUP: assist users wrongly limited`
- **Preconditions and entry points:** All search endpoints.
- **User interactions and actions:**
  1. Users who hit a limit see "Too many searches. Try again in N seconds".
  2. Suspicious sessions see a challenge (CAPTCHA or re-authentication).
  3. PAD reviews abuse signals and blocks accounts, IPs or organizations; users can appeal via support.
- **System behaviour:** Limits (defaults `[PROP]`): guests 30 searches/min/IP and people search capped at 20 results with no pagination; signed-in users 120/min; talent search per recruiter 200 searches and 300 profile views per hour with daily caps by entitlement. Detection: sequential-id or alphabetical name probing, high-volume distinct-person views, headless user agents, many accounts per IP, repeated deep pagination attempts. Responses escalate: slow down, challenge, temporary block, org notification. Results windows capped at 1000. Search URLs for people include no sequential ids. Honeypot entities detect scrapers. All talent search exports and views are watermarked and logged (BR-SRC-008). Enumeration defense: uniform responses for hidden or missing entities.
- **UI elements and controls:** Rate-limit message, challenge dialog, admin abuse console (signals, actors, blocks, appeals).
- **Configuration options:** Platform: thresholds per role and entity. Org: lower caps.
- **Business rules:** BR-SRC-008, BR-SRC-026, BR-SRC-019.
- **Validation:** n/a.
- **Inputs and outputs:** In: request metadata. Out: allow, slow, challenge or block decisions.
- **Filters, sorting, search:** Console filters by actor, signal, severity.
- **Notifications and communication:** Org admin notice when a recruiter is limited; user notice for blocks with appeal link.
- **Error handling and edge cases:** Shared IP (office or school) → per-account limits dominate for signed-in users. False positive → support lifts block, audited. Limiter store failure → fail to conservative defaults rather than unlimited.
- **Dependencies:** PLT edge limiter (planned), ADM (planned), FR-SRC-021.
- **Security and privacy:** Signals are minimal metadata; retained 90 days; no content of queries beyond redacted logs.
- **Acceptance criteria:**
  1. Given 31 guest searches in a minute, when the 31st is sent, then 429 is returned with retry-after.
  2. Given a guest requests page 2 of people results, when sent, then it is refused.
  3. Given the limiter store is down, when requests arrive, then conservative defaults apply, not unlimited access. (negative)

### FR-SRC-030 — Skills taxonomy and synonym administration

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-84 steps 1–2, 6–7; BR-141..BR-148; V61 notes]
- **Purpose and outcome:** A governed canonical skills list, aliases, relationships, decay classes and emerging skills make search, matching and evidence consistent. Success is a clean, versioned taxonomy that others reference by id.
- **Roles and permissions:** `PAD (taxonomy editor): create, edit, deprecate, merge, approve proposals` · `all users/course authors/recruiters: propose` · `all: read`
- **Preconditions and entry points:** Admin Taxonomy console; "Suggest this skill" in PRF skill editor and course tagging.
- **User interactions and actions:**
  1. Editor creates a skill: canonical name, slug, category (≤ 3 levels), description, aliases, decay class (fast, standard, stable), status.
  2. Editor adds relationships: `prerequisite_of`, `subskill_of`, `supersedes`, `complements`; `correlates_with` is computed and read-only.
  3. Editor reviews the proposals queue (user suggestions, emerging skills with ≥ 5 independent signals in 30 days) and approves, merges into an existing skill, or rejects with reason.
  4. Editor deprecates or merges a skill; the system shows impact (profiles, claims, jobs, courses, saved searches affected) before confirmation.
  5. Editor manages synonym sets (equivalent, directional) with test queries.
- **System behaviour:** SM-SRC-03. Merge creates a redirect map; consumers remap ids (PRF skills, EVD claims, job and course tags, saved searches, alerts) via `src.skill.merged` events; history is preserved. `prerequisite_of` cycle check at write time; traversal depth bounded to 5 (BR-SRC-042). Alias collisions are blocked. Changes are versioned and audited; bulk changes require a second approver. Emerging skills detection runs weekly over job postings and proposals (BR-SRC-043). Public read API: `GET /api/v1/skills/{id}` and `/skills/search?q=` for typeahead `[SRC: SSOT F-84]`. Skill market signals come from MKT (planned) and are read-only here.
- **UI elements and controls:** Taxonomy tree with search, skill form, relationship graph view with table alternative, proposal queue table, merge wizard with impact preview, synonym set editor with test box.
- **Configuration options:** Platform: category levels, decay classes and half-lives (default 18, 48, 60 months `[PROP]`).
- **Business rules:** BR-SRC-017, BR-SRC-018, BR-SRC-042, BR-SRC-043, BR-SRC-044.
- **Validation:** canonical name unique (case-insensitive); aliases unique across skills; category depth ≤ 3; acyclic prerequisites; merge target active.
- **Inputs and outputs:** In: taxonomy edits and proposals. Out: versioned taxonomy and redirect events.
- **Filters, sorting, search:** Filter by status, category, decay class; search by name and alias.
- **Notifications and communication:** Proposer is told the outcome (in-app); affected users notified of merges only if visible change (e.g., skill renamed).
- **Error handling and edge cases:** Merge of skills with conflicting relationships → editor resolves in wizard. Deprecated skill used in an old saved search → redirected with notice. Concurrent edits → optimistic version check.
- **Dependencies:** PRF, EVD, JOB, LRN, ASM, MKT (planned).
- **Security and privacy:** Proposals show no proposer identity to other users; proposer ids visible to editors.
- **Acceptance criteria:**
  1. Given a merge of "ReactJS" into "React", when confirmed, then all references remap and old ids redirect.
  2. Given a `prerequisite_of` edge that creates a cycle, when saving, then rejected.
  3. Given a user attempts to create a canonical skill directly via API, when posted, then 403. (negative)

### FR-SRC-031 — Search analytics (privacy-preserving)

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Should · R3
- **Source:** [SRC: SSOT F-147 "search analytics"; BR-27 analytics metadata whitelist-only] and [PROP]
- **Purpose and outcome:** Product and org teams learn what people search for and where search fails without tracking individuals. Success is aggregate dashboards with no personal data.
- **Roles and permissions:** `PAD: platform dashboards` · `EAD: own org talent search usage` · `IAD: institution aggregates` · `system: collect`
- **Preconditions and entry points:** Admin analytics; employer settings.
- **User interactions and actions:**
  1. PAD views: query volume, zero-result rate, click-through, reformulation rate, top zero-result queries (min frequency 20), latency, filter usage, saved-search and alert engagement.
  2. EAD views their org's talent-search usage: searches, views, shortlists, time to first view, blind-mode usage (no candidate-level data).
  3. Export aggregates.
- **System behaviour:** Event pipeline records whitelisted metadata only (event type, entity, filter keys, result count, latency, position clicked, hashed session id), not raw free text in analytics tables; free text query strings are kept separately in a redacted query log for 90 days with identifier patterns removed, access limited to relevance staff (BR-SRC-014). Top-query reports require ≥ 20 distinct users. User-level query history is never exposed to org customers. Aggregated cells below k = 10 are suppressed `[SRC: SSOT BR-158]`. IP addresses are truncated. Respect consent and region (SET).
- **UI elements and controls:** Dashboards with tables and charts, date range, export.
- **Configuration options:** Platform: retention (raw 90 days), thresholds.
- **Business rules:** BR-SRC-014, BR-SRC-029, BR-SRC-021.
- **Validation:** date ranges ≤ 12 months.
- **Inputs and outputs:** In: events. Out: aggregates.
- **Filters, sorting, search:** Filter by entity, period, platform.
- **Notifications and communication:** Weekly digest to PAD (optional).
- **Error handling and edge cases:** Consent absent → only strictly necessary operational metrics. Pipeline lag → dashboards show data freshness time.
- **Dependencies:** ANL (planned), SET (planned).
- **Security and privacy:** No per-user analytics exports; k-suppression.
- **Acceptance criteria:**
  1. Given a query used by 5 users, when top queries are listed, then it is excluded.
  2. Given an EAD, when viewing org analytics, then no candidate identity or query text of other orgs is visible.
  3. Given an analytics event containing an email-pattern query, when processed, then the pattern is removed before storage. (negative)

### FR-SRC-032 — Multilingual and locale-aware search

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Could · R5
- **Source:** [PROP]; relates to SSOT F-116 inclusive access and §11 localization
- **Purpose and outcome:** Users search in their language, find content in other languages when relevant, and see language labels. Success is correct analysis for supported languages and honest fallbacks.
- **Roles and permissions:** `all`
- **Preconditions and entry points:** Platform languages enabled (OD-SRC-07).
- **User interactions and actions:**
  1. Type in a supported language; results include items in that language and cross-language skill matches.
  2. Use the "Languages" filter to restrict results to chosen content languages.
  3. See language badges on courses, content and jobs.
- **System behaviour:** Language detection per query (with user's locale as hint); per-language analyzers (stemming, stop-words, diacritics folding, tokenization for CJK and Thai); skills resolved to language-independent canonical ids with localized labels; job titles mapped through a multilingual title taxonomy `[PROP]`. Unsupported languages use a generic analyzer and a notice "Search is limited for this language". Right-to-left layout supported. Names are matched with transliteration variants.
- **UI elements and controls:** Language filter, language badges, notice for limited support.
- **Configuration options:** Platform: supported languages. User: preferred content languages.
- **Business rules:** BR-SRC-041.
- **Validation:** language codes from ISO 639-1.
- **Inputs and outputs:** In: query text, locale. Out: language-aware results.
- **Filters, sorting, search:** Filter by content language.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Mixed-language queries → analyzed per token script. Detection uncertain → union of likely analyzers.
- **Dependencies:** FR-SRC-030, FR-SRC-025.
- **Security and privacy:** None beyond standard.
- **Acceptance criteria:**
  1. Given a Spanish query "desarrollador de software", when searched, then matching jobs in Spanish and English titles mapped to the same title taxonomy appear.
  2. Given the language filter "French", when applied, then only French content appears.
  3. Given an unsupported language, when searched, then a limited-support notice appears and the search still runs. (negative: no hard failure)

### FR-SRC-033 — Location normalization and geographic search

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Should · R2
- **Source:** [SRC: SSOT F-04 location filter; F-92 "location (with radius)"] and [PROP]
- **Purpose and outcome:** Location inputs resolve to known places and support radius, remote and relocation semantics. Success is predictable geographic filtering.
- **Roles and permissions:** `all`
- **Preconditions and entry points:** Location combobox in search, profile and job forms.
- **User interactions and actions:**
  1. Type a place; choose a suggestion (city, region, country, "Remote").
  2. Set radius (5–200 km or miles by locale) or choose "Within region/country".
  3. Choose "Include remote jobs available in my country" and "Willing to relocate" (talent search).
  4. Optionally press "Use my current location" and grant device permission.
- **System behaviour:** Places resolve to a stable place id (with hierarchy and coordinates) from a place dataset; free-text locations on jobs and profiles are normalized at indexing; unresolved locations are indexed as text only and excluded from radius queries (with a notice on the owner side). Remote semantics: remote-anywhere, remote-in-country, remote-in-region, hybrid with office location. Geographic precision of people is limited to city level in indexes (BR-SRC-033). Device location is used for one query only and is not stored; coordinates are rounded to ~1 km.
- **UI elements and controls:** Location combobox, radius slider with numeric input, remote switch, relocation switch, "Use my current location" button.
- **Configuration options:** Platform: place dataset, units by locale. User: default location.
- **Business rules:** BR-SRC-033.
- **Validation:** radius 1–200 km; place id exists.
- **Inputs and outputs:** In: place id, radius, remote options. Out: geo-filtered results.
- **Filters, sorting, search:** Sort by distance.
- **Notifications and communication:** n/a.
- **Error handling and edge cases:** Ambiguous place names → disambiguation with region. Place renamed or merged → redirect. Device permission denied → typed location only.
- **Dependencies:** PLT place data (planned), PRF location, JOB.
- **Security and privacy:** No street addresses in index; device coordinates not stored.
- **Acceptance criteria:**
  1. Given "Paris" with radius 50 km, when searched, then results within 50 km of the selected Paris appear.
  2. Given "Remote in my country" on, when applied, then remote jobs allowing that country appear.
  3. Given device permission denied, when pressing "Use my current location", then no location is set and a message explains. (negative)

### FR-SRC-034 — Degraded mode and fallback

- **Sub-module:** F Index, taxonomy and platform
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT F-147 search maturity (Postgres FTS → hybrid → dedicated engine); §20 resilience; BR-28 honest status]
- **Purpose and outcome:** When the search engine is slow or down, users still get safe, useful behavior and are told the truth. Success is no unfiltered leakage and clear status.
- **Roles and permissions:** `system` · `PAD: configure fallbacks, view status`
- **Preconditions and entry points:** Engine health checks fail or latency breaches.
- **User interactions and actions:**
  1. User sees a banner "Search is running in limited mode. Results may be less relevant or slightly out of date."
  2. Autocomplete may be disabled; filters limited to core ones; people search disabled with message.
  3. Saved search alerts delay and resume later; users aren't spammed on recovery.
- **System behaviour:** Circuit breaker opens after N failures or p95 latency over threshold. Fallback tiers: (1) cached results for popular queries (anonymous entities only); (2) database full-text search over a minimal set of public entities (jobs, courses, companies) with the same permission checks; (3) navigation-only palette (pages and actions). People and talent search are not served from fallback (BR-SRC-034) because the database tier can't guarantee audience-field semantics and rate controls. Recovery: half-open probing, then ramp; alert backlog replay is rate-limited and deduped. Admin status page reports live, degraded or down honestly `[SRC: SSOT BR-28]`.
- **UI elements and controls:** Degraded banner (role `status`), disabled controls with explanatory tooltips, admin health page.
- **Configuration options:** Platform: breaker thresholds, fallback tiers.
- **Business rules:** BR-SRC-034, BR-SRC-001.
- **Validation:** n/a.
- **Inputs and outputs:** In: health signals. Out: mode state.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Incident alert to PAD; status updates to support.
- **Error handling and edge cases:** Fallback store stale → shows data age. Partial failure for one entity → only that tab degraded. Permission service down → no results (fail closed).
- **Dependencies:** FR-SRC-020, FR-SRC-025.
- **Security and privacy:** Fallback queries apply identical visibility rules; never return unfiltered rows.
- **Acceptance criteria:**
  1. Given the engine is down, when a guest searches jobs, then limited results with the banner appear.
  2. Given the engine is down, when a recruiter opens talent search, then the feature shows "unavailable" and no results.
  3. Given the permission service is down, when any search runs, then no results are returned. (negative: fail closed)

### FR-SRC-035 — Contribution and growth signals in talent search

- **Sub-module:** E Recruiter talent search
- **Priority / tier:** Could · R4
- **Source:** [SRC: SSOT §7.3 F-159 Behavioral Talent Discovery (priority 6, Ph4; dependencies F-123, F-84, F-144) and §9.4 F-159 "contributor ranking, engagement scoring, project activity, learning trajectory, community standing, emerging expertise, peer endorsements; acceptance: discovery based on real activity, no gaming vectors"] [PROP] for the evidence-based narrowing; scope in `OD-SRC-13`
- **Purpose and outcome:** Recruiters can find candidates by verified recent proof (contributions, learning momentum, emerging skills, community standing, endorsements) that the candidates chose to show, so people with strong recent work but sparse profile text are findable. The system knows it works when signal facets are used, candidates without signals are not excluded by default, and selection-rate audits stay within thresholds.
- **Roles and permissions:** `REC, HMG, EAD: use the facets in talent search` · `CAN, STD, FRL: opt in per signal category, preview, turn off` · `PAD: configure the signal catalogue, windows and thresholds` · `PAD, SAD: audit`
- **Preconditions and entry points:** Verified employer organization and talent search entitlement (FR-SRC-021). The candidate is discoverable to recruiters (FR-PRF-016) and has granted the consent purpose `recruiter.activity_signals` in the consent ledger (FR-SET-006), default off. Entry: talent search filter group "Recent proof"; candidate entry: Settings > Privacy > "Show recent verified activity to recruiters".
- **User interactions and actions:**
  1. Recruiter: open "Recent proof" in the talent search filters and choose up to 3 signal facets: verified contributions (merged or accepted contributions in the period, FR-EVD-007), learning momentum (assessed course or path completions in the period, FR-EVD-004, FR-EVD-005), emerging skill (a skill newly evidenced in the last {180} days that is flagged emerging, FR-MKT-005), community standing (recognized-contributor label from FR-REP-023), peer attestation (endorsement and attestation count at or above a level, FR-EVD-013, FR-EVD-014).
  2. Choose the period: 30, 90, 180 or 365 days.
  3. Read result cards with signal chips in plain words ("3 merged contributions in 90 days, verified") and a link to the evidence tab (FR-EVD-030).
  4. Optionally sort by "Recent verified proof"; relevance remains the default sort.
  5. Candidate: open the privacy page, tick the categories to show, press "Preview what recruiters see", and save. Turn any category off at any time.
- **System behaviour:** Signals are computed nightly from evidence records and learning and recognition events the candidate consented to share (`ENT-SRC-23`) and written to the recruiter field group of the search document (BR-SRC-002). Only evidence-backed activity counts; platform engagement (logins, time on platform, message, view or follow counts, streak length, XP, leaderboard rank) is never a signal (BR-SRC-045). Signals are filters and labels, not rank multipliers; default relevance ranking is unchanged, and no composite talent score exists (BR-SRC-009, BR-AIC-006). A candidate without signals is never excluded or down-ranked unless the recruiter applies a facet, and the UI then states "Filtering by recent proof hides candidates who haven't shared activity" (BR-SRC-046, BR-SRC-040). Disputed, revoked or expired evidence is removed at query time (BR-SRC-001). Anti-gaming discounts from FR-REP-024 apply before a signal is counted. Facet counts are suppressed below 10 (BR-SRC-021). Signal facets are included in the monthly selection-rate audits (BR-SRC-010). Turning a category off removes it from the index within 15 minutes (BR-SRC-003).
- **UI elements and controls:** "Recent proof" filter group with checkboxes and a period select, signal chips on cards with an info icon explaining the source, sort option, notice text; candidate toggles per category with a preview panel. States: facet disabled with a notice when the signal source is unavailable; empty results with advice to broaden the period.
- **Configuration options:** Platform: signal catalogue and definitions, minimum thresholds per signal (for example at least 2 contributions), windows (30, 90, 180, 365 days), facet availability by org plan. Org: facet on or off (default on). Candidate: per-category opt-in, default off.
- **Business rules:** BR-SRC-045, BR-SRC-046, BR-SRC-006, BR-SRC-007, BR-SRC-009
- **Validation:** At most 3 signal facets per query; period from the allowed list; signal definitions reference registered evidence types and registered skills only.
- **Inputs and outputs:** In: facets, period, optional sort; candidate consent choices. Out: candidates matching with signal chips and evidence links; candidate preview of exposed signals.
- **Filters, sorting, search:** Facets as above; sort "Recent verified proof" (explicit selection only); facet counts follow BR-SRC-021.
- **Notifications and communication:** n/a — recruiters are not alerted per candidate; candidates see only aggregate counts of appearances in FR-SRC-024 and are not told which recruiter or organization searched.
- **Error handling and edge cases:** Evidence source unavailable: the facet is disabled with a notice and candidates are not excluded. Consent withdrawn while a recruiter views the list: the next read shows "Candidate unavailable" for that signal and the signal chip disappears. Signal computed from a disputed item: dropped at query time. Candidate under 18: never indexed (BR-SRC-007). A recruiter combines facets to approximate a protected attribute: not possible, because no protected attribute or proxy is a facet (BR-SRC-006). Rate limit exceeded: 429 with a retry time.
- **Dependencies:** FR-SRC-021, FR-SRC-022, FR-SRC-023, FR-SRC-024, FR-EVD-004, FR-EVD-005, FR-EVD-007, FR-EVD-013, FR-EVD-014, FR-EVD-027, FR-EVD-030, FR-MKT-005, FR-REP-023, FR-REP-024, FR-PRF-016, FR-SET-006, ENT-SRC-23.
- **Security and privacy:** Signals are P2 derived data kept in the recruiter field group only for consenting, discoverable candidates; background-check and private evidence data are never used (BR-SRC-002); every use is logged in the talent search audit (ENT-SRC-14); anti-scraping controls apply (FR-SRC-029).
- **Acceptance criteria:**
  - Given a candidate who opted in to "verified contributions", when a recruiter filters for 2 or more verified contributions in 90 days, then the candidate appears with the chip and an evidence link.
  - Given a candidate who did not opt in, when the recruiter searches without the facet, then the candidate ranks exactly as before and is not marked as lacking signals.
  - Given a candidate turns off a category, when 15 minutes pass, then no recruiter query can match or display that signal.
  - Given a recruiter tries to filter by "logins in the last 30 days", when the API receives the request, then it rejects it as an unknown facet (negative).

## 5. Business rule table

| ID         | Rule                                                                                                                                                                                                                                                                                                                                                                                                         | Rationale                                                             | Enforced where                              | Source                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| BR-SRC-001 | Every query is evaluated with the viewer's permissions. Results the viewer may not see are never returned, counted, faceted, suggested, highlighted or alerted. Permission is checked at query time against the source of truth for the result page in addition to index-time ACLs; failure to check drops the hit.                                                                                          | Zero leakage.                                                         | Query service; hydration                    | [SRC: SSOT F-147 "0 RLS leakage", F-92 "zero stealth leakage"]    |
| BR-SRC-002 | Only fields allowed for search are indexed, grouped by audience. Contact data, salary expectation, work authorization, background-check data, private evidence, hidden test cases, solutions and private messages are never indexed. Every indexable entity declares an audience policy.                                                                                                                     | Minimization.                                                         | Document builder; schema registry           | [DER] from SSOT F-12 and F-92                                     |
| BR-SRC-003 | Deletions, visibility reductions, suspensions and erasures propagate to the index within 15 minutes (erasure within 24 h). The query-time check covers the gap.                                                                                                                                                                                                                                              | Privacy changes must be fast.                                         | Indexer; query service                      | [SRC: SSOT F-92 "consent revocation < 24h"]; 15 min [PROP]        |
| BR-SRC-004 | Ranking inputs are documented per entity, derived from stored features, and the explanation shown to users is generated from the same features. Protected attributes and their proxies are never inputs.                                                                                                                                                                                                     | Honest transparency and fairness.                                     | Ranking service; contract tests             | [SRC: SSOT F-04 "Why am I seeing this?"]                          |
| BR-SRC-005 | Default job ranking weights are skill match 0.45, experience 0.20, location 0.10, title 0.10, organization rating 0.10, recency 0.05 until revised through FR-SRC-027. The organization-rating input is disclosed and is an open decision.                                                                                                                                                                   | Legacy baseline retained.                                             | Ranking profile `jobs-v1`                   | [SRC: SSOT F-04 step 2]; [DEC-REQ] OD-SRC-03                      |
| BR-SRC-006 | Talent search never filters, sorts or ranks on name, photo, age or date of birth, gender, pronouns, ethnicity, religion, disability, marital status, nationality or proxies (such as graduation year as an age proxy). Such filters do not exist in the UI or API.                                                                                                                                           | Anti-discrimination.                                                  | Filter allowlist; feature allowlist         | [PROP]; [DER]                                                     |
| BR-SRC-007 | A candidate appears in talent search only if published, not stealth, discoverable to recruiters (or applied to the searching org), not blocking the recruiter or org, not under 18, not suspended; filters use only fields the candidate shared with recruiters. Enforced at query time.                                                                                                                     | Candidate control.                                                    | Talent query layer                          | [SRC: SSOT F-92 steps 7–8]; PRF BR-PRF-025, 029, 041              |
| BR-SRC-008 | Talent search queries, profile views and exports are logged (recruiter, org, parsed query, counts, viewed ids), rate limited, and result windows are capped at 1000. Logs are visible to the org admin and staff.                                                                                                                                                                                            | Accountability and anti-harvesting.                                   | Talent search service                       | [PROP]                                                            |
| BR-SRC-009 | Talent results show why each candidate matched (criteria) and no hidden score; blind review mode removes names, photos, school names, pronouns and graduation years from payloads; ties may be shuffled.                                                                                                                                                                                                     | Explainable, fairer first pass.                                       | Talent search UI and API                    | [PROP]                                                            |
| BR-SRC-010 | Selection-rate audits for talent search run at least monthly on aggregated, k-anonymized cohorts using voluntary demographic data where lawfully collected; thresholds raise alerts to PAD and the org.                                                                                                                                                                                                      | Detect disparate impact.                                              | Fairness job                                | [PROP]; [DEC-REQ] OD-SRC-04                                       |
| BR-SRC-011 | A user may keep up to 25 saved searches (talent searches count separately up to 50 per recruiter), each a structured query with unique name; alerts are new-only with no backfill.                                                                                                                                                                                                                           | Bounded load; clear semantics.                                        | Saved search service                        | [SRC: SSOT F-04 step 7]; limits [PROP]                            |
| BR-SRC-012 | Alert items are re-checked for permission, status and duplicates at send time; max 3 instant alerts per day per user, overflow goes to the digest; one-click unsubscribe is always present.                                                                                                                                                                                                                  | Safe, quiet alerts.                                                   | Alert job                                   | [PROP]                                                            |
| BR-SRC-013 | Recent searches are kept per user (max 20, 90 days), deletable, pausable, and excluded from others' views.                                                                                                                                                                                                                                                                                                   | User control.                                                         | History service                             | [PROP]                                                            |
| BR-SRC-014 | Queries matching identifier patterns (email, phone, national or card numbers) are not stored in history, logs or analytics; autocomplete suggests only queries used by ≥ 20 distinct users; raw query logs are retained 90 days with restricted access.                                                                                                                                                      | Prevent leaking personal data via search.                             | Logging and suggest pipeline                | [PROP]                                                            |
| BR-SRC-015 | Personalization is optional, disclosed, applies only to the user's own results, never to recruiter ranking of candidates, and turning it off deletes the profile within 24 h and stops its use immediately.                                                                                                                                                                                                  | Control and fairness.                                                 | Ranking service                             | [SRC: SSOT F-147 personalization]; control [PROP]                 |
| BR-SRC-016 | Typo tolerance: edit distance 1 for terms of 4–7 characters, 2 for 8 or more, none for shorter terms, quoted phrases, fields or numbers; low-confidence corrections are suggestions, high-confidence ones are announced and reversible; exact matches rank above fuzzy ones.                                                                                                                                 | Predictable.                                                          | Query analyzer                              | [SRC: SSOT F-147 typo tolerance]; thresholds [PROP]               |
| BR-SRC-017 | Synonym and alias expansion is curated, directional where meaningful, shown to the user, switchable, and suppressed for quoted or field-prefixed terms; expanded matches rank below exact ones.                                                                                                                                                                                                              | Recall without surprises.                                             | Query analyzer                              | [SRC: SSOT F-84]; [PROP]                                          |
| BR-SRC-018 | Skill filters use canonical skill ids; hierarchy expansion is opt-in, one hop by default, with traversal bounded to 5 hops.                                                                                                                                                                                                                                                                                  | Taxonomy integrity.                                                   | Filter builder                              | [SRC: SSOT BR-144, BR-146]                                        |
| BR-SRC-019 | Pagination is cursor-based, 20 per page default, 100 maximum; total reachable results per query are capped at 1000; guests get no deep paging in people search.                                                                                                                                                                                                                                              | Performance and anti-scraping.                                        | API                                         | [SRC: SSOT F-04 step 1]; cap [PROP]                               |
| BR-SRC-020 | Search state (query, filters, sort, tab) is encoded in the URL; invalid or non-permitted parameters are dropped with a notice; URLs contain no personal data other than the typed query.                                                                                                                                                                                                                     | Shareable and safe.                                                   | Web app and API                             | [SRC: SSOT F-04 step 1]                                           |
| BR-SRC-021 | Facet and tab counts are computed under permissions, shown as "1000+" above 1000, and suppressed below 5 for people facets (talent facets below 10) to prevent re-identification.                                                                                                                                                                                                                            | Privacy.                                                              | Facet service                               | [PROP]; [SRC: SSOT BR-158 default k]                              |
| BR-SRC-022 | Each entity has a documented default sort and allowed sorts; ties break deterministically; "newest" uses publication date; items lacking the sort attribute are placed last.                                                                                                                                                                                                                                 | Predictable ordering.                                                 | Query service                               | [PROP]                                                            |
| BR-SRC-023 | Zero-result and error states give recovery steps, and responses for hidden, blocked or non-existent entities are indistinguishable.                                                                                                                                                                                                                                                                          | No dead ends; no existence leak.                                      | Query service; UI                           | [SRC: SSOT §11.2]; [PROP]                                         |
| BR-SRC-024 | Freshness targets: jobs and content ≤ 5 min; people and courses ≤ 15 min; deletions and visibility reductions ≤ 15 min.                                                                                                                                                                                                                                                                                      | Quality of results.                                                   | Indexer                                     | [PROP]                                                            |
| BR-SRC-025 | Index changes ship as new versions validated against a judgment set and leak canaries, swapped atomically with two approvals, and roll-backable.                                                                                                                                                                                                                                                             | Safe change.                                                          | Index admin                                 | [PROP]                                                            |
| BR-SRC-026 | Abuse controls apply to all search surfaces: rate limits per role, caps for guests, enumeration-safe responses, anomaly detection, step-up challenges, and honeypots; limiter failure falls back to conservative limits.                                                                                                                                                                                     | Anti-scraping.                                                        | Edge and search service                     | [PROP]                                                            |
| BR-SRC-027 | Queries are limited to 256 characters and 20 terms; talent search allows up to 15 boolean clauses; engine syntax is never passed through.                                                                                                                                                                                                                                                                    | Safety and cost.                                                      | Parser                                      | [PROP]                                                            |
| BR-SRC-028 | Command search actions are filtered by the user's role and context; the palette never reveals pages or entities the user may not access.                                                                                                                                                                                                                                                                     | Least privilege.                                                      | Action registry                             | [SRC: SSOT F-20]; [DER]                                           |
| BR-SRC-029 | Search analytics store whitelisted metadata only, report aggregates, hash session ids, truncate IPs, and suppress cells below k = 10.                                                                                                                                                                                                                                                                        | Privacy.                                                              | Analytics pipeline                          | [SRC: SSOT BR-27, BR-158]                                         |
| BR-SRC-030 | Ranking profiles, synonym sets and analyzers are versioned, evaluated offline and in shadow against judgment sets, approved by two people, and roll-backable; each release has a changelog.                                                                                                                                                                                                                  | Controlled quality.                                                   | Relevance console                           | [PROP]                                                            |
| BR-SRC-031 | Candidate-side search appearance insights are aggregates only, name no recruiter or organization, and suppress breakdowns below 5 events.                                                                                                                                                                                                                                                                    | Privacy both ways.                                                    | Insights job                                | [PROP]                                                            |
| BR-SRC-032 | Fairness data is voluntary, held outside SRC, used in aggregates only with k ≥ 10, and never available per person to recruiters or search.                                                                                                                                                                                                                                                                   | Lawful, minimal.                                                      | Fairness job                                | [PROP]                                                            |
| BR-SRC-033 | People locations are indexed at city level or coarser; street addresses are never indexed; device location is used for one query only and not stored.                                                                                                                                                                                                                                                        | Location privacy.                                                     | Document builder; query                     | [PROP]                                                            |
| BR-SRC-034 | In degraded mode, search falls back only to tiers that enforce identical visibility rules; people and talent search are not served from fallback; permission-service failure returns no results.                                                                                                                                                                                                             | Fail closed.                                                          | Search gateway                              | [PROP]; [SRC: SSOT BR-28 honest status]                           |
| BR-SRC-035 | Autocomplete and suggestions exclude offensive and sensitive completions and never suggest private individuals' names to unauthorized viewers.                                                                                                                                                                                                                                                               | Safe suggestions.                                                     | Suggest pipeline                            | [PROP]                                                            |
| BR-SRC-036 | People search excludes unpublished, suspended, blocked-for-viewer and under-18 profiles and shows only fields visible to the viewer.                                                                                                                                                                                                                                                                         | Respect PRF settings.                                                 | People query                                | [DER] from PRF                                                    |
| BR-SRC-037 | Alert emails and push messages contain only items and snippets the recipient can see and exclude sensitive fields.                                                                                                                                                                                                                                                                                           | Safe notifications.                                                   | Alert templates                             | [PROP]                                                            |
| BR-SRC-038 | Paid or sponsored placement is not part of organic ranking. Any future promotion must be visually labeled, separate from ranked results, and approved as a scope decision.                                                                                                                                                                                                                                   | Trust; SSOT §4.2 "not an ad network".                                 | Ranking service                             | [SRC: SSOT §4.2 non-goals]; OD-SRC-08                             |
| BR-SRC-039 | A public "How results are ranked" page per entity lists inputs, exclusions and the last change date, and is updated at each ranking release.                                                                                                                                                                                                                                                                 | Transparency.                                                         | Docs and release process                    | [SRC: SSOT BR-124 analog]                                         |
| BR-SRC-040 | Evidence-based filters in talent search default to "Any"; choosing a minimum shows a notice that candidates without evidence are hidden; filters use only recruiter-visible evidence.                                                                                                                                                                                                                        | Don't penalize unverified candidates silently.                        | Talent filter builder                       | [DER]; EVD BR-EVD-025                                             |
| BR-SRC-041 | Queries are analyzed per language; unsupported languages fall back to a generic analyzer with a notice; skills resolve to language-independent canonical ids.                                                                                                                                                                                                                                                | Inclusive search.                                                     | Analyzer                                    | [PROP]                                                            |
| BR-SRC-042 | Canonical skills are created only by taxonomy editors; merges leave redirects; relationships are directional and `prerequisite_of` is acyclic; traversal is bounded to 5 hops.                                                                                                                                                                                                                               | Governed taxonomy.                                                    | Taxonomy service                            | [SRC: SSOT BR-141, BR-142, BR-146, BR-147]                        |
| BR-SRC-043 | A skill candidate is promoted only with at least 5 independent signals in the window and editor approval; `correlates_with` edges are computed, not manual.                                                                                                                                                                                                                                                  | Quality control.                                                      | Emerging skills job                         | [SRC: SSOT BR-143, BR-148]                                        |
| BR-SRC-044 | Each skill has a decay class that EVD uses for freshness; changing a class recomputes freshness with a note and is versioned.                                                                                                                                                                                                                                                                                | Consistent freshness.                                                 | Taxonomy service                            | [SRC: SSOT F-123]; [PROP]                                         |
| BR-SRC-045 | Activity signals in talent search come only from candidate-consented, evidence-backed records (verified contributions, assessed completions, emerging-skill evidence, recognition labels, endorsements); platform engagement such as logins, time on platform, message, view or follow counts, streaks, XP and leaderboard rank is never a signal, and signals are filters and labels, not rank multipliers. | Rewards real work, resists gaming and avoids behavioral surveillance. | Signal builder; query service               | [DER] [SRC: SSOT F-159 acceptance: no gaming vectors; BR-AIC-005] |
| BR-SRC-046 | Candidate consent for activity signals is opt-in per category and revocable; a candidate with no signals is never excluded or down-ranked by default; signal facets are included in selection-rate audits under BR-SRC-010.                                                                                                                                                                                  | Fairness and consent.                                                 | Consent ledger; query service; fairness job | [PROP]                                                            |

## 6. State machines

### SM-SRC-01 — Saved search

States: `active`, `paused` (user or automatic), `suspended` (entitlement or permission lapsed), `deleted`. Terminal: `deleted`.

| From                          | To          | Trigger                                                 | Guard       |
| ----------------------------- | ----------- | ------------------------------------------------------- | ----------- |
| `[*]`                         | `active`    | User saves                                              | under limit |
| `active`                      | `paused`    | User pauses; 90 days unopened plus 14 days after prompt | none        |
| `paused`                      | `active`    | User resumes                                            | none        |
| `active`                      | `suspended` | Recruiter entitlement lapses or access lost             | none        |
| `suspended`                   | `active`    | Entitlement restored                                    | none        |
| `active`/`paused`/`suspended` | `deleted`   | User deletes or account erased                          | none        |

```mermaid
stateDiagram-v2
    [*] --> active
    active --> paused: user pauses or inactivity
    paused --> active: user resumes
    active --> suspended: entitlement lapsed
    suspended --> active: entitlement restored
    active --> deleted: user deletes
    paused --> deleted: user deletes
    suspended --> deleted: user deletes
    deleted --> [*]
```

### SM-SRC-02 — Index version

States: `building`, `validating`, `ready`, `live`, `retired`, `failed`, `rolled_back`. Terminal: `retired`, `failed`.

| From          | To            | Trigger                               | Guard                          |
| ------------- | ------------- | ------------------------------------- | ------------------------------ |
| `[*]`         | `building`    | PAD creates version                   | none                           |
| `building`    | `validating`  | Build completes                       | none                           |
| `building`    | `failed`      | Build error                           | none                           |
| `validating`  | `ready`       | Parity, quality and canary tests pass | none                           |
| `validating`  | `failed`      | Tests fail                            | none                           |
| `ready`       | `live`        | Two approvals and swap                | change window                  |
| `live`        | `rolled_back` | Rollback                              | previous version within window |
| `live`        | `retired`     | Replaced and window ends              | none                           |
| `rolled_back` | `retired`     | Retention window ends                 | none                           |

```mermaid
stateDiagram-v2
    [*] --> building
    building --> validating: build done
    building --> failed: build error
    validating --> ready: tests pass
    validating --> failed: tests fail
    ready --> live: approved and swapped
    live --> rolled_back: rollback
    live --> retired: replaced
    rolled_back --> retired: window ends
    failed --> [*]
    retired --> [*]
```

### SM-SRC-03 — Taxonomy skill

States: `candidate`, `active`, `deprecated`, `merged`, `rejected`. Terminal: `merged`, `rejected`.

| From                  | To           | Trigger                             | Guard                    |
| --------------------- | ------------ | ----------------------------------- | ------------------------ |
| `[*]`                 | `candidate`  | User proposal or emerging detection | ≥ 5 signals for detected |
| `candidate`           | `active`     | Editor approves                     | unique name and aliases  |
| `candidate`           | `rejected`   | Editor rejects                      | reason                   |
| `candidate`           | `merged`     | Editor merges into existing         | target active            |
| `active`              | `deprecated` | Editor deprecates                   | impact preview confirmed |
| `deprecated`          | `active`     | Editor reactivates                  | none                     |
| `active`/`deprecated` | `merged`     | Merge                               | redirect created         |

```mermaid
stateDiagram-v2
    [*] --> candidate
    candidate --> active: approved
    candidate --> rejected: rejected
    candidate --> merged: merged
    active --> deprecated: deprecated
    deprecated --> active: reactivated
    active --> merged: merged
    deprecated --> merged: merged
    rejected --> [*]
    merged --> [*]
```

### SM-SRC-04 — Ranking or synonym release

States: `draft`, `evaluating`, `shadow`, `awaiting_approval`, `released`, `rolled_back`, `rejected`. Terminal: `rejected`, `rolled_back`.

| From                | To                  | Trigger                          | Guard                 |
| ------------------- | ------------------- | -------------------------------- | --------------------- |
| `[*]`               | `draft`             | Author creates                   | none                  |
| `draft`             | `evaluating`        | Run offline evaluation           | judgment set coverage |
| `evaluating`        | `shadow`            | Metrics pass                     | thresholds            |
| `evaluating`        | `rejected`          | Metrics fail and author abandons | none                  |
| `shadow`            | `awaiting_approval` | Shadow run complete              | no errors             |
| `awaiting_approval` | `released`          | Second approver releases         | different person      |
| `awaiting_approval` | `rejected`          | Approver rejects                 | reason                |
| `released`          | `rolled_back`       | Rollback                         | none                  |

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> evaluating: run evaluation
    evaluating --> shadow: metrics pass
    evaluating --> rejected: abandoned
    shadow --> awaiting_approval: shadow done
    awaiting_approval --> released: second approver
    awaiting_approval --> rejected: rejected
    released --> rolled_back: rollback
    rejected --> [*]
    rolled_back --> [*]
```

### SM-SRC-05 — Index document

States: `pending`, `indexed`, `hidden`, `deleted`. Terminal: `deleted`. Transitions: `[*]` to `pending` (change event received), `pending` to `indexed` (built and written), `indexed` to `pending` (update event), `indexed`/`pending` to `hidden` (visibility reduced or suspended), `hidden` to `pending` (visibility restored), any to `deleted` (source deleted, erased).

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> indexed: built and written
    indexed --> pending: update event
    indexed --> hidden: visibility reduced
    pending --> hidden: visibility reduced
    hidden --> pending: visibility restored
    pending --> deleted: source deleted
    indexed --> deleted: source deleted
    hidden --> deleted: source deleted
    deleted --> [*]
```

## 7. Screen inventory

| ID          | Name                        | Route proposal                    | Roles         | Purpose                                        | Key states                                     |
| ----------- | --------------------------- | --------------------------------- | ------------- | ---------------------------------------------- | ---------------------------------------------- |
| SCR-SRC-001 | Command palette             | overlay (`⌘K`)                    | all           | Global search and actions (FR-SRC-001)         | empty with recents, results, loading, degraded |
| SCR-SRC-002 | Search results              | `/search`                         | all           | Entity tabs, filters, sort (FR-SRC-002)        | results, zero results, error, limited mode     |
| SCR-SRC-003 | Job search                  | `/jobs`                           | all           | Job search (FR-SRC-003)                        | results, closed job, no pay                    |
| SCR-SRC-004 | People search               | `/search?type=people`             | all           | People search (FR-SRC-004)                     | results, guest capped                          |
| SCR-SRC-005 | Course search               | `/learn`                          | all           | Course search (FR-SRC-005)                     | results, private excluded                      |
| SCR-SRC-006 | Company search              | `/companies`                      | all           | Company search (FR-SRC-006)                    | results                                        |
| SCR-SRC-007 | Challenge search            | `/challenges`                     | all           | Challenge search (FR-SRC-007)                  | results, contest upcoming                      |
| SCR-SRC-008 | Content search              | `/search?type=content`            | all           | Content search (FR-SRC-008)                    | results                                        |
| SCR-SRC-009 | Filter panel and drawer     | component                         | all           | Filters and facets (FR-SRC-012)                | desktop, mobile drawer, invalid filter         |
| SCR-SRC-010 | Why this result popover     | component                         | all           | Explanation (FR-SRC-015)                       | loaded, unavailable                            |
| SCR-SRC-011 | How results are ranked      | `/help/ranking/:entity`           | all           | Transparency (FR-SRC-015)                      | per entity, changelog                          |
| SCR-SRC-012 | Search settings             | `/settings/search`                | signed-in     | Personalization, history (FR-SRC-016, 019)     | on, off, cleared                               |
| SCR-SRC-013 | Saved searches              | `/searches`                       | signed-in     | Manage (FR-SRC-017)                            | empty, limit reached, new badge                |
| SCR-SRC-014 | Save search dialog          | modal                             | signed-in     | Name and frequency (FR-SRC-017)                | valid, duplicate                               |
| SCR-SRC-015 | Alert settings and email    | `/searches/:id/alerts`            | signed-in     | Alerts (FR-SRC-018)                            | none, daily, paused                            |
| SCR-SRC-016 | Recruiter talent search     | `/recruiter/search`               | REC, HMG, EAD | Talent search (FR-SRC-021)                     | results, blind mode, rate limited              |
| SCR-SRC-017 | Talent candidate side panel | panel                             | REC, HMG      | Quick review with evidence (FR-SRC-021, 023)   | loaded, candidate unavailable                  |
| SCR-SRC-018 | Talent saved searches       | `/recruiter/search/saved`         | REC, HMG, EAD | Saved talent searches (FR-SRC-021)             | entitlement lapsed                             |
| SCR-SRC-019 | Fair search report          | `/recruiter/search/fairness`      | EAD           | Org fairness summary (FR-SRC-022)              | insufficient data, alert                       |
| SCR-SRC-020 | Search appearances          | `/profile/search-appearances`     | CAN           | Insights (FR-SRC-024)                          | low volume, stealth                            |
| SCR-SRC-021 | Empty and error states      | component                         | all           | Recovery (FR-SRC-028)                          | zero results, error, rate limited              |
| SCR-SRC-022 | Index health                | `/admin/search/index`             | PAD           | Pipelines (FR-SRC-025)                         | lag, drift, dead letters                       |
| SCR-SRC-023 | Index versions              | `/admin/search/versions`          | PAD           | Build, validate, swap (FR-SRC-026)             | building, awaiting approval                    |
| SCR-SRC-024 | Relevance console           | `/admin/search/relevance`         | PAD           | Profiles and evaluations (FR-SRC-027)          | draft, shadow, released                        |
| SCR-SRC-025 | Abuse console               | `/admin/search/abuse`             | PAD, SAD      | Signals and blocks (FR-SRC-029)                | signals, appeals                               |
| SCR-SRC-026 | Leakage audit               | `/admin/search/audit`             | SAD           | Canary and synthetic viewer tests (FR-SRC-020) | pass, fail                                     |
| SCR-SRC-027 | Taxonomy console            | `/admin/taxonomy`                 | PAD           | Skills, relationships (FR-SRC-030)             | tree, merge wizard                             |
| SCR-SRC-028 | Proposals queue             | `/admin/taxonomy/proposals`       | PAD           | Review proposals (FR-SRC-030)                  | pending, decided                               |
| SCR-SRC-029 | Synonym sets                | `/admin/taxonomy/synonyms`        | PAD           | Synonyms (FR-SRC-014, 030)                     | test box                                       |
| SCR-SRC-030 | Search analytics            | `/admin/search/analytics`         | PAD, EAD, IAD | Aggregates (FR-SRC-031)                        | suppressed cells                               |
| SCR-SRC-031 | Degraded status             | banner and `/admin/search/status` | all, PAD      | Mode (FR-SRC-034)                              | live, degraded, down                           |
| SCR-SRC-032 | Location picker             | component                         | all           | Place resolve (FR-SRC-033)                     | ambiguous, denied location                     |

## 8. Data entities owned

| ID         | Name                      | Key attributes                                                                                                                                                            | Relationships                                             | Retention class                                                 |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| ENT-SRC-01 | SearchDocument            | entityType, entityId, version, fieldGroups (public, connections, recruiter, owner), audiencePolicy, state, indexedAt                                                      | derived from source entities                              | Derived; follows source                                         |
| ENT-SRC-02 | SearchQueryLogEntry       | id, userHash, entity, redactedQuery, filterKeys, resultCount, latency, clickedPosition, at                                                                                | n:1 user hash                                             | 90 days                                                         |
| ENT-SRC-03 | RecentSearch              | id, userId, entity, query, filters, at                                                                                                                                    | n:1 user                                                  | 90 days or until deleted                                        |
| ENT-SRC-04 | SavedSearch               | id, ownerId, kind (general, talent), entity, structuredQuery, name, frequency, state, lastSeenAt                                                                          | n:1 user; 1:n alert deliveries                            | Until deleted or erased                                         |
| ENT-SRC-05 | SearchAlertSubscription   | id, savedSearchId, channels, quietHours, lastEvaluatedAt                                                                                                                  | 1:1 SavedSearch                                           | With saved search                                               |
| ENT-SRC-06 | AlertDelivery             | id, subscriptionId, itemIds, sentAt, idempotencyKey                                                                                                                       | n:1 Subscription                                          | 90 days                                                         |
| ENT-SRC-07 | SynonymSet                | id, terms, type (equivalent, directional), scope, version, status                                                                                                         | referenced by analyzers                                   | Versioned permanent                                             |
| ENT-SRC-08 | TaxonomySkill             | id, canonicalName, slug, category, description, aliases, decayClass, status, version                                                                                      | 1:n relationships; referenced by PRF, EVD, JOB, LRN, ASM  | Permanent                                                       |
| ENT-SRC-09 | SkillRelationship         | id, fromSkillId, toSkillId, type, weight, source (manual, computed)                                                                                                       | n:1 skills                                                | Permanent                                                       |
| ENT-SRC-10 | RankingProfile            | id, entity, version, weights, features, status, changelog                                                                                                                 | referenced by queries                                     | Permanent history                                               |
| ENT-SRC-11 | RelevanceJudgmentSet      | id, entity, queries, labels, raters, version                                                                                                                              | used in evaluations                                       | Permanent, no personal data                                     |
| ENT-SRC-12 | IndexJob                  | id, entityType, kind (incremental, reindex, repair), state, counts, startedAt                                                                                             | n:1 IndexVersion                                          | 90 days                                                         |
| ENT-SRC-13 | IndexVersion              | id, entityType, schemaHash, state, validationReport, approvers                                                                                                            | 1:n IndexJob                                              | 7 days after retired; report permanent                          |
| ENT-SRC-14 | TalentSearchAuditEntry    | id, recruiterId, orgId, parsedQuery, resultCount, viewedIds, exportedIds, at                                                                                              | n:1 org                                                   | 24 months                                                       |
| ENT-SRC-15 | FairnessAuditReport       | id, scope, period, metrics, alerts, k                                                                                                                                     | aggregate only                                            | 36 months                                                       |
| ENT-SRC-16 | SearchAppearanceAggregate | profileId, week, count, openCount, topSkills                                                                                                                              | n:1 profile                                               | 12 months                                                       |
| ENT-SRC-17 | PersonalizationProfile    | userId, features, enabledSignals, updatedAt                                                                                                                               | 1:1 user                                                  | Until off or erased                                             |
| ENT-SRC-18 | BlockedTerm               | id, term, scope (suggest, index), reason                                                                                                                                  | read by suggest pipeline                                  | Permanent                                                       |
| ENT-SRC-19 | EmergingSkillCandidate    | id, term, signalCount, firstSeen, sources, status                                                                                                                         | may become TaxonomySkill                                  | 12 months                                                       |
| ENT-SRC-20 | SearchAbuseSignal         | id, actorKey, type, severity, action, at                                                                                                                                  | n:1 actor                                                 | 90 days                                                         |
| ENT-SRC-21 | PlaceRecord               | id, name, hierarchy, coordinates, aliases                                                                                                                                 | referenced by documents                                   | Permanent                                                       |
| ENT-SRC-22 | SearchAnalyticsAggregate  | metric, dimensions, period, value, k                                                                                                                                      | aggregate                                                 | 24 months                                                       |
| ENT-SRC-23 | CandidateActivitySignal   | candidateId, signalKind (contribution, learning_momentum, emerging_skill, community_standing, attestation), windowDays, value, evidenceRefs[], consentVersion, computedAt | n:1 candidate; derived from EVD, LRN, ASM and REP records | Derived; removed with consent withdrawal or evidence revocation |

```mermaid
erDiagram
    TAXONOMY_SKILL ||--o{ SKILL_RELATIONSHIP : has
    TAXONOMY_SKILL ||--o{ EMERGING_SKILL_CANDIDATE : promoted_from
    SAVED_SEARCH ||--|| SEARCH_ALERT_SUBSCRIPTION : alerts
    SEARCH_ALERT_SUBSCRIPTION ||--o{ ALERT_DELIVERY : sends
    INDEX_VERSION ||--o{ INDEX_JOB : built_by
    RANKING_PROFILE }o--o{ RELEVANCE_JUDGMENT_SET : evaluated_with
    SEARCH_DOCUMENT }o--|| PLACE_RECORD : located_at
    SEARCH_DOCUMENT }o--o{ TAXONOMY_SKILL : tagged_with
    TALENT_SEARCH_AUDIT_ENTRY }o--|| SAVED_SEARCH : may_originate_from
```

## 9. Events emitted and consumed

### 9.1 Emitted

| ID          | Event                                   | Trigger                           | Key payload                              | Consumers                          |
| ----------- | --------------------------------------- | --------------------------------- | ---------------------------------------- | ---------------------------------- |
| EVT-SRC-001 | `src.search.executed`                   | Search query completed (redacted) | entity, filterKeys, resultCount, latency | ANL                                |
| EVT-SRC-002 | `src.search.zero_results`               | Zero results                      | entity, filterKeys                       | ANL, taxonomy review               |
| EVT-SRC-003 | `src.result.clicked`                    | Result opened                     | entity, position                         | ANL, ranking evaluation            |
| EVT-SRC-004 | `src.savedsearch.created`               | Saved                             | savedSearchId, kind                      | ANL                                |
| EVT-SRC-005 | `src.savedsearch.deleted`               | Deleted                           | savedSearchId                            | ANL                                |
| EVT-SRC-006 | `src.alert.due`                         | Alert evaluation produced items   | subscriptionId, itemIds                  | NTF                                |
| EVT-SRC-007 | `src.alert.unsubscribed`                | One-click unsubscribe             | subscriptionId                           | NTF                                |
| EVT-SRC-008 | `src.talent.searched`                   | Talent search executed            | orgId, recruiterId, resultCount          | EMP audit, BIL metering            |
| EVT-SRC-009 | `src.talent.profile_viewed_from_search` | Candidate opened from search      | candidateRef (hashed), orgId             | PRF views, ANL                     |
| EVT-SRC-010 | `src.talent.fairness_alert`             | Threshold breached                | scope, metric                            | ADM, EAD                           |
| EVT-SRC-011 | `src.skill.created`                     | Skill activated                   | skillId                                  | PRF, EVD, JOB, LRN                 |
| EVT-SRC-012 | `src.skill.updated`                     | Alias, class or category change   | skillId, changes                         | EVD, indexers                      |
| EVT-SRC-013 | `src.skill.deprecated`                  | Deprecated                        | skillId, supersededBy                    | PRF, EVD, JOB, LRN                 |
| EVT-SRC-014 | `src.skill.merged`                      | Merge                             | fromId, toId                             | PRF, EVD, JOB, LRN, saved searches |
| EVT-SRC-015 | `src.skill.proposed`                    | User or system proposal           | proposalId                               | ADM                                |
| EVT-SRC-016 | `src.synonyms.released`                 | Synonym set released              | version                                  | indexers                           |
| EVT-SRC-017 | `src.ranking.released`                  | Ranking profile released          | entity, version                          | docs, ANL                          |
| EVT-SRC-018 | `src.index.lag_exceeded`                | Lag over threshold                | entityType, lag                          | ADM                                |
| EVT-SRC-019 | `src.index.swapped`                     | Index version live                | entityType, version                      | ADM                                |
| EVT-SRC-020 | `src.abuse.detected`                    | Abuse signal action               | actorKey, type, action                   | ADM, EMP (for orgs)                |
| EVT-SRC-021 | `src.mode.changed`                      | Live/degraded/down                | mode                                     | ADM, status page                   |
| EVT-SRC-022 | `src.leak_canary.failed`                | Leakage test failure              | entityType                               | SAD, ADM                           |

### 9.2 Consumed (planned names)

`prf.profile.updated`, `prf.section.visibility_changed`, `prf.discoverability.changed`, `prf.profile.hidden`, `jobs.job.published`, `jobs.job.closed`, `lrn.course.published`, `lrn.course.unpublished`, `asm.challenge.published`, `emp.org.updated`, `emp.org.suspended`, `net.post.published`, `net.post.removed`, `evt.event.published`, `evd.evidence.rung_changed`, `evd.credential.status_changed`, `bgv.identity.verified`, `bgv.identity.expired`, `tsf.content.removed`, `tsf.profile.suspended`, `idn.account.erased`, `idn.account.age_flag_changed`, `set.privacy.updated`, `bil.entitlement.changed`, `mkt.skill.signals_updated`.

## 10. Integrations and external dependencies

| Dependency                                          | Purpose                                   | Notes                                                                                                                                                               |
| --------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search engine                                       | Indexing and retrieval                    | Choice recorded as OD-SRC-01; legacy intent is staged: database full-text first, then hybrid, then dedicated engine; adapter interface keeps the engine replaceable |
| Vector or semantic retrieval (optional)             | Hybrid ranking                            | Only after evaluation (FR-SRC-027); never used for protected inference                                                                                              |
| Place dataset provider                              | Location resolution                       | Licensed or open dataset; adapter                                                                                                                                   |
| Outbox and message bus (PLT, planned)               | Change events                             | At-least-once with idempotent consumers                                                                                                                             |
| Edge rate limiter and bot protection (PLT, planned) | Abuse controls                            | CAPTCHA provider optional                                                                                                                                           |
| Email, push and in-app (NTF, planned)               | Alerts                                    | Opt-out class `search_alerts` and `recruiting_alerts`                                                                                                               |
| Analytics pipeline (ANL, planned)                   | Aggregates                                | Whitelisted events                                                                                                                                                  |
| Consent and settings (SET, planned)                 | Personalization, history, region defaults | Consent-first regions                                                                                                                                               |
| Judgment labeling tool                              | Relevance evaluation                      | Internal rater tooling; no real-user data                                                                                                                           |

## 11. Cross-module dependencies

| Depends on                             | Why                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| PRF                                    | Profile content, section visibility, discoverability, blocks, open-to-work, preferences |
| JOB, LRN, ASM, EMP, NET, EVT (planned) | Entities to index and their visibility events                                           |
| EVD                                    | Evidence facets and strength                                                            |
| BGV                                    | Opt-in identity facet                                                                   |
| BIL (planned)                          | Talent search entitlements and metering                                                 |
| NTF (planned)                          | Alert delivery                                                                          |
| TSF, IDN, SET (planned)                | Content removal, age and erasure events, privacy settings                               |
| ATS (planned)                          | Talent pools, aggregates for fairness                                                   |
| MKT (planned)                          | Skill market signals                                                                    |

| Depended on by          | Uses                                              |
| ----------------------- | ------------------------------------------------- |
| PRF, EVD, JOB, LRN, ASM | Canonical skills, skill redirects                 |
| ATS (planned)           | Talent search and saved talent searches           |
| AIC (planned)           | Taxonomy, explanation format                      |
| All modules             | Command palette entries and entity search         |
| PWA (planned)           | Offline search of recent items and saved searches |

## 12. Module-level metrics

| Metric                       | Definition                                         | Formula                                       | Owner role |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------- | ---------- |
| Search success rate          | Searches with at least one click or save           | searches with click / searches with results   | PAD        |
| Zero-result rate             | Searches returning nothing                         | zero-result searches / searches               | PAD        |
| Reformulation rate           | Searches followed by a new query within 60 seconds | reformulated / searches                       | PAD        |
| Autocomplete latency         | p95 suggest latency                                | p95 (target < 100 ms)                         | PAD (SRE)  |
| Search latency               | p95 result latency                                 | p95 (target < 300 ms; talent search < 500 ms) | PAD (SRE)  |
| Index freshness              | p95 lag by entity                                  | p95 (indexedAt − sourceChangedAt)             | PAD        |
| Leakage defects              | Confirmed visibility leaks                         | count (target 0), canary failures             | SAD        |
| Alert engagement             | Alerts opened or clicked                           | clicked / delivered                           | PAD        |
| Alert unsubscribe rate       | Unsubscribes per alert sent                        | unsubscribed / delivered                      | PAD        |
| Taxonomy coverage            | Tagged items with canonical skills                 | tagged / items with skill fields              | PAD        |
| Proposal turnaround          | Median days from proposal to decision              | median                                        | PAD        |
| Talent search fairness ratio | Selection-rate ratio by cohort (k ≥ 10)            | min cohort rate / max cohort rate             | SAD        |
| Abuse block precision        | Blocks upheld on appeal                            | upheld / appeals                              | PAD        |
| Degraded-mode minutes        | Time in non-live mode                              | sum minutes                                   | PAD (SRE)  |

## 13. Open decisions

| ID        | Question                                                                                                                                                                                                                     | Options                                                                                                   | Default proposal                                                                                                                                               | Who decides                     | Blocking               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------- |
| OD-SRC-01 | Which search engine, and when does the staged maturity move (database FTS to hybrid to dedicated engine)?                                                                                                                    | Database FTS only; managed engine; self-hosted engine                                                     | Start with database FTS plus trigram for R2; adopt a dedicated engine behind the adapter when people search or volume requires it (trigger criteria to be set) | Architecture lead               | FR-SRC-025, FR-SRC-026 |
| OD-SRC-02 | Is semantic or vector retrieval in scope for search (separate from AIC matching)?                                                                                                                                            | No; hybrid after evaluation; yes                                                                          | Hybrid after offline evaluation and fairness checks                                                                                                            | Product owner                   | FR-SRC-027             |
| OD-SRC-03 | Is employer rating a legitimate job ranking input (legacy weight 0.10)?                                                                                                                                                      | Keep disclosed; remove; make a filter only                                                                | Keep disclosed at launch; reconsider after evaluation; never for talent ranking                                                                                | Product owner                   | BR-SRC-005, FR-SRC-003 |
| OD-SRC-04 | Fairness audit requirements for talent search (automated-decision regulations)                                                                                                                                               | Internal monitoring only; formal third-party bias audit                                                   | Internal monitoring plus audit-ready documentation; third-party audit per counsel                                                                              | Legal + product owner           | FR-SRC-022             |
| OD-SRC-05 | Personalization default on or off                                                                                                                                                                                            | On with disclosure; off until opt-in; region-based                                                        | On with disclosure except consent-first regions                                                                                                                | Product owner + privacy officer | FR-SRC-016             |
| OD-SRC-06 | Search history retention                                                                                                                                                                                                     | 30, 90, 365 days                                                                                          | 90 days                                                                                                                                                        | Privacy officer                 | FR-SRC-019, BR-SRC-013 |
| OD-SRC-07 | Launch languages for multilingual search                                                                                                                                                                                     | English only; add per demand                                                                              | English first, others by `[DEC-REQ]` demand                                                                                                                    | Product owner                   | FR-SRC-032             |
| OD-SRC-08 | May promoted placements ever exist (conflict with SSOT §4.2 "not an ad network")?                                                                                                                                            | Never; labeled sponsored slots outside ranking                                                            | Never in R0–R5; revisit with explicit scope decision                                                                                                           | Product owner                   | BR-SRC-038             |
| OD-SRC-09 | Is "taxonomy editor" a distinct role?                                                                                                                                                                                        | PAD sub-role; new role                                                                                    | PAD sub-role                                                                                                                                                   | Product owner                   | Permission matrix      |
| OD-SRC-10 | Can guests search people at all?                                                                                                                                                                                             | No; public indexable only with caps; yes                                                                  | Public indexable only, 20 results, no pagination                                                                                                               | Product owner + privacy officer | FR-SRC-004             |
| OD-SRC-11 | Should searching people be possible for employers without verified organization status?                                                                                                                                      | No; limited                                                                                               | No (verified orgs only for talent search); normal people search for all signed-in users                                                                        | Product owner                   | FR-SRC-021             |
| OD-SRC-12 | Is a global "search everything including private messages" feature intended?                                                                                                                                                 | No; own messages only (MSG)                                                                               | Own messages only, owned by MSG, not SRC                                                                                                                       | Product owner                   | Scope                  |
| OD-SRC-13 | Which behavioral or activity signals may recruiters use in discovery, given the SSOT §4.2 limit on ungoverned automated decisions and the fairness risk of engagement-based ranking (SSOT F-159 lists "engagement scoring")? | A: evidence-derived signals only, as filters (FR-SRC-035); B: A plus platform engagement metrics; C: none | A `[PROP]`                                                                                                                                                     | Product owner and fairness lead | FR-SRC-035             |

## 14. Risks

| ID         | Risk                                                                               | Impact                                   | Mitigation                                                                                        |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RSK-SRC-01 | Search leaks hidden or private data through results, counts, suggestions or alerts | Privacy breach, legal exposure           | Two-layer permission checks, canary tests in CI and production, field-group indexing, fail closed |
| RSK-SRC-02 | Talent search produces discriminatory outcomes                                     | Legal and reputational harm              | Excluded attributes, blind mode, monitoring, proxy review                                         |
| RSK-SRC-03 | Scraping of people data                                                            | Privacy and competitive harm             | Rate limits, caps, anomaly detection, honeypots, watermarking                                     |
| RSK-SRC-04 | Index lag shows closed jobs or removed content                                     | Poor trust                               | Freshness targets, reconciliation, query-time status checks                                       |
| RSK-SRC-05 | Ranking changes degrade relevance unnoticed                                        | User dissatisfaction                     | Offline and shadow evaluation, approvals, rollback                                                |
| RSK-SRC-06 | Taxonomy drift and duplicate skills                                                | Poor matching and evidence fragmentation | Governed editing, merge redirects, proposal queue                                                 |
| RSK-SRC-07 | Alert fatigue or alert leaks                                                       | Unsubscribes, privacy issues             | Caps, digest, permission recheck, content minimization                                            |
| RSK-SRC-08 | Engine migration causes outages or inconsistent results                            | Downtime                                 | Adapter interface, versioned indexes, shadow reads, rollback                                      |
| RSK-SRC-09 | Query logs hold sensitive data                                                     | Privacy risk                             | Redaction, short retention, restricted access                                                     |
| RSK-SRC-10 | Recruiters over-trust evidence filters or rankings                                 | Unfair rejections                        | Default "Any", explanation, no automatic rejection, training text                                 |

## 15. Legacy source trace

| Legacy source                                                                  | Used for                                                                                          | Dropped or changed                                                                                                               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SSOT.md` F-20 Command Search (⌘K)                                             | FR-SRC-001, keyboard model                                                                        | Action registry and role gating added [PROP]                                                                                     |
| `SSOT.md` F-32 Saved Searches & Job Alerts; F-04 steps 1–2, 7                  | Filters, ranking weights, saved searches, new-only alerts, cursor pagination                      | Alert caps, digest rules and permission re-check added                                                                           |
| `SSOT.md` F-34, F-147 Unified Search & Discovery                               | Unified index, facets, autocomplete, typo tolerance, personalization, analytics, maturity roadmap | `BR-263..BR-268` named but undefined in the legacy registries; rules re-derived as BR-SRC-001..044; SCI-57 not defined in source |
| `SSOT.md` F-84 Skills Graph & Taxonomy, BR-141..BR-148                         | FR-SRC-030, FR-SRC-014, BR-SRC-042, 043                                                           | Market signals moved to MKT (planned); skill graph traversal features (readiness, paths) not owned here                          |
| `SSOT.md` F-92 Advanced Recruiter Search                                       | FR-SRC-021, FR-SRC-016 stealth, privacy                                                           | Talent pools, outreach credits, analytics moved to ATS (planned); fairness controls added                                        |
| `SSOT.md` F-123 Skill Decay                                                    | Decay class in taxonomy                                                                           | Freshness calculation owned by EVD                                                                                               |
| `SSOT.md` F-96, §11.2, §20, §15.7                                              | Rate limit pattern, UI states, resilience, hardening                                              | Applied to search                                                                                                                |
| `SSOT.md` §4.2 non-goals (not an ad network)                                   | BR-SRC-038, OD-SRC-08                                                                             | Paid placement excluded                                                                                                          |
| `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` (test names mention BR-265..267) | Evidence the legacy tests referred to autocomplete, Levenshtein and filters                       | Not used as status                                                                                                               |
| `ARCHITECTURE.md`, `FEATURE_STATUS_2026-10-21.md`                              | Not used                                                                                          | n/a                                                                                                                              |

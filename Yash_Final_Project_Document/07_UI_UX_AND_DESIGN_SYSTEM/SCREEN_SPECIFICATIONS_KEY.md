# Key Screen Specifications — 15 screens

Doc ID: UI-03 · Owner: Interaction Design Lead · Version 1.0 · Status: Under Review · Relates: UI-01, UI-02 `SCREEN_REGISTRY.md`, UI-04 `ACTION_REGISTRY.md`, UI-05 `DESIGN_SYSTEM.md`, UI-06 `ACCESSIBILITY_SPEC.md`, UI-07 `PROGRESSIVE_UX_AND_FEEDBACK.md`, INV-T04, INV-T05, INV-T08, INV-T09, INV-T15, INV-T18, INV-T19, INV-T20

Supersedes nothing; linked from the folder index and `MASTER_INDEX`. All content **[TARGET]**. Wireframes are described in regions (no pixel designs). Field limits are design proposals for API contracts to confirm. Terminology from existing pages is **[REF]** only.

## 0. Conventions used in every spec

| Item | Convention |
|---|---|
| Regions | Named landmarks/sections in DOM order; desktop (≥ lg) / tablet (md) / mobile (< md) behaviour |
| Fields | Type · requirement · rule · autocomplete/a11y note. Server re-validates all rules (client validation is convenience). Error text follows UI-05 §11 |
| Standard form behaviours | Error summary + inline errors (UI-06 §7); one primary action; `Idempotency-Key` per intent; focus to `h1` on arrival; unsaved-changes guard on route leave |
| Standard states | loading skeleton · empty · error with trace id · offline (O-c / O-q / O-x per SCR registry legend) |
| Transitions | `→` = navigation; `⟳` = in-place update; `▢` = dialog/overlay |

---

## 1. Login — SCR-SHELL-02 `/login` (MOD-SHELL)

**Purpose:** Authenticate by passkey, password, or organization SSO without cognitive tests. **Roles:** ANON. **Entry:** header link, RD-01 redirect with `next`, email links, session expiry (full logout only). **Layout:** `public`.

### Regions
| Region | Desktop | Tablet | Mobile |
|---|---|---|---|
| Header | Logo (link `/`), language select, Help | same | Logo + overflow menu |
| Main `h1` "Sign in" | Single centered column, max-width 440 | same | Full width, 16 px gutters, no card border |
| Step 1: identifier | Email field + "Continue" (+ passkey autofill via `autocomplete="username webauthn"`) | same | same |
| Step 2: method | If SSO domain → redirect notice; else "Use a passkey" (if supported) and password field | same | same |
| Secondary links | "Forgot password?" · "Create an account" | same | same |
| Footer | Legal, Accessibility, Status | same | same |

### Components
`TextField` (email), `PasswordField` (show/hide toggle, paste allowed), `Button` primary/secondary, `Callout` (errors, SSO, locked), `LinkButton`.

### Fields
| Field | Type | Req. | Rule | Notes |
|---|---|---|---|---|
| Email | email | Yes | RFC-valid, ≤254, trimmed, case-insensitive | `autocomplete="username webauthn"`; label "Email" |
| Password | password | Step 2 (non-SSO, non-passkey) | Not empty; never length-truncated; no composition checks at login | `autocomplete="current-password"`; show/hide control labelled "Show password" (toggle state announced); paste enabled |

### Interaction states
| State | Behaviour |
|---|---|
| Default | Focus on email field (not auto-focused if it would scroll on mobile; `h1` receives focus first per route contract) |
| Domain uses SSO (RD-18) | Replaces step 2 with "Your organization uses single sign-on" + "Continue with SSO" (ACT-AUTH-12) |
| Passkey available | "Use a passkey" primary button; browser UI handles chooser; cancel → silent return |
| Submitting | Button `loading`, fields read-only, `aria-busy` |
| Wrong credentials | Summary alert "Email or password is incorrect" (generic); focus to summary; password cleared, email kept |
| Locked / rate-limited | "Too many attempts. Try again in 15 minutes or reset your password." (time as text); links to ACT-AUTH-07, ACT-AUTH-13 |
| Account paused | "Your account is paused" with reactivate path (RD-16) |
| Step-up required | → `/login/challenge` |
| Offline | Inline callout "You're offline. Sign in needs a connection."; button disabled with reason |
| Already signed in | RD-02 redirect |

### Validation
| Case | Message |
|---|---|
| Empty email | "Enter your email address." |
| Invalid email format | "Enter an email like name@example.com." |
| Empty password | "Enter your password." |

### Navigation transitions
Success → `next` (validated, RD-01) or workspace home (RD-03) or `/workspaces` (many grants). "Create an account" → SHELL-03. "Forgot password?" → SHELL-05.

### Acceptance (design level)
Works with password manager autofill and paste; keyboard order: skip link → language → email → continue → links; no CAPTCHA puzzle (OPEN-UX-09); error text does not reveal whether the email exists; focus visible and not obscured; WCAG 3.3.8 satisfied by passkey/paste/autofill paths.

---

## 2. Candidate onboarding — SCR-CAND-02 `/me/onboarding[/:step]` (MOD-CAND)

**Purpose:** Get a new candidate to a first useful state in ≤ 5 short steps; the only truly valuable outcome is the first evidence item within 7 days (activation measure, STR-01). **Roles:** CAND. **Entry:** after email confirmation (RD-04), "Finish setup" card. **Layout:** `focus` (reduced chrome; "Save and exit" always visible).

### Regions
| Region | Behaviour |
|---|---|
| Header | Logo; "Step 2 of 5"; "Save and exit" |
| Stepper (visual) | Dots + text; steps are routes (`/me/onboarding/goals`, `/skills`, `/resume`, `/privacy`, `/start`) |
| Step body | One question group per step; `h1` per step |
| ActionBar (sticky mobile) | Back (secondary), Next (primary), "Skip for now" (tertiary, optional steps only) |
| Why we ask | Collapsible helper per step explaining use of the data |

### Steps and fields
| Step | Field | Type | Req. | Rule |
|---|---|---|---|---|
| 1 Goals | Goals | checkbox group | No | ≥0 of: Find a job · Switch careers · Learn skills · Prove my skills · Teach |
| 1 | Current situation (optional) | select | No | Student · Working · Between jobs · Other; not used for ranking |
| 2 Skills | Skills | combobox multi | No | 0–20 from taxonomy; custom text becomes suggestion to nearest taxonomy skill; each shown as removable chip (44 px) |
| 3 Résumé | File | FileDrop | No | PDF/DOCX ≤5 MB; scanned; **parsed items are shown as suggestions (Claimed), never auto-saved** (INV-T08) |
| 3 | Accept suggestions | checkbox list | — | Each suggestion individually accepted/edited/dismissed |
| 4 Privacy | Visibility defaults | radio per group (Profile basics · Skills · Evidence · Work history) | Yes (defaults prefilled Private) | Private · Recruiters I allow · Public; explanatory text; "You can change anytime in Privacy" |
| 5 Start | First action | radio cards | No | Add my first evidence · Find jobs · Take a course · Explore later |

### Interaction states
| State | Behaviour |
|---|---|
| Returning mid-flow | Resumes at last saved step; progress persisted per step (server), local draft for text fields (O-q) |
| Résumé parsing | Indeterminate status "Reading your résumé…" with Cancel; after 5 s "Still working"; result "Found 8 items. Review them below." Over-budget or error → "We couldn't read this file. You can enter details yourself." (no blame) |
| AI budget exceeded (INV-T07) | Résumé import offers non-AI structured parsing if available, else manual path; message states plainly |
| Offline | Steps 1, 2, 4 work (queued); step 3 disabled "Needs connection"; finish requires connection |
| Skipped steps | Reminder card on `/me` |

### Navigation transitions
Next → next step route (focus `h1`); Back → previous; Save and exit → `/me` with next-step card; Finish → chosen target (`/me/evidence/new`, `/jobs`, `/learn`, `/me`).

### Acceptance
No step requires the previous optional step; all text can be completed with keyboard only; progress text is real ("Step 2 of 5"), no completion percentage; no forced redirect loops from other routes.

---

## 3. Evidence create — SCR-CAND-08 `/me/evidence/new` (MOD-CAND)

**Purpose:** Capture a claim with artifacts that can later be backed, attested or verified, and make clear what rung it currently has and what could raise it. **Roles:** CAND, INST. **Layout:** `default` with sticky ActionBar (mobile); Stepper optional on mobile (3 steps: Describe → Add proof → Review).

### Regions
| Region | Content |
|---|---|
| Header | `h1` "Add evidence"; breadcrumb (Evidence › New) |
| Section A "What is this?" | Type, title, description |
| Section B "When and where" | Date range, organization/issuer (optional) |
| Section C "Skills it shows" | Skills combobox |
| Section D "Proof" | Files (FileDrop), links; per-item states |
| Section E "Who can see it" | Visibility default (Private) with link to Consent manager |
| Section F "Ask someone to attest" (optional) | Attester details (ACT-EVD-04) |
| Right/aside (≥ xl) or collapsible (mobile) | "How strong is this?" ladder explainer: current rung preview **"Claimed"** and what raises it; AI suggestion panel (optional, collapsed) |
| ActionBar | Save evidence · Discard draft · (saves as Claimed) |

### Components
`TextField`, `TextArea` with counter, `Select`, `DatePicker` (native on touch), `Combobox` (skills), `FileDrop`, `RungMeter` (preview state, text "Will be saved as Claimed"), `AiSuggestionChip`, `Callout`.

### Fields
| Field | Type | Req. | Rule | Notes |
|---|---|---|---|---|
| Type | select | Yes | project · certificate · course · assessment result · work sample · publication · other | Certificate/course/assessment types show "Better: add from the course or assessment itself" helper (links ACT-LRN-06 / ACT-ASM-10) |
| Title | text | Yes | 3–120 chars | |
| Description | textarea | Yes | 10–2000 chars; plain text/markdown subset | Counter appears at 80 % |
| Start / end date | date | No | end ≥ start; not in future for completed items; "ongoing" checkbox | `autocomplete="off"` |
| Issuer / organization | text | No | ≤120 | |
| Skills | combobox multi | Yes (≥1) | 1–10 from taxonomy | Chips |
| Files | FileDrop | No | ≤10 files, ≤25 MB each; pdf, docx, png, jpg, md, zip | Per-file states: uploading (bytes) → scanning → ready / blocked |
| Links | URL list | No | ≤10; https; ≤2048; domain displayed | |
| Default visibility | radio | Yes | Private (default) · Recruiters I allow · Public | Plain-language effect |
| Attester name / email / relationship / message | text/email/select/textarea | No (all-or-none) | Name 2–80; valid email ≠ own; relationship list; message ≤500 | Email preview shown before send (C1) |

### Interaction states
| State | Behaviour |
|---|---|
| Local draft | Autosaves locally (debounced 1 s); banner "Draft on this device"; **save requires connection** (ACT-EVD-01) |
| Uploading | Real byte progress per file; leaving page warns |
| Scanning | "Uploaded — scanning for safety"; file not visible to others until clean (BR-T003) |
| Blocked file | Row error with reason, remove/replace |
| Saving | Button loading; double-submit prevented |
| Saved | Persistent inline confirmation "Saved as Claimed. Add proof or ask someone to attest to strengthen it." with links; focus to confirmation; route → CAND-09 |
| AI suggestion | Panel offers wording help; adoption inserts user-editable text; label "AI suggestion — not evidence"; hidden if budget exhausted |
| Offline | Fields editable; ActionBar shows "Needs connection to save" (disabled with reason) |

### Navigation transitions
Save → SCR-CAND-09; Discard → CAND-07 (confirm if non-empty); Cancel with unsaved changes ▢ "Leave without saving?" (Keep editing / Leave).

### Acceptance
Rung preview never shows anything above Claimed before server confirmation; upload progress is transport-real; screen reader hears file state changes politely; all controls ≥ 44 px.

---

## 4. Evidence detail — SCR-CAND-09 `/me/evidence/:evidenceId` (MOD-CAND)

**Purpose:** Show one evidence item honestly: what is claimed, how strong it is, why, who has attested/verified, who can see it, and what to do next. **Roles:** CAND (owner). Recruiters/faculty see a consent-filtered view rendered by their own remotes via the same rung components.

### Regions
| Region | Content |
|---|---|
| Header | `h1` title; `EvidenceRungBadge` (+ modifier); type, dates; actions menu (Edit, Archive, Ask someone to attest, Dispute) |
| Tabs (route-synced) | Overview · Proof (artifacts) · Checks (verification) · Sharing · History |
| Overview | Description, skills, linked applications |
| Proof | Artifact list with scan status; download (ACT-EVD-11); add more (ACT-EVD-02/03) |
| Checks | `ProvenancePanel` (who/what/when/how for current rung) and a timeline of requests, attestations, disputes |
| Sharing | Active consent scopes for this item (with Revoke), pending requests |
| History | Revisions and rung changes (append-only list) |
| Aside | "Strengthen this": next-step suggestions as rules ("Ask Priya to attest", "Attach a file") |

### Components
`EvidenceRungBadge`, `RungMeter`, `ProvenancePanel`, `Tabs`, `Timeline`, `DataTable` (artifacts), `Callout` (modifiers), `Dialog` (confirmations).

### Content rules
| Rung | Header badge text | Aside default suggestion |
|---|---|---|
| L1 | "Claimed" (dashed border) | Attach a file/link; ask someone to attest |
| L2 | "Backed by artifact" | Ask someone to attest; request verification where an issuer exists |
| L3 | "Peer-attested by Priya Nair (manager)" | Link to issuer verification if available |
| L4 | "Verified by Acme University" + date | — (shows issuer and method) |
| Modifiers | `pending` "Check in progress"; `under-review` "Review requested"; `revoked`/`expired` struck-through label with date and reason category; dependent skills show "Recalculating" (BR-T005) | |

### Fields (edit mode, same rules as ACT-EVD-01) plus
| Field | Rule |
|---|---|
| Revision note | Required when editing an attested/verified item; ≤200 chars; shown in History |

### Interaction states
| State | Behaviour |
|---|---|
| Scanning artifact | Row "Scanning — preview unavailable" |
| Request open | Chip "Requested 3 Nov — expires 17 Nov"; reminder button with remaining count |
| Conflict | 412 → review dialog |
| Revoked | Page remains viewable; actions limited to Dispute and Archive; banner explains consequences |
| Offline | O-c read-only; actions disabled with reason |
| Not found / not yours | Neutral 404 (INV-T02) |

### Navigation transitions
Edit → in-place edit mode (URL `?edit=1`); Archive → CAND-07 with Undo; Ask to attest ▢ dialog route; Sharing tab → "Manage all sharing" → ACC-09 filtered to this item.

### Acceptance
Rung label and icon come from server enum only; "Verified" appears only for L4 and always with issuer; each modifier available as text; focus order tabs → panel; History is a list not a diff image.

---

## 5. Profile — SCR-CAND-03 `/me/profile` (MOD-CAND)

**Purpose:** Edit the person's profile with explicit control of what each field reveals, plus an honest evidence summary. **Roles:** CAND, INST (own).

### Regions
| Region | Content |
|---|---|
| Header | `h1` "Your profile"; "Preview as…" (ACT-PRO-13); "Visibility & sharing" link → CAND-04; publish status chip |
| Identity block | Avatar (ACT-PRO-02), full name, preferred name, pronouns (optional), headline, location |
| About | Summary textarea |
| Skills | Chips list with confidence text from evidence ("2 items", "no evidence yet"), add/remove |
| Links | Up to 5 links |
| Work history summary | Read-only list with per-entry verification state → CAND-10 |
| Evidence summary | Counts per rung: "1 Verified · 2 Peer-attested · 3 Backed by artifact · 4 Claimed" (never a % or score) → CAND-07 |
| Aside (xl) | Profile health: sections empty (text list), visibility summary, "Who has viewed" teaser → ACC-10 |
| ActionBar | Save changes (or autosave with explicit "Saved" status) |

### Fields
| Field | Type | Req. | Rule | Visibility control |
|---|---|---|---|---|
| Full name | text | Yes | 1–100; `autocomplete="name"` | Always visible to people the user applies to / has consented; never "Public" unless user selects |
| Preferred name | text | No | ≤50 | per-field |
| Pronouns | text | No | ≤30 | per-field |
| Headline | text | Yes (to publish) | ≤120 | per-field |
| Location | text/combobox | No | free text or city list ≤100 | per-field; precision control (country / region / city) |
| Summary | textarea | No | ≤2000 | per-field |
| Links | url list | No | ≤5 https | per-field |
| Languages | multi-select | No | ≤10 | per-field |
| Availability | select | No | Open · Casually looking · Not looking | per-field; feeds recruiter filters only if shared |
| Handle | text | For publishing | 3–30 `[a-z0-9-]`, unique | public URL |

### Interaction states
| State | Behaviour |
|---|---|
| Autosave | Field-level save on blur; status text "Saved 14:02" / "Waiting to sync" (O-q) |
| Conflict | Review changes dialog (ACT-SYS-06) |
| Visibility change to Public | C1 preview of exactly what becomes public |
| Unpublished | Banner "Your profile isn't public. Recruiters can only see it if you share it." |
| Offline | Edits queue (ADR-T10) |

### Navigation transitions
Preview ⟳ side panel/new route `?preview=public`; Visibility → CAND-04; Evidence summary → CAND-07; Work history → CAND-10.

### Acceptance
Every field shows its current visibility as text beside the control; no "profile strength" score; changes to AI-assisted text show origin chip until user edits.

---

## 6. Job search — SCR-OPP-01 `/jobs` (MOD-OPP)

**Purpose:** Find relevant jobs quickly with understandable relevance and no pay-to-rank. **Roles:** ANON, CAND, others.

### Regions
| Region | Desktop | Mobile |
|---|---|---|
| Search bar | Keyword + location + "Search" | Keyword with filter button |
| Filters | Left panel (collapsible groups) | Full-screen drawer with Apply / Clear; count on button |
| Saved-search bar | "Save this search" · "Alert me" (ACT-JOB-03/04) | Same under search |
| Results header | "42 jobs" (only if server count exact, else "40+"), sort select, view density | Same |
| Results list | `JobCard` list, cursor "Load more" | Same |
| Detail pane (xl) | Optional split view loads SCR-OPP-02 content | Not used |

### JobCard anatomy
Title (link, h3) · Company (with "Verified employer" **not used**; show "Employer details unverified" only when relevant) · Location/remote · Posted date (`<time>`) · Salary (if given) · 2–4 required skills · **Match chip** (signed-in only): "Strong · Medium · Limited · Not enough information" + "Why" link (ACT-JOB-05) · Save toggle (ACT-JOB-07) · overflow (Not interested, Report).

### Filters / fields
| Filter | Control | Rule |
|---|---|---|
| Keywords | text | ≤200 |
| Location / Remote | combobox + checkbox "Remote" | |
| Skills | multi-combobox | taxonomy |
| Employment type | checkbox group | |
| Seniority | checkbox group | |
| Posted within | radio | 24 h · 7 d · 30 d · any |
| Salary range | min/max numeric | only jobs that list pay (stated) |
| Minimum evidence strength I have | toggle | "Show jobs where my evidence meets must-have skills" (candidate-side, private) |
| Sort | select | Relevance (explained) · Newest |

### Interaction states
| State | Behaviour |
|---|---|
| Initial load | Skeleton list of 6 |
| Typing | Search on submit (not per keystroke); URL updated |
| Filtered-empty | "No jobs match" + chips of active filters + Clear filters + Save search |
| Loading more | "Load more" (button) → polite "20 more loaded", focus first new |
| Anon | No match chips; prompt "Sign in to see why jobs match you" |
| Offline | Last results labelled "Saved copy"; search disabled with reason |
| Match unavailable | chip "Not enough information" (never a number) |

### Navigation transitions
Card title → SCR-OPP-02 (preserves list state); "Why" ▢ opens explanation sheet (same content as OPP-02 panel); Save search ⟳; Apply is not on the card (avoids accidental apply).

### Acceptance
No "Sponsored"/promoted placement; relevance explained in help text; filter drawer focus-trapped with Esc; sort and filters operable by keyboard; results count announced.

---

## 7. Job detail with match explanation — SCR-OPP-02 `/jobs/:jobId` (MOD-OPP)

**Purpose:** Present the role clearly and explain, with uncertainty, how this person's evidence relates to it (INV-T19, ADR-T22).

### Regions
| Region | Content |
|---|---|
| Header | Title, company (link), location, type, posted, closing, status; Save, Share, overflow (Report) |
| Apply panel | Desktop: sticky right column. Mobile: sticky ActionBar "Apply" (ACT-APP-01). Shows "You applied on 3 Nov — View application" when BR-T001 applies |
| Role content | Summary, responsibilities, requirements (**must-have** vs **nice-to-have** skills as separate lists), compensation, process ("How we hire": steps + that people make decisions), accessibility/accommodation statement |
| **Why this matched** | Match explanation panel (below) |
| Company | Short about + link to SCR-OPP-05 |
| Similar jobs | List |

### Match explanation panel (signed-in; collapsed summary + expanded details)
| Block | Content | Rules |
|---|---|---|
| Summary | One sentence: "Medium match: you have evidence for 3 of 5 must-have skills." | Words not numbers; confidence shown alongside |
| Strengths | Skills matched, each with the **rung of the best supporting evidence** (badge) and link to that evidence | Only candidate's own evidence; no other candidates |
| Gaps | Must-have skills with **no evidence** vs **claimed only** vs **no match** — distinct labels | "No evidence yet" ≠ "doesn't have the skill" |
| Uncertainty | "Confidence: medium. Based on 6 of 9 signals. Missing: no work-history verification." Lists inputs used and missing | INV-T19 uncertainty-aware |
| What could improve it | Rule-based actions linking ACT-EVD-01, ACT-VER-02, ACT-LRN-01 | Suggestions, not promises |
| Fairness note | "Companies, not this score, decide who moves forward. Payment never changes how jobs or people are ordered." + "Ask a person to review" (ACT-PRV-08) | Constitution |
| Data used | Expandable list: profile fields, evidence items (titles), preferences | Transparency |

States: unavailable → "We don't have enough information to explain this match yet" + CTA add evidence; anon → sign-in prompt; applied → panel shows snapshot at time of application ("Based on what you shared on 3 Nov").

### Fields
Read-only screen; the only inputs are Save/Share/Report/Apply controls.

### Interaction states
| State | Behaviour |
|---|---|
| Job paused/closed | Banner; Apply disabled with reason; Save kept |
| Already applied | Primary becomes "View application" |
| Profile incomplete | Apply allowed; form prefills what exists |
| Offline | O-c if previously opened; explanation shows "Saved copy" |

### Navigation transitions
Apply → OPP-06; Company → OPP-05; Evidence links → CAND-09; Back → list with preserved state.

### Acceptance
No single bare percentage anywhere; every rung badge follows DESIGN_SYSTEM §7.8; panel is a region with heading "Why this matched"; accessible by screen reader as lists; works at 400 % zoom.

---

## 8. Application form — SCR-OPP-06 `/applications/new/:jobId` (MOD-OPP)

**Purpose:** Submit a considered application in ≤ 4 steps without re-entering data (3.3.7), with explicit, purpose-bound consent for evidence sharing. **Roles:** CAND. **Layout:** `focus`.

### Steps and fields
| Step | Region / field | Type | Req. | Rule |
|---|---|---|---|---|
| 1 Contact & résumé | Name, email, phone | prefilled text | Name, email yes | Editable; phone `autocomplete="tel"`, optional |
| | Résumé variant | radio list | Yes | One of own variants; preview; "Create variant" link opens in new tab-less modal route |
| | Cover note | textarea | If job requires | ≤2000 |
| 2 Evidence to share | Evidence picker | checkbox list with rung badges | No (≤10) | Items scanning excluded; each row shows what the employer will see (title, rung, artifacts?) with per-item toggle "Include files" |
| | Consent summary | static text + checkbox | Yes if any evidence | "Share these N items with Acme Corp for this application. They can view them while the application is active and for X days after unless you revoke." (purpose-bound, INV-T15); unticked by default |
| 3 Questions | Screening questions | per type (text ≤1000, single/multi choice, yes/no, number) | Per job | Required marked in text; knock-out answers do **not** auto-reject (INV-T09); explanatory line "People review answers" |
| | Accessibility needs | textarea | No | Optional, ≤1000, shared only with recruiter if checked |
| 4 Review & submit | Read-only summary of all steps with Edit links | — | — | Match snapshot shown ("what Acme will see about fit" mirrors explanation) |
| | Submit | button | — | ACT-APP-03 |

### Interaction states
| State | Behaviour |
|---|---|
| Draft | Saved on each step; `Waiting to sync` offline; restores at last step |
| Submit | Button loading; idempotent; on success persistent confirmation + notification; focus to confirmation heading |
| Job closed meanwhile | Blocking callout "This job closed on 5 Nov. Your draft is saved." |
| Duplicate (BR-T001) | Redirect to existing application with explanation |
| Evidence changed (revoked) between steps | Row shows "No longer available" and is removed from selection with notice |
| Offline | Steps editable; Submit disabled "Needs connection" |
| Session expiry | Re-auth overlay; data preserved |

### Navigation transitions
Back/Next between steps (routes `/applications/new/:jobId/:step`); Save and exit → OPP-02; Submit → OPP-08.

### Acceptance
No field asked twice; error summary per step; review step satisfies 3.3.4; consent checkbox not pre-ticked and independent of Submit; progress text "Step 3 of 4".

---

## 9. Pipeline board — SCR-HIR-05 `/hiring/jobs/:jobId/pipeline` (MOD-HIR)

**Purpose:** Let recruiters and hiring managers see where candidates are and move them by human decision — never automatically (INV-T09). **Roles:** REC, HM (assigned), ORGADM (O).

### Regions
| Region | Desktop | Mobile |
|---|---|---|
| Header | Job title, status chip, counts per stage, "Board / List" toggle, bulk-select toggle, overflow (Export, Compare) | Condensed; list view default |
| Toolbar | Search within job, filters (stage, reviewer, "needs decision", rung min., source), sort | Filter drawer |
| Board | Horizontal columns per stage (scrollable region labelled "Pipeline columns"); each column list with count | Single-column stage tabs (select stage) + list |
| List view | `DataTable` (default for screen reader users via preference) | Cards |
| Detail pane (xl) | Selected candidate summary + stage actions | Push to HIR-06 |
| Bulk bar | Appears when ≥1 selected: Move, Message, Not moving forward, Add to shortlist, Clear | Bottom sheet |

### Card anatomy
Name (link) · headline · stage age ("In Screening 3 d") · **rung summary** (counts, compact badges) · match chip with Why link (explanation) · flags: "Needs decision", "Interview today", "Evidence hidden by candidate" (lock icon) · assignee avatar · selection checkbox · menu button "Move to…", "Assign", "Add note", "Open". Card has no score and no rank number.

### Interaction states
| State | Behaviour |
|---|---|
| Loading | Column skeletons |
| Column load | 25 cards per column + "Load more in this column"; virtualization >200 |
| Drag (pointer) | Drag handle; drop zones highlighted with text; Esc cancels; non-drag alternative always available (ACT-PIPE-02) |
| Keyboard move | Space picks up, arrows move, Enter drops; announcements |
| Stale move | Card snaps back; inline notice with "Apply my move" |
| Adverse move | Moving to "Not moving forward" opens ▢ requiring reason category and confirmation (ACT-PIPE-05) |
| Live updates | Changes by others appear with subtle "Updated" tag; announcements throttled to summary every 30 s |
| Consent revoked | Card's evidence portion switches to hidden state on next fetch |
| Empty column | "No candidates here" + stage guidance |
| Offline | O-c snapshot labelled with time; moves disabled |
| Permission | HM sees only assigned jobs/candidates |

### Fields (filters & dialogs)
| Control | Rule |
|---|---|
| Search | ≤100 chars; name/headline/skills |
| Stage filter | multi-select from job pipeline |
| Reason category (adverse) | Required select: Skills not matched to role · Position filled · Withdrawn interest · Other (requires note); neutral wording |
| Optional note | ≤1000; internal |
| Candidate message template | Select; preview; default respectful template |

### Navigation transitions
Card → SCR-HIR-06 (keeps pipeline filters via history state); Bulk → confirmation ▢ → HIR-12; Compare → HIR-14; breadcrumb: Hiring › Jobs › `<Job>`.

### Acceptance
Every move is available without dragging; board list semantics (columns as lists with counts); no automatic ordering by score; moves audited; bounded concurrency on bulk (UI-07 §4).

---

## 10. Candidate review — SCR-HIR-06 `/hiring/jobs/:jobId/applications/:applicationId` (MOD-HIR)

**Purpose:** Review one candidate's application and consented evidence, record notes/scorecards, and take human decisions. **Roles:** REC, HM (assigned), ORGADM (O).

### Regions
| Region | Content |
|---|---|
| Header | Candidate name, headline, location; stage chip; assignee; previous/next candidate (within current pipeline filter); actions: Move to…, Schedule interview, Add to shortlist, Not moving forward… |
| Tabs | Application · Evidence · Fit · Notes & scorecards · Timeline |
| Application tab | Résumé variant viewer, answers to screening questions (human-readable), cover note, availability, accommodation notes (if shared) |
| Evidence tab | Items by **rung group** (Verified · Peer-attested · Backed by artifact · Claimed) with provenance; items **hidden by consent** show lock + "Request access" (ACT-PIPE-14); artifacts viewable via audited access |
| Fit tab | Match explanation as in SCR-OPP-02 but recruiter-side: must-haves vs evidence, gaps, uncertainty, **no overall score**, list of inputs; "Flags for review" (e.g. screening knock-out answers) are advisory and say "A person decides" |
| Notes & scorecards | Notes thread (ACT-PIPE-08), scorecards from panel (hidden until own submitted if blind mode), add scorecard |
| Timeline | Application events including candidate-visible messages |
| Aside (xl) | Quick decision card: current stage, next legal stages, reviewers, interview slots |

### Fields (dialogs)
| Dialog | Fields / rules |
|---|---|
| Not moving forward | Reason category (required), note ≤1000, message template select, confirm checkbox "I reviewed this application" |
| Schedule interview | See ACT-PIPE-07 |
| Scorecard | Per-criterion rating 1–5 (anchors), required comment at 1 and 5, recommendation select (Advance · Hold · Do not advance — advice only) |
| Request access | Message ≤300 |

### Interaction states
| State | Behaviour |
|---|---|
| Consent expired/revoked | Evidence tab shows "The candidate stopped sharing this on 5 Nov" with date; cached copies not shown |
| Withdrawn | Banner; read-only except notes |
| Conflict | Stage changed by another → refreshed with notice |
| Decision locked | Terminal stages immutable (INV-T11) with explanation |
| Blind scorecards | "Scorecards from others are hidden until you submit yours" |
| Offline | O-c read-only; notes queue |

### Navigation transitions
Prev/Next candidate keeps tab; Move/Reject ▢ then ⟳; Offer → SCR-HIR-11; Back → pipeline preserving filters.

### Acceptance
No total score; evidence grouping uses the same rung components; consent-hidden state is explicit; adverse path requires human reason; evidence view events are visible to the candidate in their access log.

---

## 11. Referee form — SCR-SHELL-09 `/r/:requestId` (MOD-SHELL)

**Purpose:** Let a referee (P4 Priya) confirm or decline a work-history claim in **under 3 minutes on a phone, with no account** (STAKEHOLDERS §2; BR-T004). **Roles:** REFEREE (single-use, expiring token bound to one request, INV-T05). **Layout:** `focus`/public, minimal header, **no remotes loaded**, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, no analytics or third-party scripts. Time budget: ≤ 4 questions, ≤ 90 seconds reading + ≤ 90 seconds answering.

### Regions
| Region | Content |
|---|---|
| Header | Logo, language select (ACT-REF-06), Help |
| Intro `h1` | "Can you confirm Asha Rao's work at Acme Ltd?" (names from claim; first name only if candidate chose limited disclosure) |
| What happens | 2 sentences: "Your answers go to Asha and to employers she chooses to share with. They are not public. It takes about 2 minutes. You don't need an account." |
| Claim summary card | Employer, job title, dates **as claimed** (read-only), nothing else about the candidate |
| Questions (4) | Q1 relationship, Q2 title, Q3 dates, Q4 comment (optional) |
| Confirmation | Typed name; consent checkbox |
| Actions | "Send my confirmation" (primary, ≥ 52 px) · "I can't confirm this" (secondary) |
| Footer | "This isn't for me / report a problem" (ACT-REF-04) · privacy notice link |

### Fields
| Field | Type | Req. | Rule | A11y / notes |
|---|---|---|---|---|
| Q1 How do you know Asha? | radio | Yes | Manager · Colleague · Report (I managed them) · Client · Other (+ text ≤100) | Visible `fieldset/legend` |
| Q2 Job title | radio per claim | Yes | "Yes, that's right" · "Partly" · "No" | If not "Yes": text "What was it?" ≤120 |
| Q3 Dates | radio | Yes | Yes · Partly · No | If not Yes: dates text ≤60 |
| Q4 Anything to add? | textarea | No | ≤1000; plain text; guidance "Stick to what you saw directly" | Counter at 80 % |
| Your name | text | Yes | 2–80 | `autocomplete="name"` |
| Your role/title | text | No | ≤80 | `autocomplete="organization-title"` |
| Declaration | checkbox | Yes | "This is from my own knowledge" | Not pre-ticked |

### Interaction states
| State | Behaviour |
|---|---|
| Loading | Skeleton card ≤ 1 s; page usable without JS-heavy bundles (shell-only) |
| Token via fragment missing | Show "Enter the 8-character code from your email" field (3.3.8 friendly, paste ok) |
| Valid | Form as above |
| Submitting | Button loading; entries retained locally if the network drops; retry |
| Submitted | → SHELL-10 "Thank you" (no account upsell, no marketing) |
| Declined | → SHELL-10 neutral "Thanks for letting us know" |
| Expired / used / cancelled | → SHELL-10 neutral "This link isn't active" + "Send me a new link" to the **original** address only (ACT-REF-05) |
| Partial answer | Answers are held in memory/session only (not server) for up to 30 min inactivity |
| Offline | Banner; submit retry on reconnect with explicit button (no hidden background send) |
| Language switch | Preserves entered answers |

### Validation messages
"Choose how you know Asha." · "Tell us the job title you remember." · "Enter your name." · "Tick the box to confirm this is from your own knowledge."

### Navigation transitions
Submit/Decline → SHELL-10; no navigation to authenticated areas; no cross-links to marketing.

### Acceptance
Completes in ≤ 3 minutes in a scripted walkthrough on a mid-range phone at 4G-slow; 400 % zoom reflows; screen reader complete; the secret never appears in the visible URL after load; token not logged by analytics; page reveals nothing about the requester beyond name+claim; abuse path present.

---

## 12. Course player — SCR-LRN-04 `/learn/courses/:courseId/lessons/:lessonId` (MOD-LRN)

**Purpose:** Deliver a lesson (video, reading, or quiz) with captions/transcript, resumable progress that only counts when the server confirms it, and notes. **Roles:** CAND (enrolled). **Layout:** `focus`.

### Regions
| Region | Desktop | Mobile |
|---|---|---|
| Top bar | Course title, "Exit course", progress text "Lesson 3 of 12" | same, compact |
| Lesson list (nav) | Left collapsible panel with sections/lessons and status text (Not started · In progress · Complete) | Drawer opened by "Lessons" button |
| Media / content area | Video player or article; lesson `h1` above | Full width |
| Tabs below | Transcript · Notes · Resources · Questions | Same, stacked tabs |
| Footer controls | Previous · Next (enabled when criteria met or lesson non-gated) · "Mark complete" when manual | Sticky ActionBar |

### Components
`VideoPlayer` (captions on by default if user preference; transcript sync; speed 0.75–2×; no autoplay), `Tabs`, `Accordion` (lesson list), `TextArea` (notes), `Callout`.

### Fields
| Field | Rule |
|---|---|
| Note | ≤2000 chars; autosave; O-q (ADR-T10) |
| Quiz answers | per type; submit once or per rules |
| Speed / captions / transcript prefs | stored per user |

### Interaction states
| State | Behaviour |
|---|---|
| Loading | Skeleton player 16:9 reserved |
| Resume | Starts at server-stored position with "Resume from 12:40 / Start over" choice, not silent autoplay |
| Captions missing | Impossible for published courses (publish gate); if data error → player shows "Captions unavailable" + transcript fallback + report |
| Progress | Lesson marked complete only after **server confirms** criteria (ACT-LRN-05); UI never increments on play alone |
| Offline | Text lessons O-c if cached; video O-n "Needs connection"; notes queue |
| Quiz | Immediate feedback per rules; results via server |
| End of course | Completion panel: "Add to my evidence" (ACT-LRN-06) with note what rung it will have (set by server per issuer) |
| Bandwidth low | Quality auto-adjusts; manual select; audio-only option |

### Keyboard (player focused only; no global single-key shortcuts)
`Space/K` play/pause · `←/→` ±10 s · `↑/↓` volume · `C` captions · `T` focus transcript · `F` fullscreen · `Esc` exit fullscreen; all also reachable via visible buttons.

### Navigation transitions
Next/Prev → adjacent lesson route (focus `h1`); Exit → LRN-05 or LRN-03; completion → LRN-05.

### Acceptance
Captions + transcript for every video; no autoplay; reduced-motion respected; controls ≥ 44 px; focus order list → player → tabs; progress honesty rule enforced.

---

## 13. Assessment runner — SCR-LRN-09 `/learn/assessments/:id/attempts/:attemptId` (MOD-LRN)

**Purpose:** Run a timed attempt with server-authoritative time and honest status; enforce `AI_PROHIBITED` where set (INV-T06); route anomalies to human review rather than penalise (INV-T20). **Roles:** CAND. **Layout:** `focus`.

### Regions
| Region | Content |
|---|---|
| Header | Assessment title; **Timer** (text "42 min left", updates every minute, seconds only in last minute; visual + text; "Hide timer" option without hiding warnings); save status ("Saved 14:02"); "Submit" |
| Policy strip | "AI assistance is turned off for this assessment." when `AI_PROHIBITED`; "Integrity notes" explainer link |
| Navigator | Question grid (status: unanswered, answered, flagged, current — icon+text) |
| Question pane | Prompt, answer controls by type; "Flag for later"; Previous/Next |
| Code questions | Split editor + output panel; Run (ACT-ASM-04); language select; reset starter |
| Footer | Unanswered count text; "Review and submit" |

### Question types and fields
| Type | Control | Notes |
|---|---|---|
| Single/multiple choice | radio / checkbox group | Shuffle only if configured; order stable per attempt |
| Short text | textarea ≤ limit | counter |
| Numeric | text with `inputmode="decimal"` | units shown |
| Code | editor (keyboard escape documented) | Runner unavailable → Run disabled with reason; results will be **Unverified** (ADR-T13) |
| File upload | FileDrop | scan states |

### Interaction states
| State | Behaviour |
|---|---|
| Starting | Rules acknowledgement happens on SCR-LRN-08; runner opens at question 1 or resume |
| Autosave | Debounced 2 s with sequence; status text; failed save shows "Not saved — we'll keep trying" and keeps local buffer |
| Connection loss | Banner "You're offline. The timer keeps running on our server. Answers are kept on this device and sent when you reconnect." If attempt expires while offline, server grades what it received; the UI states this honestly on reconnect |
| Timer milestones | Polite announcements at 50 %, 25 %, 10 minutes, 1 minute; not continuous |
| Accommodation | Extra time reflected in timer; label "Includes 25 % extra time" |
| Integrity events | Page-leave events are recorded as notes; UI shows non-judgemental notice "We noted you left the page. This is only a note for a person to review if needed." Never auto-fail (INV-T09, INV-T20) |
| Submit dialog | Lists unanswered/flagged; "Submit now" (irreversible) |
| Time expired | Auto-submit, then result page |
| Runner unavailable | Notice before start and in header: "Code results will be marked Unverified" |
| Camera/proctoring | Not part of baseline; vendor-gated, separate consent screen if ever enabled (DOM-00) |

### Navigation transitions
Next/Prev ⟳; Submit ▢ → SCR-LRN-10; Pause (if allowed) → LRN-08; Exit blocked while active except Pause/Submit (explained).

### Acceptance
Timer not the only way to know time (text); no focus trap in editor; announcements limited; all controls ≥ 44 px; accommodations honoured; no wording implies cheating.

---

## 14. Consent manager — SCR-ACC-09 `/privacy/consents` (MOD-ACC)

**Purpose:** Let a person see, understand and change exactly who can access which data, for what purpose, and until when (INV-T15). **Roles:** CAND, INST (own). **Layout:** `default`.

### Regions
| Region | Content |
|---|---|
| Header | `h1` "Who can see your data"; one-line explainer; link to access log (ACC-10) |
| Summary bar | Counts: "3 active sharing agreements · 1 request waiting" (text) |
| Tabs | Requests · Active sharing · History · Defaults |
| Requests tab | Cards: requester (org + person role), purpose (e.g. "Review your application for Data Analyst"), requested items (with rung badges), duration offered, actions: **Allow selected**, **Not now**, **Decline**; "Why are they asking?" expander |
| Active sharing | Table/cards: recipient, purpose, data scope (items/categories), granted date, expires, last viewed, consent version; actions: **Edit scope**, **Stop sharing** |
| History | Chronological list of grants/revocations with versions |
| Defaults | Per data group default (Private / Recruiters I allow / Public), discoverability to recruiters, outreach preferences |
| Aside | Plain-language "What stopping sharing does and does not do" |

### Grant / edit dialog fields
| Field | Type | Req. | Rule |
|---|---|---|---|
| Recipient | read-only (org/person or "verified recruiters I allow") | — | Named; no wildcard grants |
| Purpose | read-only chosen from versioned list | — | Shown in plain language + version id |
| Items | checkbox list with rung badges | Yes (≥1) | Includes "files too?" toggle per item |
| Duration | radio | Yes | 30 days · 90 days · 1 year · Until I stop (default shortest) |
| Confirm | button "Allow" | — | Summary sentence read-back (C1) |

### Interaction states
| State | Behaviour |
|---|---|
| Loading | Skeleton cards |
| Empty | "You haven't shared anything yet. By default, nobody can see your evidence." |
| Request pending | Notification badge; no auto-grant; expires after 30 days |
| Version change | Banner "Our sharing terms changed (v3). Review to keep sharing." Affected scopes marked "Needs review"; sharing continues only as originally consented (no silent widening) |
| Stop sharing | ▢ C2: "Acme will no longer be able to open these items. Anything they already downloaded can't be taken back; their policy says…" ; effect immediate for new reads |
| Conflict | Reload current state before showing confirmations (stale `If-Match`) |
| Offline | O-x: read-only saved copy; changes disabled with reason (consent is consequential) |
| Org withdrawn request | Card disappears with note in History |

### Navigation transitions
From a recruiter request notification (`?request=<id>`) scrolls to the card; "View access log" → ACC-10; item links → CAND-09.

### Acceptance
Every control has text state; no pre-ticked bundled consent; wording tested at grade ≈ 8; revoke is one clear path; keyboard-complete; announcements politely state results ("Stopped sharing with Acme").

---

## 15. Admin support-access console — SCR-ADM-02 `/admin/support` (+ ADM-03 request, ADM-04 session) (MOD-ADM)

**Purpose:** Let a support operator (P5 Sam) obtain **scoped, time-boxed, reason-coded, audited, read-only** access to a user's data to resolve a case (INV-T18, BR-T041), and make that access visible to the user. **Roles:** SUP, ADM (AUD read-only). **Layout:** `default` + persistent `Banner` while a grant is active (z-index above content).

### Regions (ADM-02)
| Region | Content |
|---|---|
| Header | `h1` "Support access"; role notice "All views are logged and visible to the person" |
| Active grants | Cards: subject (masked: initials + id suffix), scope chips, reason code, case id, **time left** (text, updates every 5 min), "Open session", "End access now" |
| Request access | Primary button → ADM-03 (disabled with reason if no case id) |
| Cases | Table: case id, status, subject (masked), age, SLA, assigned, "Request access" row action |
| Recent grants | Ended/expired grants with duration and view count (own only; ADM sees all) |

### Request form (ADM-03) fields
| Field | Type | Req. | Rule |
|---|---|---|---|
| Subject | picker (directory search, min fields) | Yes | Resolves to one account/org |
| Case id | select from open cases assigned to me | Yes | No grant without a case |
| Reason code | select | Yes | e.g. Account access issue · Data-rights assistance · Billing dispute · Abuse report investigation · Bug reproduction (consented) — list governed [OPEN-UX-23] |
| Scope | checkbox group | Yes (≥1) | Profile basics · Evidence metadata · Applications summary · Billing summary · Messages metadata (not content) · Security events; **message content, passwords, tokens, raw artifacts are not available to support** |
| Duration | radio | Yes | 30 min · 1 h · 2 h · 4 h (**max 4 h**, BR-T041); default 1 h |
| Justification | textarea | Yes | 20–500 chars; guidance "Do not paste personal data here" |
| Acknowledgement | checkbox | Yes | "I understand this access is logged and visible to the person." |
| Step-up | passkey/code | Yes | Within 15 min |

### Session workspace (ADM-04) key regions
Persistent banner "Support access active — reason: Account access issue — expires 15:20 (1 h 12 m left)" with **End access now**; tabbed read-only views (only scopes granted); **masked fields** show `••••` with "Reveal" (reason + note ≥ 10 chars, per-field audit, auto re-mask in 5 min); case notes panel (ACT-SUP-05); "Assist data-rights request" and "Escalate" actions; **no edit/impersonate/send-as controls exist** (read-only by design; "view as user" is intentionally absent [OPEN-UX-28]).

### Interaction states
| State | Behaviour |
|---|---|
| No active grant | Empty state explains how to request; cases list still visible (no personal data) |
| Requesting | Button loading; on success banner + redirect to ADM-04 |
| Approval required (if OPEN-UX-23 → two-person) | Status "Waiting for approval from `<role>`"; no access until approved |
| Active, nearing expiry | At 10 min and 2 min: polite notice + "Request a new grant" (cannot extend; new justification required) |
| Expired mid-view | Content replaced immediately with "Access ended"; unsaved note draft kept |
| Subject notified | Access log entry created for the person (SCR-ACC-10) and notification, wording neutral |
| Policy violation attempts (unmask without reason, out-of-scope) | Blocked with explanation; attempt audited |
| Offline | O-n |

### Navigation transitions
Request → ADM-03 → ADM-04; End access → ADM-02; cases link to case tools (outside scope); directory → ADM-12.

### Acceptance
Banner present on every route during a grant (shell-level); countdown coarse and non-anxious for assistive tech; no keyboard shortcuts enabled by default; all actions audited with reason; support cannot see message bodies or secrets; privileged UI colours are not the only signal (icon + "Support access" text).

---

## 16. Coverage and open items

| Required screen | Spec | Section |
|---|---|---|
| Login | SCR-SHELL-02 | §1 |
| Onboarding | SCR-CAND-02 | §2 |
| Evidence create / detail | SCR-CAND-08 / 09 | §3 / §4 |
| Profile | SCR-CAND-03 | §5 |
| Job search | SCR-OPP-01 | §6 |
| Job detail + match explanation | SCR-OPP-02 | §7 |
| Application form | SCR-OPP-06 | §8 |
| Pipeline board | SCR-HIR-05 | §9 |
| Candidate review | SCR-HIR-06 | §10 |
| Referee form | SCR-SHELL-09 | §11 |
| Course player | SCR-LRN-04 | §12 |
| Assessment runner | SCR-LRN-09 | §13 |
| Consent manager | SCR-ACC-09 | §14 |
| Admin support-access console | SCR-ADM-02/03/04 | §15 |

| ID | Open item |
|---|---|
| OPEN-UX-28 | Whether a "view as user" mode is ever allowed to support operators (design excludes it; matrix grants S(R) read only). |
| OPEN-UX-29 | Referee disclosure level: full candidate name vs first name only; default proposed: full name, with candidate option to limit. |
| OPEN-UX-30 | Telemetry for integrity "page-leave" notes — scope, retention, and legal review before building. |




# Patch 2026-10-27: Field-level validation matrix (FLD-*)

**[TARGET].** Limits are copied from the action rows in ACTION_REGISTRY (cited per row); where this table adds a rule it is marked PROPOSED. Server is always authoritative (INV-T11); the client rule is a convenience and must never be stricter than the server except for obvious typing aids.

## Template (copy for each new field)

| Column | Meaning |
|---|---|
| FLD id / screen / ACT | Stable id `FLD-<area>-NN`, owning SCR-*, and the ACT that submits it |
| Type | Input component (DESIGN_SYSTEM 7.2) |
| Req | Yes / No / Conditional (state the condition) |
| Limits | Min/max length or range, with unit (code points, bytes, items) |
| Normalisation | Applied before validation and storage |
| Authority | C = client convenience only, S = server only, C+S = both; server decides |
| Error wording | Exact visible message pattern (what is wrong, how to fix; no blame) |
| Focus on error | Where focus goes (error summary for forms, field for single-field) |
| Preserve | What is kept after failure (all values except secrets) |
| Boundary test | min-1, min, max, max+1, and one hostile value |

**Global normalisation (PROPOSED):** Unicode NFC; trim leading/trailing whitespace; strip control characters except newline in multi-line fields; length counted in Unicode code points after normalisation (the same count shown by the character counter); emails lower-cased on the domain part only; no silent truncation, over-limit input is rejected with a message. Passwords are never trimmed, normalised, truncated or logged.

## Filled rows (top forms)

| FLD | Screen · ACT | Field | Type | Req | Limits | Normalisation | Authority | Error wording | Focus on error | Preserve | Boundary test |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FLD-AUTH-01 | SHELL-03 · ACT-AUTH-01 | Email | email TextField | Yes | RFC-valid, <=254 | trim; domain lower-case | C+S | "Enter an email like name@example.com" | Summary, then field | Email | 254 ok / 255 reject; `a@b`; mixed-case domain; leading space |
| FLD-AUTH-02 | SHELL-03 · ACT-AUTH-01 | Password | password with show/hide | Yes (or passkey) | >=12 chars; breach-list check; no composition rules; paste allowed | none | C+S (breach check S) | "Use at least 12 characters" / "This password appeared in a data breach. Choose another" | Field | Nothing (cleared) | 11 reject / 12 ok; known breached value; 1,000-char value; emoji |
| FLD-AUTH-03 | SHELL-04 · ACT-AUTH-02 | Confirmation code | OtpField | Yes | 6 digits | strip spaces, accept paste | C+S | "Code didn't match. 3 attempts left" | Field | Email context | 5 / 6 / 7 digits; letters; expired code |
| FLD-PRO-01 | CAND-03 · ACT-PRO-01 | Headline | TextField | No | <=120 | NFC, trim | C+S | "Headline is 3 characters too long" | Field | Entered text | 120 / 121; combining-mark string; RTL text |
| FLD-PRO-02 | CAND-03 · ACT-PRO-01 | Summary | TextArea | No | <=2000 | NFC, trim, keep newlines | C+S | as above | Field | Entered text | 2000 / 2001; 3-byte and 4-byte characters at limit |
| FLD-PRO-03 | CAND-03 · ACT-PRO-01 | Links | repeating URL | No | https only, <=5, each <=2048 | trim; punycode shown decoded with domain displayed | C+S | "Links must start with https://" | Field | All links | 5 / 6 links; `http://`; `javascript:`; IDN homograph |
| FLD-EVD-01 | CAND-08 · ACT-EVD-01 | Title | TextField | Yes | 3-120 | NFC, trim | C+S | "Add a title of at least 3 characters" | Summary | All fields | 2 / 3 / 120 / 121; whitespace-only |
| FLD-EVD-02 | CAND-08 · ACT-EVD-01 | Description | TextArea | Yes | 10-2000 | NFC, trim | C+S | "Describe what you did in at least 10 characters" | Summary | All fields | 9 / 10 / 2000 / 2001 |
| FLD-EVD-03 | CAND-08 · ACT-EVD-01 | Start/end date | DatePicker | Yes (start); end optional | end >= start, <= today (user-local day) | stored as date (no time) | C+S | "End date can't be before the start date" | Field | Dates | end = start; end = today; end = tomorrow; start after end |
| FLD-EVD-04 | CAND-08 · ACT-EVD-02 | File | FileDrop | No | <=10 files; pdf, docx, png, jpg, md, zip; <=25 MB each | filename sanitised; type sniffed on server | S authoritative, C pre-check | "report.pdf is over 25 MB. Choose a smaller file" | Summary | Other files and form | 25 MB / 25 MB + 1 byte; renamed `.exe`; zero-byte; 11th file |
| FLD-EVD-05 | CAND-08 · ACT-EVD-03 | Link | URL | No | https, <=2048, <=10 | trim | C+S | "Enter a link that starts with https://" | Field | Entered URL | 2048 / 2049; `javascript:`; private IP host (S rejects, SSRF guard) |
| FLD-APP-01 | OPP-06 · ACT-APP-03 | Evidence to attach | multi-select | No | <=10 own items | n/a | S | "You can share up to 10 items" | Field | Selection | 10 / 11; item revoked meanwhile |
| FLD-REF-01 | CAND-12 · ACT-VER-02 | Referee name | TextField | Yes | 2-80 | NFC, trim | C+S | "Enter the referee's name" | Summary | All fields | 1 / 2 / 80 / 81; single-name; non-Latin script |
| FLD-REF-02 | CAND-12 · ACT-VER-02 | Referee email | email | Yes | valid, not own email | as FLD-AUTH-01 | C+S | "Use an email that is not your own" | Summary | All fields | own email; own email with different case; plus-addressing |
| FLD-REF-03 | CAND-12 · ACT-VER-02 | Message | TextArea | No | <=500 | NFC, trim | C+S | counter text | Field | Entered text | 500 / 501 |
| FLD-MSG-01 | MSG-02 · ACT-MSG-01 | Message text | TextArea | Yes | 1-4000 | NFC; trim trailing | C+S | "Message is too long by N characters" | Field | Text and attachments | 4000 / 4001; whitespace-only; 4th attachment |
| FLD-PIPE-01 | HIR-06 · ACT-PIPE-08 | Note | TextArea | Yes | 1-5000 | NFC, trim | C+S | counter text | Field | Text | 5000 / 5001; sensitive-attribute hint shown, never blocks |
| FLD-PIPE-02 | HIR-06 · ACT-PIPE-05 | Reason category | Select | Yes | list | n/a | S | "Choose a reason" | Field | Note text | none selected; value not in list (S) |
| FLD-ORG-01 | HIR-15 · ACT-ORG-01 | Invitee emails | multi-entry | Yes | 1-50, valid, seats available | per FLD-AUTH-01; duplicates removed with notice | C+S | "3 addresses are not valid" with list | Field | Valid entries | 50 / 51; duplicate; seat limit |
| FLD-ORG-02 | HIR-16 · ACT-ORG-08 | Accent colour | colour | No | text contrast >= 4.5:1 on white | hex normalised | S | "This colour is too light. Try #xxxxxx" | Field | Choice | 4.49 / 4.5 ratio |

Open items: **OPEN-UX-34** (PROPOSED): code-point vs grapheme-cluster counting for limits shown to people (emoji sequences). **OPEN-UX-35** (PROPOSED): whether `N` normalisation (NFC) is applied to names displayed on credentials, where exact source spelling may matter.

# Legacy Merge B-10: Frontend Requirements, Web Journeys and UI Honesty Lessons (Prior Attempt)

Doc ID: LGM-B-10 · Owner: Frontend/Platform Architecture · Version 1.0 · Status: Draft for Review · Supersedes nothing · Relates: FEA-01, FEA-01-REV2, FD-F2, PWA-01, OFF-01, ADR-T02, ADR-T06, ADR-T10, UI-04, TEST-UI · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: `31_LEGACY_ARCHIVE/docs/engineering/TRD.md` (frontend parts), `.../engineering/CODE_STYLE.md` (React rules), `.../engineering/TARGET_ARCHITECTURE.md` (presentation layer), `.../system-model/02-flows.md` F7 (web journeys by role), `.../system-model/03-conflict-register.md` (CF-25, CF-26, CF-28, CF-29), `.../engineering/adr/ADR-016-*.md` (UI quality gates; full text in the testing file), and root `ARCHITECTURE.md` section 15.

## 0. Frame

- **No UI exists in this project.** The journeys, routes and counts below describe an *earlier attempt* (29 page components; React 19 + Vite; react-router; hooks and a session context). They are lessons and test seeds. "Target requires" lines tie them to FEA-01 and related design.
- The full Mermaid diagram of web journeys is preserved in `../25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` (F7). This file keeps the surrounding facts in text.

## 1. Legacy frontend requirements (preserved) and target mapping

| Legacy requirement | Target mapping |
|---|---|
| Feature-oriented modules; shared UI only after demonstrated reuse; no domain mutation directly from presentation components; server state separated from UI state; URL state for shareable filters/search (TRD section 3) | FEA-01 principles ("Server decides", thin shell); URL-state rule is a candidate FEA-01 requirement - verify it is stated (gap check L-B10-01) |
| React rules (CODE_STYLE section 4): functional components; hooks for behaviour; no business rules buried in JSX; accessible semantics; explicit loading, error and empty states | adopt as coding standard; "explicit loading/error/empty states" is a candidate acceptance criterion for every screen spec (07_UI_UX) |
| Presentation layer technology (legacy table): React + TypeScript + Vite PWA, React 18+, Tailwind, Radix | FEA-01 stack decisions govern (React 19, etc.); Tailwind/Radix choices must be checked against the design-system decision (07_) |
| Use design tokens from a shared package, no hard-coded colours or spacing in feature code (repository instruction of the prior attempt) | adopt as a lint rule (design-token lint) in the design system |
| Chrome extension and "Web OS layer" in the legacy corpus | extension: out of scope unless a new ADR (legacy ADR-006 "Chrome extension local-first" is a legacy-SSOT decision; see 11 legacy ADR table); "Web OS" replaced by a Career Workspace feature boundary (legacy V6 correction) |

## 2. Prior-attempt web application facts (as reported, 2026-10-23)

- Entry: `main.tsx` mounts React; `App.tsx` uses a browser router and a shared layout; 29 page components. Route guard (`RequireAuth`) checked **only that a token string exists** - no role check; role gating happened inside pages.
- **Anonymous routes:** `/`, `/jobs`, `/jobs/:id`, `/checkout`, `/privacy`, `/terms`, `/reference/:id` (referee link), `/verify/:hash` (public proof), `/login?return=<path>`, `/signup`.
- Sign-up routing: candidate -> `/dashboard`; recruiter -> `/hiring`. Login: 401 stays as a form error; after success the `return` path is followed **only if it starts with exactly one slash** (otherwise `/dashboard`) - hostile `return` values were tested in a UI sweep.
- **Navigation by role:** candidate - Dashboard, Jobs, Applications, Work history, Messages; menu: Profile, Settings. Recruiter / hiring manager - Dashboard, Hiring, Jobs, Messages. Platform admin - recruiter navigation plus Admin. Admin page: users, audit log, health, maintenance; a non-admin sees a "forbidden" notice.
- **Routes reachable only by URL, palette or in-page link (no navigation entry):** `/portfolio`, `/resumes`, `/network`, `/learning`, `/career`, `/assessments` (conflict CF-28: product decision on whether to link them; also `GET /challenges` public while `/assessments` guarded).
- Hiring screens: `/hiring`, `/hiring/jobs/:id` - move applicants, message an applicant; there are no `/hiring/*` API routes (they reuse organization, per-job applicant and transition endpoints).
- **401 handling:** any API call returning 401 *with a stored token* clears the token, remembers the reason and hard-redirects to `/login?return=...`; 403 retains the session. Sign-out clears the local token first and sends the server sign-out without waiting (a failed request leaves the server session alive until expiry). Session-end reason shown once on the sign-in page (tab-scoped storage, rendered as text).
- Layout read `.roles` from the stored user although the type declared `role` (compiled because of an index signature); whether navigation was wrong before the session loaded was untested (CF-29, speculative).

**Target requires:** (a) route guard UX only; policy decisions by the API (INV-T01); capabilities from `GET /me/capabilities` (ADR-T07); (b) every route has an entry in a route registry used for navigation, the sitemap of the UI sweep and permission hints, so no page is orphaned by accident (CF-28); (c) `return`/`returnTo` accepts only same-origin relative paths (single leading slash, no backslash, no protocol-relative) with a table-driven unit test; (d) 401/403 semantics: 401 -> clear and redirect with reason; 403 -> keep session and show forbidden state; (e) typed session object - no index-signature escape hatches for role fields.

## 3. UI honesty findings (CF-25, CF-26, CF-28) - requirement: the UI never promises what the system does not do

Prior attempt reported (each is a defect class to test against):

- Learning, Network and Resumes pages told users their data was **not saved permanently**, but the application-drafts and job-alerts screens offered features with in-memory state **without saying so** (CF-25).
- Settings offered email and summary-frequency toggles although **no digest sending or notification email** existed (CF-26); the Privacy page claimed k >= 10 with Laplace noise and "purge within 30 days" but no implementation was found (CF-26; erasure scheduler unresolved, issue #45).
- The Assessments page said submitted code is **not run or scored**; the footer showed "PWA Installable" although **no service worker was registered** and no offline mode existed.
- Several statements in docs and comments mentioned a "banned" status that did not exist (CF-19).

**Target requires:** (1) a **claims register**: every user-visible promise (privacy copy, settings toggles, install/offline claims, retention periods) maps to a feature id and a test; copy changes need the owner of the backing feature; (2) feature flags hide UI for unbuilt backends (no "preview" toggles that do nothing); (3) privacy statements (k thresholds, noise, purge windows) are generated from configuration values or reviewed by Legal (OPEN-08) before publication; (4) install and offline indicators are driven by actual capability detection (service worker controller present and offline smoke passes), not static text.

## 4. Client data layer lessons (as-built vs target FD-F2)

Prior attempt: React hooks plus a session context; a shared `apiFetch` attached the token and handled 401; `apiJson` added a **default 20-second timeout**, JSON/error parsing, throttle timing and server-error masking; a route error boundary caught render failures. There was no server-state cache library (the TRD had named TanStack Query but the build never adopted it - legacy conflict C-5).

Target decision already made: **FD-F2 TanStack Query v5** (single shell-owned QueryClient) - the as-built plain-fetch approach is the "Plain fetch + context [REF]" column in FEA-01's comparison. **Target requires** to carry over from the as-built helper: default request timeout with abort, uniform JSON/error parsing into the problem+json shape, user-visible throttle (`Retry-After`) handling, masking of server-error detail, a top-level error boundary, and a `meta.offline` declaration on each query (FEA-01).

## 5. UI quality gates (ADR-016) - pointer

Browser-measured accessibility, responsive (320-2560 px) and hostile-use gates, the hostile-input list, and the "add a flow to the UI sweep for every new page" action are preserved in `../16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` section 7. Accessibility limits reported: no automated contrast check, no screen-reader verification in CI.

## 6. PWA/offline claims

The PWA manifest and capability detection existed; offline readiness was detected from an existing service-worker *controller*, not implemented by installing one; no durable offline mutation or sync system existed. See `../08_PWA_AND_MOBILE/LEGACY_MERGE_PWA_AND_OFFLINE.md`.

## 7. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B10-01 | Gap check: URL-state-for-shareable-filters and "explicit loading/error/empty states" appear as FEA-01 requirements | Frontend Architect |
| L-B10-02 | Claims register (privacy copy, toggles, install/offline text) with feature mapping and owner | Product Director + Legal |
| L-B10-03 | Route registry as single source for nav, UI sweep and permission hints | Frontend Architect |
| L-B10-04 | Whether orphan-by-URL pages (portfolio, resumes, network, learning, career, assessments) are intended entry points - product decision (CF-28) | Product Director |

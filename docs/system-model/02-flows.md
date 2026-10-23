# System model 02 — Flowcharts of verified current behaviour

Every diagram here is **current behaviour read from the code**, not target behaviour. Evidence is cited as `path:line` (line numbers are from 2026-10-23 and drift as files change). Evidence status per diagram:

- **Read + spot-checked** = an investigator read the code and the lead re-read the key lines.
- **Read** = an investigator read the code; not independently re-read by the lead.
- Nothing here was exercised end to end by this work except where a "Tests" line says so.

Abbreviations: S = `apps/api/src/server.ts`, A = `packages/domain/src/auth.ts`, C = `packages/contracts/src/index.ts`, D = `packages/domain/src/work-history-graph.ts`, W = `apps/web/src`.

## F1 — System architecture (Level 1)

Evidence: Read (storage and worker investigation). `ARCHITECTURE.md` was compared and disagrees in places (see `03-conflict-register.md`).

```mermaid
flowchart LR
  Browser["Browser PWA<br/>apps/web (React 19)"] -->|"fetch /api/v1, Bearer token"| API["Fastify API<br/>apps/api (single writer)"]
  API -->|"pg Pool, persist() one transaction"| PG[("PostgreSQL<br/>53 migrations")]
  API -->|"enqueue background_jobs"| PG
  Worker["Worker<br/>apps/worker"] -->|"claim FOR UPDATE SKIP LOCKED"| PG
  Worker -->|"send email (Resend)"| Mail["Email provider"]
  API -->|"Checkout, Portal, cancel"| Stripe["Stripe"]
  Stripe -->|"signed webhook"| API
  Worker -->|"heartbeat every 10s"| PG
  API -->|"advisory lock 718201,1"| PG
```

The API also keeps in-memory Maps as a read model, hydrated from PostgreSQL at boot. Routes not listed in `apps/api/src/durability.ts` keep their state only in those Maps.

## F2 — Registration, sign-in and every authenticated request

Evidence: Read. Related tests exist (`tests/integration/auth-profile.test.ts`, `tests/security`).

```mermaid
flowchart TD
  R0([POST /auth/register]) --> R1{"IP limit<br/>20 per 15 min?"}
  R1 -- over --> E429[["429"]]
  R1 -- ok --> R2{"Body valid?<br/>email, password 8-256,<br/>name 2-120, role candidate or recruiter"}
  R2 -- no --> E400[["400"]]
  R2 -- yes --> R3{"Email already used?"}
  R3 -- yes --> E409[["409 CONFLICT"]]
  R3 -- no --> R4["Hash password (PBKDF2),<br/>persist user + profile in one transaction,<br/>mint 24 h token"]
  R4 --> R5[["201 token, user, profile"]]

  L0([POST /auth/login]) --> L1{"Limit 10 per 15 min<br/>per IP + email?"}
  L1 -- over --> E429
  L1 -- ok --> L2{"Email known and<br/>password correct?"}
  L2 -- "no (decoy hash runs, same message)" --> E401[["401 Invalid email or password"]]
  L2 -- yes --> L3["Re-hash if below 210k iterations<br/>(failure only logged)"]
  L3 --> L4[["200 token + status<br/>(suspended accounts can still sign in)"]]

  Q0([Any authenticated request]) --> Q1{"Bearer token<br/>present and signed?"}
  Q1 -- no --> E401b[["401"]]
  Q1 -- yes --> Q2{"sessionId revoked?"}
  Q2 -- yes --> E401b
  Q2 -- no --> Q3{"Account row exists?"}
  Q3 -- "no, pg storage" --> E401b
  Q3 -- "no, memory storage" --> Q6
  Q3 -- yes --> Q4{"Account erased?<br/>issuedAt before sessionsValidAfter?"}
  Q4 -- yes --> E401b
  Q4 -- no --> Q5{"Status active?"}
  Q5 -- "no, route not allowed" --> E403[["403"]]
  Q5 -- "yes or allowed route" --> Q6["Email and roles overwritten<br/>from the account row"]
  Q6 --> Q7([Handler runs])
```

Sign-out: a token with a `sessionId` is written to `revoked_sessions` (`{ended:true}`); a token minted before 2026-10-11 has none, so nothing is revoked and the call returns `{ended:false}`. Sign-out-others moves `sessionsValidAfter` to the next second and returns a fresh token. Password change returns 422 for a wrong current or an unchanged password, then returns a fresh token. The web client clears its stored token first and then sends sign-out without waiting, so a failed request leaves the server session alive until the token expires.

## F3 — Jobs and the application loop

Evidence: Read. There are no `/hiring/*` API routes; the hiring pages call `/organizations/*`, `/jobs/:id/applications` and `/applications/:id/transition`.

```mermaid
flowchart TD
  J0([POST /jobs]) --> J1{"Member of org<br/>or platform_admin?"}
  J1 -- no --> E403[["403 (BR-12)"]]
  J1 -- yes --> J2{"Skill ids exist?"}
  J2 -- no --> E404[["404"]]
  J2 -- yes --> J3{"recruiter or platform_admin role,<br/>title, description, location, salary valid?"}
  J3 -- no --> E403b[["403 or 422"]]
  J3 -- yes --> J4[["201 job in status draft"]]

  S0([PATCH /jobs/:id/status]) --> S1{"Transition allowed?<br/>draft to pending_approval, published or archived;<br/>pending_approval to approved, draft, archived;<br/>approved to published, draft, archived;<br/>published to paused, closed, archived;<br/>paused to published, closed, archived;<br/>closed to archived"}
  S1 -- no --> E409[["409 INVALID_STATE_TRANSITION"]]
  S1 -- yes --> S2{"platform_admin, or recruiter<br/>with matching org?"}
  S2 -- no --> E403b
  S2 -- yes --> S3["persist with base check<br/>(409 if changed concurrently)"]
  S3 --> S4["On first publish: evaluate job alerts<br/>(in memory only)"]

  A0([POST /jobs/:id/apply]) --> A1{"Profile and job exist?"}
  A1 -- no --> E404
  A1 -- yes --> A2{"Evidence ids belong<br/>to the caller?"}
  A2 -- no --> E403b
  A2 -- yes --> A3{"Recruiter without candidate role?"}
  A3 -- yes --> E403b
  A3 -- no --> A4{"Job published? (BR-16)"}
  A4 -- no --> E422[["422"]]
  A4 -- yes --> A5{"Active application for this job<br/>and candidate? (BR-15)"}
  A5 -- yes --> E409
  A5 -- no --> A6["persist application +<br/>notification per org member<br/>in one transaction"]
  A6 --> A7[["201 status submitted"]]
```

Order note (adversarial review): in `transitionJobStatus` the role and organization check runs before the transition table, so a caller with the wrong role gets 403 even for a transition that would also be invalid (the diagram draws the table first).

Application states: `submitted` to `in_review`, `withdrawn` or `rejected`; `in_review` to `shortlisted`, `rejected` or `withdrawn`; `shortlisted` to `interviewing`, `rejected` or `withdrawn`; `interviewing` to `offered`, `rejected` or `withdrawn`; `offered` to `hired`, `rejected` or `withdrawn`. `hired`, `rejected`, `withdrawn` and `expired` are terminal. Withdraw is candidate-owner or admin only; every other move needs membership of the job's organization or admin. Any membership counts; the role inside the organization is not checked.

## F4 — Verified work history (the core promise)

Evidence: Read + spot-checked. The lead re-read that the referee token had no expiry (fixed afterwards: the link now stops working 30 days after the request) and that the email domain is taken from `org.website` only when `companyId` is set (`S:12274-12281`).

```mermaid
flowchart TD
  W0([POST /candidates/work-history]) --> W1{"Replay of clientRequestId?"}
  W1 -- yes --> W1a[["200 deduplicated"]]
  W1 -- no --> W2{"Company known, dates valid,<br/>none in the future?"}
  W2 -- no --> E422[["VALIDATION_FAILED"]]
  W2 -- yes --> W3[["201 role unverified, score 0"]]

  V0([POST /work-history/:id/verify-email]) --> V1{"Owner or admin?"}
  V1 -- no --> E403[["403"]]
  V1 -- yes --> V2{"Production or staging without a complete<br/>Resend setup (provider, API key,<br/>from-address, https APP_URL)?"}
  V2 -- yes --> E503[["503 nothing stored"]]
  V2 -- no --> V3{"Code supplied?"}
  V3 -- no --> V4{"Address eligible?<br/>not webmail or disposable;<br/>domain matches only if the role has a company with a website"}
  V4 -- no --> E422
  V4 -- yes --> V5["6-digit code, sha256 stored, 15 min,<br/>queue job carrying the plaintext code"]
  V5 --> V6[["202"]]
  V3 -- yes --> V7{"Challenge exists for this email?<br/>not expired? attempts below 5?"}
  V7 -- no --> E422
  V7 -- "5 wrong" --> E429[["RATE_LIMIT_EXCEEDED, new code needed"]]
  V7 -- yes --> V8{"Code correct?"}
  V8 -- no --> V9["attempts + 1"] --> E422
  V8 -- yes --> V10[["200 emailVerifiedAt set, challenge deleted, role rescored"]]

  F0([POST references/request]) --> F1{"Referee is the candidate<br/>by id or email?"}
  F1 -- yes --> E409[["409 CONFLICT"]]
  F1 -- no --> F2["128-bit token, sha256 stored,<br/>plaintext token in the job payload"]
  F2 --> F3[["201 (link valid 30 days)"]]

  G0([POST references/:id/submit]) --> G1{"Session is the candidate?"}
  G1 -- yes --> E403
  G1 -- no --> G2{"Token present, hash matches,<br/>link under 30 days old,<br/>status requested?"}
  G2 -- no --> E401[["403 UNAUTHORIZED or INVALID_STATE_TRANSITION"]]
  G2 -- yes --> G3{"Ratings integers 1 to 5?"}
  G3 -- no --> E422
  G3 -- yes --> G4[["submitted, tokenHash cleared (single use),<br/>role rescored, candidate notified"]]
```

Scoring (`D:262`): email verified +40; best valid reference manager +30, else peer +20, else +15; two or more valid references +15; average rating at least 4.0 +10; two or more independently endorsed skills +5; cap 100. Tier gold from 80, silver from 50, bronze from 25. Status `verified` from 25.

Delivery: in `NODE_ENV=development` (the default when unset) the worker only logs "DEV OUTBOX" and the job succeeds, code and link included in the log. Otherwise it sends through Resend; a missing key or from-address is a permanent failure with no retry.

## F5 — Stripe billing (Level 6)

Evidence: Read by the lead during this work; behaviour covered by `tests/integration/stripe-billing.test.ts` (run on 2026-10-23: passes). Not exercised against a real Stripe account.

```mermaid
flowchart TD
  K0([POST /billing/checkout]) --> K1{"Plan allowed for the role?"}
  K1 -- no --> E403[["403"]]
  K1 -- yes --> K2{"Price id in server catalog?"}
  K2 -- no --> E503[["503"]]
  K2 -- yes --> K3{"Live paid subscription?"}
  K3 -- yes --> E409[["409"]]
  K3 -- no --> K4["Create or reuse Stripe customer,<br/>create Checkout session with idempotency key"]
  K4 --> K5[["201 hosted checkout URL"]]

  H0([POST /billing/stripe-webhook]) --> H1{"Stripe-Signature valid<br/>over the raw body, not stale?"}
  H1 -- no --> E401[["401 nothing changed"]]
  H1 -- yes --> H2{"Event type"}
  H2 -- other --> Hi[["200 ignored"]]
  H2 -- "checkout.session.completed" --> H3{"Known account;<br/>customer not linked to another account?"}
  H3 -- no --> Hi
  H3 -- yes --> H4["Link customer only (no access yet)"]
  H2 -- "customer.subscription.*" --> H5{"Newer live subscription<br/>already recorded?"}
  H5 -- yes --> H6["Record event only"]
  H5 -- no --> H7{"Event older than stored state?"}
  H7 -- yes --> H6
  H7 -- no --> H8["Set status, tier from price catalog,<br/>entitlements only while active or trialing"]
  H2 -- "invoice.paid or payment_failed" --> H9["Upsert invoice (a paid invoice is terminal)"]
  H2 -- "charge.refunded" --> H10{"Fully refunded, in current period,<br/>payment belongs to the live subscription?"}
  H10 -- no --> H6
  H10 -- yes --> H11["Cancel at Stripe, then record;<br/>a Stripe failure throws so Stripe retries"]
  H4 --> H12[["200 processed or replayed<br/>(event id is unique)"]]
  H8 --> H12
  H9 --> H12
  H11 --> H12
```

## F6 — Boot, storage and background jobs

Evidence: Read.

```mermaid
flowchart TD
  B0([buildApp]) --> B1{"STORAGE"}
  B1 -- "memory (tests; refused when deployed)" --> B6
  B1 -- pg --> B2{"Database reachable?"}
  B2 -- no --> X1[["refuse to start"]]
  B2 -- yes --> B3{"Advisory lock 718201,1 acquired?"}
  B3 -- no --> X2[["refuse: a second writer exists"]]
  B3 -- yes --> B4["Hydrate in-memory Maps from the database"]
  B4 --> B6([Listen])
  B6 --> B7{"Writer lease lost later?"}
  B7 -- yes --> X3[["503 on every request"]]

  J0([dispatchJob]) --> J1["enqueue; an enqueue error is logged and swallowed<br/>(the event is lost, the request succeeds)"]
  W0([Worker claim cycle]) --> W1{"Row due or lease expired?"}
  W1 -- yes --> W2["lease 60 s, attempts + 1"]
  W2 --> W3{"Handler outcome"}
  W3 -- success --> W4[["complete (superseded if canceled)"]]
  W3 -- "PermanentJobError" --> W5[["failed, no retry"]]
  W3 -- "other error, attempts below 3" --> W6[["queued with backoff"]]
  W3 -- "attempts exhausted or no handler" --> W7[["dead"]]
```

## F7 — Web app journeys by role (Level 2)

Evidence: Read; per-page loading, empty and error states were only partly checked (see the limitations in `05-audit.md`). Route guard `RequireAuth` checks only that a token string exists; it does not check roles. Role gating happens inside pages.

```mermaid
flowchart TD
  Start([Visitor]) --> Pub{"Signed in?"}
  Pub -- no --> Anon["/  /jobs  /jobs/:id  /checkout  /privacy  /terms<br/>/reference/:id  /verify/:hash"]
  Anon -->|"Apply or guarded URL"| Login["/login?return=path"]
  Anon --> Signup["/signup"]
  Login -->|"401 stays a form error"| Login
  Login -->|"success, return must start with one slash"| Resume["Return path or /dashboard"]
  Signup -->|"candidate"| Dash["/dashboard"]
  Signup -->|"recruiter"| Hiring["/hiring"]

  Pub -- yes --> Role{"Role"}
  Role -- candidate --> Cand["Nav: Dashboard, Jobs, Applications, Work history, Messages<br/>Menu: Profile, Settings"]
  Role -- "recruiter, hiring_manager" --> Hire["Nav: Dashboard, Hiring, Jobs, Messages"]
  Role -- platform_admin --> Adm["Hire nav + Admin"]

  Cand --> Orph["Reachable only by URL, palette or in-page link:<br/>/portfolio /resumes /network /learning /career /assessments"]
  Hire --> HJ["/hiring then /hiring/jobs/:id<br/>move applicants, message an applicant"]
  Adm --> AP["/admin: users, audit log, health, maintenance<br/>non-admin sees a forbidden notice"]

  Any([Any API call returns 401]) --> Clear["Clear stored token, remember reason,<br/>hard redirect to /login?return="]
```

Status of claims in the UI (from the investigator, compared with `docs/reports/FEATURE_STATUS_2026-10-21.md`): the Learning, Network and Resumes pages tell the user their data is not saved permanently; the Assessments page says submitted code is not run or scored; there is no registered service worker, so the footer shows "PWA Installable" and no offline mode exists; Settings offers email and summary-frequency toggles although no digest sending was found.

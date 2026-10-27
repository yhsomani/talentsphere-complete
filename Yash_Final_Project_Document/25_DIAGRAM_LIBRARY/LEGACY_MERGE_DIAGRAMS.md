# Legacy Merge B-25: Prior-Attempt Diagrams Preserved Verbatim (Architecture, Auth, AI Safety, Flows F1-F7)

Doc ID: LGM-B-25 · Owner: Architecture · Version 1.0 · Status: Draft (Mermaid syntax not machine-validated; copied unchanged from the archive) · Supersedes nothing · Relates: DGM-01 (`SYSTEM_DIAGRAMS.md`), BE-01, SEC-02, ADR-T05, ADR-T06, ADR-T09, ADR-T12 · Ledger: `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_B.md`

Preservation instruction (project owner, verbatim): "i dont want to loos information keep everything in use untile it get improved".

Merged from legacy: root `ARCHITECTURE.md` section 2, `31_LEGACY_ARCHIVE/docs/engineering/TARGET_ARCHITECTURE.md` sections 2 and 11 (20.1, 20.3, 20.4), `31_LEGACY_ARCHIVE/docs/system-model/02-flows.md` (F1-F7).

## 0. Frame - read before using any diagram

- **None of these diagrams describes this project.** Sections 1, 3 are *intended* designs from the legacy "target architecture v6.0" (superseded in places by this blueprint's ADR-T series). Sections 2 and 4 are *as-built behaviour of an earlier attempt*, read from its code on 2026-10-23 (evidence tags "Read", "Read + spot-checked" in the source; nothing was exercised end to end except where a "Tests" line says so). Line numbers (`path:line`) in the text refer to the earlier attempt's repository and drift.
- Use: (a) as **reference flows** to compare with the target's own flows (DGM-01 sections 5-6 hold the target's apply-to-job and referee verification sequences); (b) as **test-case seeds** (every decision diamond is a branch to test); (c) as **negative lessons** (annotated around each diagram family).
- Diagram abbreviations in F1-F7 (S = API server file, A = auth module, C = contracts, D = work-history domain module, W = web source) refer to the earlier attempt's files.
- Each diagram is copied unchanged so that no information is lost; where a diagram contradicts this blueprint the conflict and decision are named next to it.

## 1. Legacy "target" runtime architecture (intended, v6.0)

Contradictions with this blueprint: uses client TanStack Query (consistent with FD-F2), Supabase Queues (blueprint: transactional outbox + worker, ADR-T09), selective realtime (OPEN-49) and a direct "Supabase Queues" box (no equivalent).

```mermaid
flowchart TB
    B[Browser / Installed PWA]
    B --> UI[React Feature UI]
    UI --> Q[TanStack Query / Client State]
    Q --> API[Fastify HTTP API]
    API --> APP[Application Use Cases]
    APP --> POL[Authorization / Privacy / AI Policy]
    APP --> DOM[Domain Modules]
    DOM --> DB[(PostgreSQL)]
    DB --> RLS[RLS / Grants]
    DOM --> ST[Storage]
    APP --> QUE[Supabase Queues]
    QUE --> W[Worker]
    APP --> RT[Selective Realtime]
    APP --> EXT[Integration Adapters]
    EXT --> PAY[Payment]
    EXT --> MAIL[Email]
    EXT --> VID[Media]
    EXT --> AI[AI Providers]
```

## 2. Prior-attempt architecture at a glance (as built, 2026-10-23)

Lesson: the API held in-memory Maps hydrated from the database (read model) in addition to the database; this is exactly what ADR-T05 removes.

```mermaid
flowchart LR
    Web[React + Vite] -->|HTTP /api/v1| API[Fastify API]
    API --> Contracts[Zod contracts]
    API --> Domain[Domain rules]
    API -->|core transaction| PG[(PostgreSQL)]
    PG -->|boot hydration| Maps[Core read model]
    API --> Maps
    API --> Preview[Ephemeral module Maps]
    API -->|billing adapter| Stripe[Stripe]
    API -->|enqueue| PG
    PG -->|leased claim| Worker[Worker]
    Worker -->|two mail handlers| Brevo[Brevo adapter / dev outbox]
```

## 3. Legacy system context, authentication sequence and AI safety flow (intended)

### 3.1 System context (legacy "20.1")

Contradictions with this blueprint: Supabase Auth as the auth box (blueprint: application sessions, ADR-T06); Chrome extension and "Web OS Layer" (not in scope); email provider named differently in different legacy places (the system context says Resend, the as-built code and operations docs say Brevo; blueprint: provider port with Brevo default, ADR-T20); media provider "Mux/CF Stream" (blueprint: provider-agnostic media, deferred); "LinkedIn optional" (blueprint: out of scope unless decided).

```mermaid
flowchart TB
    subgraph Users
        C[Candidates]
        R[Recruiters]
        I[Institution Admins]
        F[Faculty]
        A[Admins]
    end
    
    subgraph Frontend
        WEB[React/Vite Web App]
        EXT[Chrome Extension]
        PWA[PWA]
    end
    
    subgraph Edge
        MW[Edge Middleware]
        SA[HTTP application APIs]
        EH[Edge Handlers]
    end
    
    subgraph Core
        DOM[Domain Modules]
        OSL[Web OS Layer]
        AI[AI Router]
        Q[Queue]
    end
    
    subgraph Data
        AUTH[Supabase Auth]
        PG[(PostgreSQL)]
        RLS[RLS Policies]
        RT[Realtime]
        ST[Storage]
    end
    
    subgraph External
        STRIPE[Stripe]
        EMAIL[Resend]
        LLM[Gemini/Claude]
        MEDIA[Mux/CF Stream]
        LI[LinkedIn optional]
    end
    
    C & R & I & F & A --> WEB
    C --> EXT
    C --> PWA
    WEB --> MW
    EXT --> MW
    MW --> SA
    MW --> EH
    SA --> DOM
    DOM --> OSL
    DOM --> AI
    DOM --> Q
    DOM --> PG
    PG --- RLS
    MW --> AUTH
    DOM --> RT
    DOM --> ST
    EH --> STRIPE
    EH --> EMAIL
    AI --> LLM
    Q --> MEDIA
    DOM -.-> LI
```

### 3.2 Authentication flow (legacy "20.3")

Contradiction: a JWT issued by a managed auth provider, verified in "edge middleware", with the user id set as a local database setting for RLS. Blueprint: httpOnly cookie sessions issued by the application (ADR-T06), authorization by the policy module (ADR-T07), RLS keyed by session-scoped settings as defence in depth. Keep as the legacy intended RLS-binding idea ("set local app.user_id then apply RLS").

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant S as Supabase Auth
    participant MW as Edge Middleware
    participant D as Database
    
    U->>W: Credentials / OAuth
    W->>S: Authenticate
    S-->>W: JWT + refresh token
    W->>MW: Request with JWT
    MW->>MW: Verify + normalize role claims
    MW->>D: Set local app.user_id
    D->>D: Apply RLS policies
    D-->>W: Authorized data
    W-->>U: Rendered page
```

### 3.3 AI safety flow (legacy "20.4")

Unique content to keep: PII detection and redaction before prompt construction; **canary token and `user_content` fencing** in the prompt; output validation with a schema; if the canary leaks, **drop the response, alert and flag the account**; confidence bands: below 0.5 suppress, 0.5-0.7 show with a disclaimer, 0.7 and above show with evidence; optional human gate before the user sees a draft. Target mapping: ADR-T12 and SEC-02 / THREAT_MODEL (canary appears in both); verify that the confidence thresholds 0.5 / 0.7 and "flag account on canary leak" exist in the AI gateway design or record them as options (action L-B25-01, owner AI owner).

```mermaid
flowchart TD
    A[User Input] --> B[PII Detection]
    B --> C[Redaction]
    C --> D[Prompt Construction + canary + user_content fencing]
    D --> E[AI Provider]
    E --> F[Output Validation Zod]
    F --> G{Canary leaked?}
    G -->|Yes| H[Drop response + alert + flag account]
    G -->|No| I{Confidence}
    I -->|<0.5| J[Suppress]
    I -->|0.5-0.7| K[Show with disclaimer]
    I -->|≥0.7| L[Show with evidence]
    K --> M{Human review required?}
    L --> M
    M -->|Yes| N[Human Gate]
    M -->|No| O[User sees draft]
    N --> O
```

## 4. Prior-attempt behaviour flowcharts F1-F7 (verbatim, with the source's evidence statements)

The block after this guide is the whole legacy file `02-flows.md` after its title. Reading guide: F1 system architecture; F2 registration, sign-in and every authenticated request (rate limits, decoy hash, session checks, token cutoffs, sign-out semantics); F3 jobs and the application loop (transition tables for jobs and applications; order-of-checks note); F4 verified work history (challenge and reference flows, scoring weights, delivery behaviour); F5 payment-provider billing (checkout and webhook decision tree); F6 boot, storage and background jobs (writer lease, retry/dead rules); F7 web journeys by role (route guard behaviour, status of UI claims).

Target-side observations, by flow:

- **F2:** keep decoy hash and uniform error text; replace stateless token checks with the session table; password-change/sign-out-others cutoff becomes revoke-all; registration rate limits move to RL-AUTH. The "suspended accounts can still sign in" and "status not active -> 403 except allowed routes" behaviour is the data-rights-access rule (see the security file section 5.3).
- **F3:** job transitions listed (`draft -> pending_approval|published|archived`; `pending_approval -> approved|draft|archived`; `approved -> published|draft|archived`; `published -> paused|closed|archived`; `paused -> published|closed|archived`; `closed -> archived`) and application transitions (`submitted -> in_review|withdrawn|rejected`; `in_review -> shortlisted|rejected|withdrawn`; `shortlisted -> interviewing|rejected|withdrawn`; `interviewing -> offered|rejected|withdrawn`; `offered -> hired|rejected|withdrawn`; `hired|rejected|withdrawn|expired` terminal) are candidate inputs to SM-JOB and SM-APPLICATION; compare edge by edge (gap check L-B25-02, owner Domain Architect). Withdraw: candidate-owner or admin only. Order note: role/organization check ran before the transition-table check, so a wrong-role caller got 403 even for an invalid transition.
- **F4:** the scoring/tier tables and the referee flow feed the verification module; the dev-outbox behaviour (log code and link) is a lesson to avoid; the 30-day link expiry is superseded by the target's 14 days (decision L-B15-03).
- **F5:** event-handling tree is the template for the billing webhook test matrix (see the condition matrix BL-01..BL-09).
- **F6:** writer-lease nodes are retired; the job-outcome tree (success -> complete, permanent error -> failed, other error with attempts below 3 -> queued with backoff, exhausted or no handler -> dead) is kept.
- **F7:** route guard presence-only check, hard redirect on 401, role-based navigation (see `../10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md`).

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

## 5. Open items raised by this file

| ID | Question | Owner |
|---|---|---|
| L-B25-01 | AI safety flow thresholds (confidence 0.5 / 0.7) and canary-leak response in the gateway design | AI owner + Security Architect |
| L-B25-02 | Edge-by-edge comparison of legacy job/application transitions with SM-JOB and SM-APPLICATION | Domain Architect |
| L-B25-03 | Validate Mermaid syntax of this file (not machine-validated) | Documentation Architect |

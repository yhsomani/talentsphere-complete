# System Diagram Library

Doc ID: DGM-01 · Owner: Architecture · Version 1.0 · Status: Draft (Mermaid syntax not machine-validated — see `28_TRACEABILITY_AND_COVERAGE/TRACEABILITY_AND_VALIDATION.md` for documented checks)

## 1. Ecosystem / system context
```mermaid
flowchart LR
  Cand[Candidate / Learner] --> TS
  Rec[Recruiter / Hiring Manager] --> TS
  Inst[Institution / Faculty / Instructor] --> TS
  Ref[Referee - tokenised link] --> TS
  Ops[Support / Moderator / Admin] --> TS
  TS[TalentSphere PWA + API]
  TS --> Stripe[Stripe]
  TS --> Mail[Email provider]
  TS --> Push[Web Push services]
  TS --> LLM[AI model providers]
  TS --> Imp[Import sources e.g. resume export]
```

## 2. Container view (C4 level 2)
```mermaid
flowchart TB
  subgraph Browser
    SW[Service Worker + Cache/IndexedDB]
    Shell[Host Shell]
    R1[Candidate module]
    R2[Learning module]
    R3[Opportunities module]
    R4[Hiring module]
    R5[Messaging module]
    R6[Account module]
    R7[Admin module]
    Shell --> R1
    Shell --> R2
    Shell --> R3
    Shell --> R4
    Shell --> R5
    Shell --> R6
    Shell --> R7
    Shell --- SW
  end
  CDN[Optional federated mode: remote assets + signed manifest registry]
  BFF[BFF / session routes - cookies]
  API[API replicas - modular monolith]
  W[Worker - outbox dispatcher + jobs]
  SBX[Sandbox runner - isolated, no network]
  PG[(PostgreSQL + RLS + pgvector)]
  OBJ[(Object storage - signed URLs, AV scan)]
  Shell -. only if federation is activated .-> CDN
  Browser --> BFF
  BFF --> API
  API --> PG
  API --> OBJ
  W --> PG
  W --> Ext[Stripe / Email / Push / AI via ports]
  API --> SBX
```

## 3. Frontend dependency rules
```mermaid
flowchart LR
  Shell --> HostSDK[host-sdk contract]
  Shell --> UI[ui package]
  Remote[any remote] --> HostSDK
  Remote --> UI
  Remote --> APIClient[generated api-client]
  Remote -. FORBIDDEN .-> OtherRemote[another remote internals]
```

## 4. Trust boundaries
```mermaid
flowchart LR
  subgraph Untrusted[Untrusted: user device]
    JS[Shell + remotes share one JS realm]
    Cache[SW caches / IndexedDB]
  end
  subgraph Edge[Edge]
    CSP[CSP + server auth; SRI and signed manifests only if federated]
  end
  subgraph Trusted[Trusted server zone]
    BFF2[BFF] --> Policy[policy: can]
    Policy --> Mods[API modules]
    Mods --> DB[(RLS Postgres)]
  end
  JS -->|cookie-authenticated HTTPS| BFF2
  CSP --> JS
```

## 5. Sequence — apply to job (idempotent)
```mermaid
sequenceDiagram
  participant U as Candidate
  participant R as mf-opportunities
  participant A as API applications
  participant P as policy
  participant D as Postgres
  participant W as Worker
  U->>R: Submit (draft ok)
  R->>A: POST /applications (Idempotency-Key)
  A->>P: can(candidate, apply, job)
  A->>D: tx insert application (partial unique active) + outbox application.submitted
  D-->>A: committed
  A-->>R: 201 (or 200 replay with same body)
  W->>D: claim outbox (fenced)
  W->>W: notify recruiter, update search/match
```

## 6. Sequence — referee verification
```mermaid
sequenceDiagram
  participant C as Candidate
  participant A as API verification
  participant W as Worker
  participant E as Email port
  participant F as Referee
  C->>A: request reference for work claim
  A->>A: create request, store token HASH only, expiry 14d
  A->>W: outbox reference.requested
  W->>E: send link (raw token only in this message)
  F->>A: open link, submit attestation (token consumed)
  A->>A: SM-REFERENCE requested to completed evidence rung peer-attested
  A->>W: outbox verification.completed
```

## 7. Failure domains
```mermaid
flowchart TB
  Rx[single remote] -->|error boundary: other remotes keep working| Sh[shell + shared singletons]
  St[Stripe / Email / AI] -.timeout and circuit-breaker.-> Ap[API modules]
  Pg[(Postgres)] ==>|shared dependency: remotes degrade to cached read-only| Ap
```

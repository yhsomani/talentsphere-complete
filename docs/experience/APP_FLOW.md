# TalentSphere — APP_FLOW.md v6.0

Source cross-check: `431c425a`, 2026-10-23. The table below is the current
router; numbered sections retain the intended journey model and are not acceptance
claims. Request/error behavior is owned by [API_CONTRACTS.md](../engineering/API_CONTRACTS.md).

## Current browser routes

`App.tsx` wraps authenticated workspaces with `RequireAuth` (token presence only).
`SessionProvider` loads current user/profile/memberships from the API. Server
permissions still decide every protected action. A missing token redirects to
`/login?return=...`; the login helper validates local return paths.

| Routes | UI access / purpose |
| --- | --- |
| `/`, `/login`, `/signup` | Public landing and credentials |
| `/jobs`, `/jobs/:id` | Public browsing; application requires authentication |
| `/reference/:id` | Public shell; emailed token authorizes reference access/submission |
| `/verify/:hash` | Public proof verification |
| `/checkout`, `/privacy`, `/terms` | Public shells; purchase/account calls need a session; legal text is draft |
| `/dashboard`, `/profile`, `/settings` | Guarded account workspaces |
| `/applications`, `/evidence`, `/assessments` | Guarded application/evidence/challenge workflows |
| `/portfolio`, `/resumes`, `/network` | Guarded, with ephemeral feature state |
| `/learning`, `/learning/:id`, `/career` | Guarded course and career views; incomplete durable journey |
| `/notifications`, `/messages`, `/messages/:id` | Guarded messaging and notifications |
| `/hiring`, `/hiring/jobs/:id`, `/admin` | Guarded shells; API role/ownership checks remain essential |
| `*` | NotFoundPage |

`/register`, `/courses`, `/challenges`, `/career/*`, `/recruiter/*`,
`/hm/dashboard`, `/paths`, `/teach/*`, `/cart`, `/orders`, `/feed`, `/posts/:id`,
`/articles/:id`, `/communities`, `/events` and `/institution/*` below are planned
browser routes, not mounted routes. Backend endpoints with similar names do not
make those pages exist.

## 1. Navigation Model

### Public
`/`, `/login`, `/register`, `/verify/:hash`

### Authenticated core
`/dashboard`, `/profile`, `/jobs`, `/applications`, `/courses`, `/challenges`, `/messages`, `/notifications`, `/settings`

### Career intelligence
`/career/readiness`, `/career/transition`, `/career/benchmarks`, `/salaries`

### Recruiter
`/recruiter/search`, `/recruiter/pools`, `/recruiter/analytics`, `/hm/dashboard`

### Learning
`/paths`, `/teach/*`, `/cart`, `/checkout`, `/orders`

### Social
`/feed`, `/posts/:id`, `/articles/:id`, `/communities`, `/events`

### Institutional
`/institution/*`

## 2. Universal Request Flow

```text
User action
→ UI validation
→ API request
→ AuthN
→ AuthZ + purpose policy
→ domain validation
→ transaction
→ event/audit
→ response
→ query/cache update
→ user feedback
```

## 3. Candidate Core Flow

```text
Landing
→ Sign up / Sign in
→ Onboarding
→ Career goal
→ Skill profile
→ Gap analysis
→ Learning
→ Practice
→ Evidence
→ Career profile
→ Job discovery
→ Match explanation
→ Application
→ Interview
→ Outcome
→ Feedback
→ Next action
```

## 4. Recruiter Flow

```text
Organization setup
→ Job creation
→ Publish readiness
→ Candidate discovery
→ Evidence-aware review
→ Shortlist
→ Communication
→ Interview
→ Scorecard
→ Decision
→ Outcome record
```

## 5. Institution Flow

```text
Create tenant
→ Configure programs
→ Manage seats/users
→ Assign learning
→ Track progress
→ Assess
→ Credential
→ Employer transition
→ Graduation / independence
```

## 6. Recovery

```text
Failure
→ Explain what failed
→ Preserve user work
→ Retry safely
→ Offer alternate path
→ Confirm final state
```

## 7. State Preservation

Refresh/back/forward/mobile interruption must not cause silent data loss.

## 8. Critical Error Screens

- 401: session expired → reauthenticate without losing return intent.
- 403: explain access scope → do not leak existence-sensitive information.
- 404: safe not-found experience.
- 409: concurrency/idempotency conflict → show current state + recovery.
- 429: rate limit → show retry timing.
- 5xx: generic user message + request ID + retry.
- Maintenance: explain scope and retry path.

## 9. Assessment Flow

```text
Start assessment
→ bind session/policy
→ load protected content
→ answer
→ autosave
→ warning checkpoints
→ submit
→ server validation
→ score
→ result
```

No AI candidate assistance during AI_PROHIBITED.

## 10. Evidence Flow

```text
Evidence created
→ provenance recorded
→ validation
→ verification (when required)
→ status
→ capability update
→ matching/recommendation recalculation
→ audit
```

## 11. Detailed Behavioral Corpus

The complete corpus is canonical elsewhere: the 28 journeys (J-01 to J-28) are in [`JOURNEY_REGISTRY.md`](JOURNEY_REGISTRY.md), and the 66 workflows, integrity traces and state machines are in [`../registries/WORKFLOWS_AND_BUSINESS_RULES.md`](../registries/WORKFLOWS_AND_BUSINESS_RULES.md) §10. SSOT Part V holds the rules. This document is the navigation and application-flow view and does not repeat those definitions. A second copy of the workflow register that was here was removed on 2026-10-21.



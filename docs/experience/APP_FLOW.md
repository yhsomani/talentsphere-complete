# TalentSphere — APP_FLOW.md v6.0

> **Status: target navigation model.** Section 1 is the intended route map. Routes built in `apps/web/src/App.tsx` (2026-10-21): `/`, `/login`, `/signup`, `/jobs`, `/jobs/:id`, `/reference/:id`, `/verify/:hash`, `/checkout`, `/privacy`, `/terms`, `/dashboard`, `/applications`, `/evidence`, `/profile`, `/settings`, `/portfolio`, `/resumes`, `/network`, `/learning`, `/learning/:id`, `/career`, `/notifications`, `/messages`, `/messages/:id`, `/hiring`, `/hiring/jobs/:id`, `/assessments`, `/admin`. Section 1 routes **not built**: `/register` (the app uses `/signup`), `/courses`, `/challenges`, `/career/*`, `/recruiter/*`, `/hm/dashboard`, `/paths`, `/teach/*`, `/cart`, `/orders`, `/feed`, `/posts/:id`, `/articles/:id`, `/communities`, `/events`, `/institution/*`. Sections 2 to 10 are flow targets, not records of what runs.

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


